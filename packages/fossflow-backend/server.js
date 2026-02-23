import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Configuration from environment variables
const STORAGE_ENABLED = process.env.ENABLE_SERVER_STORAGE === 'true';
const STORAGE_PATH = process.env.STORAGE_PATH || '/data/diagrams';

// Git backup setting - can be changed at runtime via API
let gitBackupEnabled = process.env.ENABLE_GIT_BACKUP === 'true';

// Git backup helper functions
async function isGitRepository(dirPath) {
  try {
    await execAsync('git rev-parse --is-inside-work-tree', { cwd: dirPath });
    return true;
  } catch {
    return false;
  }
}

async function initGitRepository(dirPath) {
  try {
    console.log('[Git] Initializing git repository...');
    await execAsync('git init', { cwd: dirPath });

    // Configure git user for commits (use generic values if not set)
    try {
      await execAsync('git config user.email "fossflow@localhost"', { cwd: dirPath });
      await execAsync('git config user.name "FossFLOW Server"', { cwd: dirPath });
    } catch (configError) {
      console.warn('[Git] Could not set git config:', configError.message);
    }

    console.log('[Git] Repository initialized');
    return true;
  } catch (error) {
    console.error('[Git] Failed to initialize repository:', error.message);
    return false;
  }
}

async function gitCommit(dirPath, diagramId, diagramName, action = 'update') {
  try {
    // Check if git is available
    const isRepo = await isGitRepository(dirPath);
    if (!isRepo) {
      const initialized = await initGitRepository(dirPath);
      if (!initialized) {
        console.warn('[Git] Skipping commit - repository not available');
        return false;
      }
    }

    // Add the file
    const fileName = `${diagramId}.json`;
    await execAsync(`git add "${fileName}"`, { cwd: dirPath });

    // Check if there are changes to commit
    try {
      const { stdout } = await execAsync('git diff --cached --name-only', { cwd: dirPath });
      if (!stdout.trim()) {
        console.log('[Git] No changes to commit');
        return true;
      }
    } catch (diffError) {
      // Continue even if diff fails
    }

    // Create commit message
    const timestamp = new Date().toISOString();
    const message = `${action}: ${diagramName || diagramId} (${timestamp})`;

    await execAsync(`git commit -m "${message}"`, { cwd: dirPath });
    console.log(`[Git] Committed: ${message}`);
    return true;
  } catch (error) {
    console.error('[Git] Commit failed:', error.message);
    return false;
  }
}

