import { Model } from 'fossflow/dist/types';

const USE_SERVER_STORAGE_KEY = 'stackdraw-use-server-storage';

export interface DiagramInfo {
  id: string;
  name: string;
  lastModified: Date;
  size?: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  date: string;
  action?: 'create' | 'update' | 'delete';
}

export interface StorageService {
  isAvailable(): Promise<boolean>;
  listDiagrams(): Promise<DiagramInfo[]>;
  loadDiagram(id: string): Promise<Model>;
  saveDiagram(id: string, data: Model): Promise<void>;
  deleteDiagram(id: string): Promise<void>;
  createDiagram(data: Model): Promise<string>;
}

// Server Storage Implementation
class ServerStorage implements StorageService {
  private baseUrl: string;
  private available: boolean | null = null;
  private availabilityCheckedAt: number | null = null;
  private readonly AVAILABILITY_CACHE_MS = 60000; // Re-check every 60 seconds

  constructor(baseUrl: string = '') {
    // In production (Docker), use relative paths (nginx proxy)
    // In development, use localhost:3001
    const isDevelopment = window.location.hostname === 'localhost' && window.location.port === '3000';
    this.baseUrl = baseUrl || (isDevelopment ? 'http://localhost:3001' : '');
  }

  async isAvailable(): Promise<boolean> {
    // Re-check availability if cache is stale
    const now = Date.now();
    if (this.available !== null &&
        this.availabilityCheckedAt !== null &&
        (now - this.availabilityCheckedAt) < this.AVAILABILITY_CACHE_MS) {
      return this.available;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/storage/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const data = await response.json();
      this.available = data.enabled;
      this.availabilityCheckedAt = Date.now();
      return this.available ?? false;
    } catch {
      this.available = false;
      this.availabilityCheckedAt = Date.now();
      return false;
    }
  }

  async listDiagrams(): Promise<DiagramInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/diagrams`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list diagrams: ${response.status} ${errorText}`);
    }

    const diagrams = await response.json();

    return diagrams.map((d: any) => ({
      ...d,
      lastModified: new Date(d.lastModified)
    }));
  }

  async loadDiagram(id: string): Promise<Model> {
    const response = await fetch(`${this.baseUrl}/api/diagrams/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to load diagram: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async saveDiagram(id: string, data: Model): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/diagrams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15000) // 15 second timeout for saves
    });

    if (!response.ok) {
      throw new Error(`Failed to save diagram: ${response.status}`);
    }
  }

  async deleteDiagram(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/diagrams/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete diagram');
  }

  async createDiagram(data: Model): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/diagrams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create diagram');
    const result = await response.json();
    return result.id;
  }

  async getHistory(id: string, limit: number = 50): Promise<GitCommit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/diagrams/${id}/history?limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const commits: GitCommit[] = (data.commits || []).map((commit: GitCommit) => {
        // Parse action from commit message (e.g., "create: ", "update: ", "delete: ")
        let action: 'create' | 'update' | 'delete' = 'update';
        if (commit.message.startsWith('create:')) action = 'create';
        else if (commit.message.startsWith('delete:')) action = 'delete';

        return {
          ...commit,
          action
        };
      });

      return commits;
    } catch {
      return [];
    }
  }

  async loadDiagramVersion(id: string, hash: string): Promise<Model> {
    const response = await fetch(`${this.baseUrl}/api/diagrams/${id}/history/${hash}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to load diagram version: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  }
}

// Session Storage Implementation (existing functionality)
class SessionStorage implements StorageService {
  private readonly KEY_PREFIX = 'stackdraw_diagram_';
  private readonly LIST_KEY = 'stackdraw_diagrams';

  async isAvailable(): Promise<boolean> {
    return true; // Session storage is always available
  }

  async listDiagrams(): Promise<DiagramInfo[]> {
    const listStr = sessionStorage.getItem(this.LIST_KEY);
    if (!listStr) return [];

    const list = JSON.parse(listStr);
    return list.map((item: any) => ({
      ...item,
      lastModified: new Date(item.lastModified)
    }));
  }

  async loadDiagram(id: string): Promise<Model> {
    const data = sessionStorage.getItem(`${this.KEY_PREFIX}${id}`);
    if (!data) throw new Error('Diagram not found');
    return JSON.parse(data);
  }

  async saveDiagram(id: string, data: Model): Promise<void> {
    sessionStorage.setItem(`${this.KEY_PREFIX}${id}`, JSON.stringify(data));

    // Update list
    const list = await this.listDiagrams();
    const existing = list.findIndex(d => d.id === id);
    const info: DiagramInfo = {
      id,
      name: (data as any).name || 'Untitled Diagram',
      lastModified: new Date(),
      size: JSON.stringify(data).length
    };

    if (existing >= 0) {
      list[existing] = info;
    } else {
      list.push(info);
    }

    sessionStorage.setItem(this.LIST_KEY, JSON.stringify(list));
  }

  async deleteDiagram(id: string): Promise<void> {
    sessionStorage.removeItem(`${this.KEY_PREFIX}${id}`);

    // Update list
    const list = await this.listDiagrams();
    const filtered = list.filter(d => d.id !== id);
    sessionStorage.setItem(this.LIST_KEY, JSON.stringify(filtered));
  }

  async createDiagram(data: Model): Promise<string> {
    const id = `diagram_${Date.now()}`;
    await this.saveDiagram(id, data);
    return id;
  }
}

// Storage Manager - decides which storage to use
class StorageManager {
  private serverStorage: ServerStorage;
  private sessionStorage: SessionStorage;
  private activeStorage: StorageService | null = null;

  constructor() {
    this.serverStorage = new ServerStorage();
    this.sessionStorage = new SessionStorage();
  }

  // Check if user prefers server storage
  getUserPreference(): boolean {
    const saved = localStorage.getItem(USE_SERVER_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true; // Default to true
  }

  // Set user preference
  setUserPreference(useServer: boolean): void {
    localStorage.setItem(USE_SERVER_STORAGE_KEY, String(useServer));
  }

  async initialize(): Promise<StorageService> {
    const userPrefersServer = this.getUserPreference();

    // Check if server storage is available
    const serverAvailable = await this.serverStorage.isAvailable();

    // Use server storage only if: available AND user prefers it
    if (serverAvailable && userPrefersServer) {
      this.activeStorage = this.serverStorage;
    } else {
      this.activeStorage = this.sessionStorage;
    }
    return this.activeStorage;
  }

  // Re-initialize storage based on current preference
  async reinitialize(): Promise<StorageService> {
    this.activeStorage = null;
    return this.initialize();
  }

  getStorage(): StorageService {
    if (!this.activeStorage) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }
    return this.activeStorage;
  }

  isServerStorage(): boolean {
    return this.activeStorage === this.serverStorage;
  }

  // Get history for a diagram (only works with server storage)
  async getHistory(id: string, limit: number = 50): Promise<GitCommit[]> {
    if (this.activeStorage === this.serverStorage) {
      return this.serverStorage.getHistory(id, limit);
    }
    return [];
  }

  // Load a specific version of a diagram (only works with server storage)
  async loadDiagramVersion(id: string, hash: string): Promise<Model> {
    if (this.activeStorage === this.serverStorage) {
      return this.serverStorage.loadDiagramVersion(id, hash);
    }
    throw new Error('Version history is only available with server storage');
  }

  // Check if history is available (server storage with git backup)
  async isHistoryAvailable(): Promise<boolean> {
    return this.activeStorage === this.serverStorage;
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
