// Mock window.location
const mockLocation = {
  hostname: 'localhost',
  port: '3000'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('storageManager basic operations', () => {
    let storageManager: any;

    beforeEach(() => {
      jest.resetModules();
      storageManager = require('../storageService').storageManager;
    });

    describe('getUserPreference', () => {
      it('should return true by default when no preference is set', () => {
        const preference = storageManager.getUserPreference();
        expect(preference).toBe(true);
      });

      it('should return saved preference', () => {
        localStorage.setItem('stackdraw-use-server-storage', 'false');
        // Need fresh module to read localStorage
        jest.resetModules();
        const sm = require('../storageService').storageManager;
        const preference = sm.getUserPreference();
        expect(preference).toBe(false);
      });
    });

    describe('setUserPreference', () => {
      it('should save preference to localStorage', () => {
        storageManager.setUserPreference(false);
        expect(localStorage.setItem).toHaveBeenCalledWith('stackdraw-use-server-storage', 'false');
      });
    });
  });

  describe('Session Storage', () => {
    let storageManager: any;

    beforeEach(async () => {
      jest.resetModules();
      storageManager = require('../storageService').storageManager;
      // Initialize with session storage (server not available)
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      await storageManager.initialize();
    });

    it('should not be server storage', () => {
      expect(storageManager.isServerStorage()).toBe(false);
    });

    describe('listDiagrams', () => {
      it('should return empty array when no diagrams exist', async () => {
        const storage = storageManager.getStorage();
        const diagrams = await storage.listDiagrams();
        expect(diagrams).toEqual([]);
      });
    });

    describe('saveDiagram and loadDiagram', () => {
      it('should save and load diagram', async () => {
        const storage = storageManager.getStorage();
        const data = {
          version: '1.0',
          title: 'Test',
          description: '',
          colors: [],
          icons: [],
          items: [],
          views: []
        };

        await storage.saveDiagram('test-id', data as any);
        const loaded = await storage.loadDiagram('test-id');

        expect(loaded.title).toBe('Test');
      });

      it('should throw error for non-existent diagram', async () => {
        const storage = storageManager.getStorage();
        await expect(storage.loadDiagram('nonexistent')).rejects.toThrow('Diagram not found');
      });
    });

    describe('deleteDiagram', () => {
      it('should delete diagram from storage', async () => {
        const storage = storageManager.getStorage();
        const data = { version: '1.0', title: 'Test', description: '', colors: [], icons: [], items: [], views: [] };

        await storage.saveDiagram('test-id', data as any);
        await storage.deleteDiagram('test-id');

        const diagrams = await storage.listDiagrams();
        expect(diagrams).toHaveLength(0);
      });
    });

    describe('createDiagram', () => {
      it('should create diagram with generated id', async () => {
        const storage = storageManager.getStorage();
        const data = { version: '1.0', title: 'Test', description: '', colors: [], icons: [], items: [], views: [] };

        const id = await storage.createDiagram(data as any);

        expect(id).toMatch(/^diagram_\d+$/);
      });
    });

    describe('isAvailable', () => {
      it('should always return true for session storage', async () => {
        const storage = storageManager.getStorage();
        const available = await storage.isAvailable();
        expect(available).toBe(true);
      });
    });

    describe('history operations', () => {
      it('should return empty array for getHistory', async () => {
        const history = await storageManager.getHistory('test-id');
        expect(history).toEqual([]);
      });

      it('should throw error for loadDiagramVersion', async () => {
        await expect(storageManager.loadDiagramVersion('test-id', 'hash123'))
          .rejects.toThrow('Version history is only available with server storage');
      });

      it('should return false for isHistoryAvailable', async () => {
        const available = await storageManager.isHistoryAvailable();
        expect(available).toBe(false);
      });
    });
  });

  describe('Server Storage', () => {
    let storageManager: any;

    beforeEach(async () => {
      jest.resetModules();
      localStorage.setItem('stackdraw-use-server-storage', 'true');
      storageManager = require('../storageService').storageManager;

      // Initialize with server storage
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enabled: true })
      });
      await storageManager.initialize();
    });

    it('should be server storage', () => {
      expect(storageManager.isServerStorage()).toBe(true);
    });

    describe('listDiagrams', () => {
      it('should fetch diagrams from server', async () => {
        const mockDiagrams = [
          { id: 'diagram1', name: 'Test 1', lastModified: '2024-01-01T00:00:00Z' },
          { id: 'diagram2', name: 'Test 2', lastModified: '2024-01-02T00:00:00Z' }
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDiagrams
        });

        const storage = storageManager.getStorage();
        const diagrams = await storage.listDiagrams();

        expect(diagrams).toHaveLength(2);
        expect(diagrams[0].lastModified).toBeInstanceOf(Date);
      });

      it('should throw error on fetch failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal Server Error'
        });

        const storage = storageManager.getStorage();

        await expect(storage.listDiagrams()).rejects.toThrow('Failed to list diagrams');
      });
    });

    describe('loadDiagram', () => {
      it('should fetch diagram from server', async () => {
        const mockData = { version: '1.0', title: 'Test', items: [{ id: '1' }] };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        });

        const storage = storageManager.getStorage();
        const data = await storage.loadDiagram('test-id');

        expect(data.title).toBe('Test');
      });

      it('should throw error on fetch failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => 'Not Found'
        });

        const storage = storageManager.getStorage();

        await expect(storage.loadDiagram('nonexistent')).rejects.toThrow('Failed to load diagram');
      });
    });

    describe('saveDiagram', () => {
      it('should send PUT request to server', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true
        });

        const storage = storageManager.getStorage();
        const data = { version: '1.0', title: 'Test' };

        await storage.saveDiagram('test-id', data as any);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/diagrams/test-id'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(data)
          })
        );
      });

      it('should throw error on save failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Server Error'
        });

        const storage = storageManager.getStorage();

        await expect(storage.saveDiagram('test-id', {} as any)).rejects.toThrow('Failed to save diagram');
      });
    });

    describe('deleteDiagram', () => {
      it('should send DELETE request to server', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true
        });

        const storage = storageManager.getStorage();
        await storage.deleteDiagram('test-id');

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/diagrams/test-id'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      it('should throw error on delete failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false
        });

        const storage = storageManager.getStorage();

        await expect(storage.deleteDiagram('test-id')).rejects.toThrow('Failed to delete diagram');
      });
    });

    describe('createDiagram', () => {
      it('should send POST request and return id', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'new-diagram-id' })
        });

        const storage = storageManager.getStorage();
        const id = await storage.createDiagram({} as any);

        expect(id).toBe('new-diagram-id');
      });

      it('should throw error on create failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false
        });

        const storage = storageManager.getStorage();

        await expect(storage.createDiagram({} as any)).rejects.toThrow('Failed to create diagram');
      });
    });

    describe('getHistory', () => {
      it('should fetch history from server', async () => {
        const mockCommits = [
          { hash: 'abc123', message: 'create: test', date: '2024-01-01' },
          { hash: 'def456', message: 'update: test', date: '2024-01-02' }
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ commits: mockCommits })
        });

        const history = await storageManager.getHistory('test-id');

        expect(history).toHaveLength(2);
        expect(history[0].action).toBe('create');
        expect(history[1].action).toBe('update');
      });

      it('should return empty array on error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const history = await storageManager.getHistory('test-id');

        expect(history).toEqual([]);
      });
    });

    describe('loadDiagramVersion', () => {
      it('should fetch specific version from server', async () => {
        const mockData = { version: '1.0', title: 'Old Version' };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        });

        const data = await storageManager.loadDiagramVersion('test-id', 'abc123');

        expect(data.title).toBe('Old Version');
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/diagrams/test-id/history/abc123'),
          expect.any(Object)
        );
      });

      it('should throw error on failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => 'Not found'
        });

        await expect(storageManager.loadDiagramVersion('test-id', 'bad-hash'))
          .rejects.toThrow('Failed to load diagram version');
      });
    });

    describe('isHistoryAvailable', () => {
      it('should return true when using server storage', async () => {
        const available = await storageManager.isHistoryAvailable();
        expect(available).toBe(true);
      });
    });
  });

  describe('Storage initialization', () => {
    let storageManager: any;

    beforeEach(() => {
      jest.resetModules();
      storageManager = require('../storageService').storageManager;
    });

    it('should use session storage when server is not available', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await storageManager.initialize();

      expect(storageManager.isServerStorage()).toBe(false);
    });

    it('should use session storage when server returns disabled', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enabled: false })
      });

      await storageManager.initialize();

      expect(storageManager.isServerStorage()).toBe(false);
    });

    it('should use server storage when available and preferred', async () => {
      localStorage.setItem('stackdraw-use-server-storage', 'true');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enabled: true })
      });

      await storageManager.initialize();

      expect(storageManager.isServerStorage()).toBe(true);
    });

    it('should use session storage when server available but not preferred', async () => {
      localStorage.setItem('stackdraw-use-server-storage', 'false');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enabled: true })
      });

      await storageManager.initialize();

      expect(storageManager.isServerStorage()).toBe(false);
    });

    it('should throw error when getting storage before initialization', () => {
      expect(() => storageManager.getStorage()).toThrow('Storage not initialized');
    });

    it('should allow re-initialization', async () => {
      // First init - server available
      localStorage.setItem('stackdraw-use-server-storage', 'true');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enabled: true })
      });
      await storageManager.initialize();
      expect(storageManager.isServerStorage()).toBe(true);

      // Change preference
      storageManager.setUserPreference(false);

      // Re-init - should use session storage now
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enabled: true })
      });
      await storageManager.reinitialize();
      expect(storageManager.isServerStorage()).toBe(false);
    });
  });
});
