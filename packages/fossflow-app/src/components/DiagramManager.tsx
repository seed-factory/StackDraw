import React, { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { storageManager, DiagramInfo, GitCommit } from '../services/storageService';
import './DiagramManager.css';

interface Props {
  onLoadDiagram: (id: string, data: any) => void;
  onClose: () => void;
}

interface HistoryState {
  diagramId: string;
  diagramName: string;
  commits: GitCommit[];
  loading: boolean;
}

export const DiagramManager: React.FC<Props> = ({
  onLoadDiagram,
  onClose
}) => {
  const [diagrams, setDiagrams] = useState<DiagramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isServerStorage, setIsServerStorage] = useState(false);
  const [historyState, setHistoryState] = useState<HistoryState | null>(null);
  const [restoringHash, setRestoringHash] = useState<string | null>(null);

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize storage if not already done
      await storageManager.initialize();
      const isServer = storageManager.isServerStorage();
      setIsServerStorage(isServer);

      // Load diagram list
      const storage = storageManager.getStorage();
      const list = await storage.listDiagrams();
      setDiagrams(list);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load diagrams';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const storage = storageManager.getStorage();
      const data = await storage.loadDiagram(id);

      onLoadDiagram(id, data);

      // Small delay to ensure parent component finishes state updates
      await new Promise((resolve) => {
        return setTimeout(resolve, 100);
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagram');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this diagram?')) {
      return;
    }

    try {
      const storage = storageManager.getStorage();
      await storage.deleteDiagram(id);
      await loadDiagrams(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diagram');
    }
  };

  const handleCopyShareLink = (id: string) => {
    const shareUrl = `${window.location.origin}/display/${id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        notifications.show({
          title: 'Share link copied',
          message: shareUrl,
          color: 'green'
        });
      })
      .catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');

        // Safely remove the temporary element
        try {
          if (textArea.parentNode === document.body) {
            document.body.removeChild(textArea);
          }
        } catch {
          // Ignore cleanup errors
        }

        notifications.show({
          title: 'Share link copied',
          message: shareUrl,
          color: 'green'
        });
      });
  };

  const handleShowHistory = async (diagram: DiagramInfo) => {
    setHistoryState({
      diagramId: diagram.id,
      diagramName: diagram.name,
      commits: [],
      loading: true
    });

    try {
      const commits = await storageManager.getHistory(diagram.id, 50);
      setHistoryState({
        diagramId: diagram.id,
        diagramName: diagram.name,
        commits,
        loading: false
      });
    } catch {
      setError('Failed to load version history');
      setHistoryState(null);
    }
  };

  const handleCloseHistory = () => {
    setHistoryState(null);
  };

  const handleLoadVersion = async (hash: string) => {
    if (!historyState) return;

    try {
      setLoading(true);
      setError(null);

      const data = await storageManager.loadDiagramVersion(historyState.diagramId, hash);

      onLoadDiagram(historyState.diagramId, data);
      await new Promise((resolve) => setTimeout(resolve, 100));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load version');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (hash: string, commit: GitCommit) => {
    if (!historyState) return;

    const confirmMessage = `Are you sure you want to restore this version?\n\nDate: ${new Date(commit.date).toLocaleString()}\nCommit: ${commit.message}\n\nThis will create a new save with the content from this version.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setRestoringHash(hash);
      setError(null);

      // Load the old version
      const data = await storageManager.loadDiagramVersion(historyState.diagramId, hash);

      // Save it as the current version
      const storage = storageManager.getStorage();
      await storage.saveDiagram(historyState.diagramId, data);

      // Load the restored version and close
      onLoadDiagram(historyState.diagramId, data);
      await new Promise((resolve) => setTimeout(resolve, 100));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore version');
    } finally {
      setRestoringHash(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action?: string) => {
    switch (action) {
      case 'create': return 'CREATE';
      case 'delete': return 'DELETE';
      case 'update':
      default: return 'UPDATE';
    }
  };

  return (
    <div className="diagram-manager-overlay">
      <div className="diagram-manager">
        <div className="diagram-manager-header">
          <h2>Diagram Manager</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="storage-info">
          <span
            className={`storage-badge ${isServerStorage ? 'server' : 'local'}`}
          >
            {isServerStorage ? '🌐 Server Storage' : '💾 Local Storage'}
          </span>
          {isServerStorage && (
            <span className="storage-note">
              Diagrams are saved on the server and available across all devices
            </span>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading diagrams...</div>
        ) : (
          <div className="diagram-list">
            {diagrams.length === 0 ? (
              <div className="empty-state">
                <p>No saved diagrams</p>
                <p className="hint">Save your current diagram to get started</p>
              </div>
            ) : (
              diagrams.map((diagram) => {
                return (
                  <div key={diagram.id} className="diagram-item">
                    <div className="diagram-info">
                      <h3>{diagram.name}</h3>
                      <span className="diagram-meta">
                        Last modified: {diagram.lastModified.toLocaleString()}
                        {diagram.size &&
                          ` • ${(diagram.size / 1024).toFixed(1)} KB`}
                      </span>
                    </div>
                    <div className="diagram-actions">
                      <button
                        className="action-button"
                        onClick={() => {
                          return handleLoad(diagram.id);
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load'}
                      </button>
                      {isServerStorage && (
                        <button
                          className="action-button history"
                          onClick={() => handleShowHistory(diagram)}
                          title="View version history"
                        >
                          History
                        </button>
                      )}
                      <button
                        className="action-button share"
                        onClick={() => {
                          return handleCopyShareLink(diagram.id);
                        }}
                        title="Copy shareable link"
                      >
                        Share
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => {
                          return handleDelete(diagram.id);
                        }}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* History Panel */}
        {historyState && (
          <div className="history-panel">
            <div className="history-panel-header">
              <h3>History: {historyState.diagramName}</h3>
              <button className="close-button" onClick={handleCloseHistory}>
                ×
              </button>
            </div>

            {historyState.loading ? (
              <div className="loading">Loading history...</div>
            ) : historyState.commits.length === 0 ? (
              <div className="empty-state">
                <p>No version history available</p>
                <p className="hint">Enable Git Backup in Settings to track changes</p>
              </div>
            ) : (
              <div className="timeline">
                {historyState.commits.map((commit, index) => (
                  <div key={commit.hash} className="timeline-item">
                    <div className="timeline-dot-container">
                      <div className={`timeline-dot ${commit.action}`}></div>
                      {index < historyState.commits.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-date">{formatDate(commit.date)}</span>
                        <span className={`action-badge action-${commit.action}`}>
                          {getActionLabel(commit.action)}
                        </span>
                      </div>
                      <div className="timeline-message">{commit.message}</div>
                      <div className="timeline-actions">
                        <button
                          className="action-button small"
                          onClick={() => handleLoadVersion(commit.hash)}
                          disabled={loading || restoringHash !== null}
                        >
                          Load
                        </button>
                        {commit.action !== 'delete' && index > 0 && (
                          <button
                            className="action-button small restore"
                            onClick={() => handleRestoreVersion(commit.hash, commit)}
                            disabled={loading || restoringHash !== null}
                          >
                            {restoringHash === commit.hash ? 'Restoring...' : 'Restore'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