async function gitCommitDelete(dirPath, diagramId) {
  try {
    const isRepo = await isGitRepository(dirPath);
    if (!isRepo) {
      return false;
    }

    const fileName = `${diagramId}.json`;

    // Stage the deletion
    await execAsync(`git add -u "${fileName}"`, { cwd: dirPath });

    // Create commit
    const timestamp = new Date().toISOString();
    const message = `delete: ${diagramId} (${timestamp})`;

    await execAsync(`git commit -m "${message}"`, { cwd: dirPath });
    console.log(`[Git] Committed deletion: ${message}`);
    return true;
  } catch (error) {
    console.error('[Git] Delete commit failed:', error.message);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check / Storage status endpoint
app.get('/api/storage/status', (req, res) => {
  res.json({
    enabled: STORAGE_ENABLED,
    gitBackup: gitBackupEnabled,
    storagePath: STORAGE_PATH,
    version: '1.0.0'
  });
});

// Update storage settings
app.put('/api/storage/settings', (req, res) => {
  const { gitBackup } = req.body;

  if (typeof gitBackup === 'boolean') {
    gitBackupEnabled = gitBackup;
    console.log(`[Settings] Git backup ${gitBackupEnabled ? 'enabled' : 'disabled'}`);

    // Initialize git repo if enabling and repo doesn't exist
    if (gitBackupEnabled && STORAGE_ENABLED) {
      isGitRepository(STORAGE_PATH).then(isRepo => {
        if (!isRepo) {
          initGitRepository(STORAGE_PATH);
        }
      });
    }
  }

  res.json({
    success: true,
    gitBackup: gitBackupEnabled
  });
});

// Get git history for a diagram
app.get('/api/diagrams/:id/history', async (req, res) => {
  if (!STORAGE_ENABLED) {
    return res.status(503).json({ error: 'Server storage is disabled' });
  }

  const diagramId = req.params.id;
  const fileName = `${diagramId}.json`;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const isRepo = await isGitRepository(STORAGE_PATH);
    if (!isRepo) {
      return res.json({ commits: [], message: 'Git repository not initialized' });
    }

    // Get commit history for this file with limit
    const { stdout } = await execAsync(
      `git log -n ${limit} --pretty=format:"%H|%s|%ci" -- "${fileName}"`,
      { cwd: STORAGE_PATH }
    );

    if (!stdout.trim()) {
      return res.json({ commits: [] });
    }

    const commits = stdout.trim().split('\n').map(line => {
      const [hash, message, date] = line.split('|');
      return { hash, message, date };
    });

    res.json({ commits });
  } catch (error) {
    console.error('[Git] Failed to get history:', error.message);
    res.json({ commits: [], error: error.message });
  }
});

// Get diagram content at a specific git commit hash
app.get('/api/diagrams/:id/history/:hash', async (req, res) => {
  if (!STORAGE_ENABLED) {
    return res.status(503).json({ error: 'Server storage is disabled' });
  }

  const diagramId = req.params.id;
  const commitHash = req.params.hash;
  const fileName = `${diagramId}.json`;

  console.log(`[GET /api/diagrams/${diagramId}/history/${commitHash}] Loading diagram at specific version...`);

  // Validate commit hash (should be hex characters only)
  if (!/^[a-f0-9]+$/i.test(commitHash)) {
    console.error(`[Git] Invalid commit hash format: ${commitHash}`);
    return res.status(400).json({ error: 'Invalid commit hash format' });
  }

  try {
    const isRepo = await isGitRepository(STORAGE_PATH);
    if (!isRepo) {
      return res.status(404).json({ error: 'Git repository not initialized' });
    }

    // Get file content at specific commit using relative path (./ prefix for git show)
    const gitCommand = `git show "${commitHash}:./${fileName}"`;
    console.log(`[GET /api/diagrams/${diagramId}/history/${commitHash}] Running: ${gitCommand}`);

    const { stdout, stderr } = await execAsync(gitCommand, { cwd: STORAGE_PATH });

    if (stderr) {
      console.warn(`[Git] stderr: ${stderr}`);
    }

    if (!stdout.trim()) {
      console.error(`[Git] Empty output for commit ${commitHash}`);
      return res.status(404).json({ error: 'Diagram version not found' });
    }

    const data = JSON.parse(stdout);
    console.log(`[GET /api/diagrams/${diagramId}/history/${commitHash}] Successfully loaded version, items: ${data.items?.length || 0}`);
    res.json(data);
  } catch (error) {
    console.error(`[Git] Failed to get diagram at commit ${commitHash}:`, error.message);
    if (error.message.includes('does not exist') || error.message.includes('not found') || error.message.includes('exists on disk')) {
      res.status(404).json({ error: 'Diagram version not found' });
    } else {
      res.status(500).json({ error: 'Failed to retrieve diagram version', details: error.message });
    }
  }
});

// Only enable storage endpoints if storage is enabled
if (STORAGE_ENABLED) {
  // Ensure storage directory exists
  async function ensureStorageDir() {
    try {
      await fs.access(STORAGE_PATH);
      console.log(`Storage directory exists: ${STORAGE_PATH}`);

      // Log current files
      const files = await fs.readdir(STORAGE_PATH);
      console.log(`Current files in storage: ${files.length} files`);
      if (files.length > 0) {
        console.log('Files:', files.join(', '));
      }
    } catch {
      console.log(`Creating storage directory: ${STORAGE_PATH}`);
      await fs.mkdir(STORAGE_PATH, { recursive: true });
      console.log(`Created storage directory: ${STORAGE_PATH}`);
    }
  }

  // Initialize storage
  ensureStorageDir().catch((err) => {
    console.error('Failed to initialize storage:', err);
  });

  // List all diagrams
  app.get('/api/diagrams', async (req, res) => {
    try {
      // First check if storage directory exists
      try {
        await fs.access(STORAGE_PATH);
      } catch (err) {
        console.error(`Storage directory does not exist: ${STORAGE_PATH}`);
        return res.json([]); // Return empty array if directory doesn't exist
      }

      const files = await fs.readdir(STORAGE_PATH);
      console.log(`Found ${files.length} files in ${STORAGE_PATH}:`, files);
      const diagrams = [];

      for (const file of files) {
        if (file.endsWith('.json') && file !== 'metadata.json') {
          try {
            const filePath = path.join(STORAGE_PATH, file);
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Extract name from various possible locations
            const name = data.name || data.title || 'Untitled Diagram';

            console.log(`Successfully read diagram: ${file} (name: ${name})`);

            diagrams.push({
              id: file.replace('.json', ''),
              name: name,
              lastModified: stats.mtime,
              size: stats.size
            });
          } catch (fileError) {
            console.error(`Error reading diagram file ${file}:`, fileError.message);
            // Skip this file and continue with others
            continue;
          }
        }
      }

      console.log(`Returning ${diagrams.length} diagrams`);
      res.json(diagrams);
    } catch (error) {
      console.error('Error listing diagrams:', error);
      res.status(500).json({ error: 'Failed to list diagrams', details: error.message });
    }
  });

  // Get specific diagram
  app.get('/api/diagrams/:id', async (req, res) => {
    const diagramId = req.params.id;
    console.log(`[GET /api/diagrams/${diagramId}] Loading diagram...`);

    try {
      const filePath = path.join(STORAGE_PATH, `${diagramId}.json`);
      console.log(`[GET /api/diagrams/${diagramId}] Reading from: ${filePath}`);

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      console.log(`[GET /api/diagrams/${diagramId}] Successfully loaded, size: ${content.length} bytes, items: ${data.items?.length || 0}`);
      res.json(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`[GET /api/diagrams/${diagramId}] Diagram not found`);
        res.status(404).json({ error: 'Diagram not found' });
      } else {
        console.error(`[GET /api/diagrams/${diagramId}] Error reading diagram:`, error);
        res.status(500).json({ error: 'Failed to read diagram' });
      }
    }
  });

  // Save or update diagram
  app.put('/api/diagrams/:id', async (req, res) => {
    const diagramId = req.params.id;
    console.log(`[PUT /api/diagrams/${diagramId}] Saving diagram...`);

    try {
      const filePath = path.join(STORAGE_PATH, `${diagramId}.json`);
      const data = {
        ...req.body,
        id: diagramId,
        lastModified: new Date().toISOString()
      };

      const iconCount = data.icons?.length || 0;
      const importedIconCount = (data.icons || []).filter(icon => icon.collection === 'imported').length;
      console.log(`[PUT /api/diagrams/${diagramId}] Writing to: ${filePath}`);
      console.log(`[PUT /api/diagrams/${diagramId}]   Items: ${data.items?.length || 0}, Icons: ${iconCount} (${importedIconCount} imported)`);

      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`[PUT /api/diagrams/${diagramId}] Successfully saved`);

      // Git backup if enabled
      if (gitBackupEnabled) {
        const diagramName = data.name || data.title || diagramId;
        gitCommit(STORAGE_PATH, diagramId, diagramName, 'update').catch(err => {
          console.error('[Git] Background commit error:', err.message);
        });
      }

      res.json({ success: true, id: diagramId });
    } catch (error) {
      console.error(`[PUT /api/diagrams/${diagramId}] Error saving diagram:`, error);
      res.status(500).json({ error: 'Failed to save diagram' });
    }
  });

  // Delete diagram
  app.delete('/api/diagrams/:id', async (req, res) => {
    const diagramId = req.params.id;
    try {
      const filePath = path.join(STORAGE_PATH, `${diagramId}.json`);
      await fs.unlink(filePath);

      // Git backup if enabled
      if (gitBackupEnabled) {
        gitCommitDelete(STORAGE_PATH, diagramId).catch(err => {
          console.error('[Git] Background delete commit error:', err.message);
        });
      }

      res.json({ success: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: 'Diagram not found' });
      } else {
        console.error('Error deleting diagram:', error);
        res.status(500).json({ error: 'Failed to delete diagram' });
      }
    }
  });

  // Create a new diagram
  app.post('/api/diagrams', async (req, res) => {
    try {
      const id = req.body.id || `diagram_${Date.now()}`;
      const filePath = path.join(STORAGE_PATH, `${id}.json`);

      // Check if already exists
      try {
        await fs.access(filePath);
        return res.status(409).json({ error: 'Diagram already exists' });
      } catch {
        // File doesn't exist, proceed
      }

      const data = {
        ...req.body,
        id,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      await fs.writeFile(filePath, JSON.stringify(data, null, 2));

      // Git backup if enabled
      if (gitBackupEnabled) {
        const diagramName = data.name || data.title || id;
        gitCommit(STORAGE_PATH, id, diagramName, 'create').catch(err => {
          console.error('[Git] Background create commit error:', err.message);
        });
      }

      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating diagram:', error);
      res.status(500).json({ error: 'Failed to create diagram' });
    }
  });

} else {
  // Storage disabled - return appropriate responses
  app.get('/api/diagrams', (req, res) => {
    res.status(503).json({ error: 'Server storage is disabled' });
  });
  
  app.get('/api/diagrams/:id', (req, res) => {
    res.status(503).json({ error: 'Server storage is disabled' });
  });
  
  app.put('/api/diagrams/:id', (req, res) => {
    res.status(503).json({ error: 'Server storage is disabled' });
  });
  
  app.delete('/api/diagrams/:id', (req, res) => {
    res.status(503).json({ error: 'Server storage is disabled' });
  });
  
  app.post('/api/diagrams', (req, res) => {
    res.status(503).json({ error: 'Server storage is disabled' });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`FossFLOW Backend Server running on port ${PORT}`);
  console.log(`Server storage: ${STORAGE_ENABLED ? 'ENABLED' : 'DISABLED'}`);
  if (STORAGE_ENABLED) {
    console.log(`Storage path: ${STORAGE_PATH}`);
    console.log(`Git backup: ${gitBackupEnabled ? 'ENABLED' : 'DISABLED'}`);
  }
});