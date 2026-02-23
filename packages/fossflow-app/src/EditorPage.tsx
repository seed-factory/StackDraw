import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Isoflow } from 'fossflow';
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import { useTranslation } from 'react-i18next';
import { DiagramData, mergeDiagramData, extractSavableData } from './diagramUtils';
import { DiagramManager } from './components/DiagramManager';
import { storageManager } from './services/storageService';
import ChangeLanguage from './components/ChangeLanguage';
import { allLocales } from 'fossflow';
import { useIconPackManager, IconPackName } from './services/iconPackManager';
import './App.css';

// Load core isoflow icons (always loaded)
const coreIcons = flattenCollections([isoflowIsopack]);


interface SavedDiagram {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

function EditorPage() {
  // Get readonly diagram ID from route params
  const { readonlyDiagramId } = useParams<{ readonlyDiagramId: string }>();
  const navigate = useNavigate();

  // Check if we're in readonly mode based on the URL
  const isReadonlyUrl = window.location.pathname.includes('/display/') && readonlyDiagramId;

  // Log warning if in display mode
  useEffect(() => {
    if (isReadonlyUrl) {
      console.warn('FossFLOW is running in read-only display mode. Editing is disabled.');
      console.log(`Viewing diagram: ${readonlyDiagramId}`);
    }
  }, [isReadonlyUrl, readonlyDiagramId]);

  // Initialize icon pack manager with core icons
  const iconPackManager = useIconPackManager(coreIcons);

  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<SavedDiagram | null>(null);
  const currentDiagramRef = useRef<SavedDiagram | null>(null); // Ref for sync access
  const isSavingRef = useRef<boolean>(false); // Prevent concurrent saves
  const [diagramName, setDiagramName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [fossflowKey, setFossflowKey] = useState(0); // Key to force re-render of FossFLOW
  const [currentModel, setCurrentModel] = useState<DiagramData | null>(null); // Store current model state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showDiagramManager, setShowDiagramManager] = useState(false);
  const [serverStorageAvailable, setServerStorageAvailable] = useState(false);

  // Initialize with empty diagram data
  // Create default colors for connectors
  const defaultColors = [
    { id: 'blue', value: '#0066cc' },
    { id: 'green', value: '#00aa00' },
    { id: 'red', value: '#cc0000' },
    { id: 'orange', value: '#ff6600' },
    { id: 'purple', value: '#9900cc' },
    { id: 'grey', value: '#666666' }
  ];

  const emptyDiagramData: DiagramData = {
    scene: {
      iconData: [],
      nodeData: [],
      connectorData: []
    },
    nonSceneData: {
      properties: {
        scale: 1,
        scrollX: 0,
        scrollY: 0,
        showGrid: true,
        showMinimap: false,
        showSceneInspector: false
      }
    },
    model: {
      categories: [],
      model: [],
      connectorColors: defaultColors
    }
  };

  const [diagramData, setDiagramData] = useState<DiagramData>(emptyDiagramData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Helper to update both state and ref synchronously
  const updateCurrentDiagram = (diagram: SavedDiagram | null) => {
    currentDiagramRef.current = diagram;
    setCurrentDiagram(diagram);
  };

  // Load diagram for readonly mode
  useEffect(() => {
    if (isReadonlyUrl && readonlyDiagramId) {
      // Initialize storage and load diagram
      storageManager.initialize().then(async () => {
        try {
          const storage = storageManager.getStorage();
          const diagramData = await storage.loadDiagram(readonlyDiagramId);

          if (diagramData) {
            const mergedData = mergeDiagramData(emptyDiagramData, diagramData);
            setDiagramData(mergedData);
            updateCurrentDiagram({
              id: readonlyDiagramId,
              name: diagramData.name || 'Diagram',
              data: mergedData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setDiagramName(diagramData.name || 'Diagram');
            setFossflowKey(prevKey => prevKey + 1);
          }
        } catch (error) {
          console.error(`Failed to load diagram with ID: ${readonlyDiagramId}`, error);
          // Redirect to home if diagram not found
          navigate('/');
        }
      }).catch(error => {
        console.error('Error initializing storage:', error);
        navigate('/');
      });
    }
  }, [readonlyDiagramId, isReadonlyUrl]);

  // Check server storage availability
  useEffect(() => {
    storageManager.initialize().then((storage) => {
      setServerStorageAvailable(storageManager.isServerStorage());
    });
  }, []);

  // Load saved diagrams from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fossflow_diagrams');
    if (saved) {
      try {
        const parsedDiagrams = JSON.parse(saved);
        setDiagrams(parsedDiagrams);
      } catch (error) {
        console.error('Failed to parse saved diagrams:', error);
      }
    }
  }, []);

  // Auto-save to localStorage every 30 seconds if there are unsaved changes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && currentModel && !isReadonlyUrl) {
        const autoSaveData = {
          ...currentDiagram,
          data: currentModel,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('fossflow_autosave', JSON.stringify(autoSaveData));
        setLastAutoSave(new Date());
        console.log('Auto-saved to localStorage');
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, currentModel, currentDiagram, isReadonlyUrl]);

  // Load auto-save on mount
  useEffect(() => {
    if (!isReadonlyUrl) {
      const autoSaveData = localStorage.getItem('fossflow_autosave');
      if (autoSaveData) {
        try {
          const parsed = JSON.parse(autoSaveData);
          if (window.confirm('An auto-saved diagram was found. Would you like to restore it?')) {
            const mergedData = mergeDiagramData(diagramData, parsed.data);
            setDiagramData(mergedData);
            setCurrentModel(mergedData);
            setDiagramName(parsed.name || '');
            updateCurrentDiagram(parsed);
            setFossflowKey(prevKey => prevKey + 1);
            localStorage.removeItem('fossflow_autosave'); // Clear auto-save after restoring
          }
        } catch (error) {
          console.error('Failed to parse auto-save data:', error);
        }
      }
    }
  }, []);

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isReadonlyUrl) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isReadonlyUrl]);

  const handleModelUpdated = (model: any) => {
    const updatedData = {
      ...diagramData,
      ...model
    };
    setCurrentModel(updatedData);

    // Only mark as having unsaved changes if not in readonly mode
    if (!isReadonlyUrl) {
      setHasUnsavedChanges(true);
    }
  };

  const saveDiagram = async () => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('Save already in progress, skipping...');
      return;
    }

    if (!diagramName.trim()) {
      alert('Please enter a name for the diagram');
      return;
    }

    // Mark as saving IMMEDIATELY (synchronously)
    isSavingRef.current = true;

    try {
      const diagramToSave = currentModel || diagramData;
      const savableData = extractSavableData(diagramToSave);
      const dataWithName = { ...savableData, name: diagramName };

      let finalId: string;

      // Use ref for synchronous access to current diagram (avoids stale closure)
      const currentDiag = currentDiagramRef.current;

      // If we have a currentDiagram, update it; otherwise create new
      if (currentDiag) {
        finalId = currentDiag.id;
        console.log('Updating existing diagram:', finalId);

        // Save to server first if available
        if (serverStorageAvailable) {
          try {
            const storage = storageManager.getStorage();
            await storage.saveDiagram(finalId, dataWithName);
            console.log('Diagram updated on server');
          } catch (err) {
            console.error('Failed to save to server:', err);
          }
        }
      } else {
        // Create new diagram - get ID from server if available
        console.log('Creating new diagram...');
        if (serverStorageAvailable) {
          try {
            const storage = storageManager.getStorage();
            finalId = await storage.createDiagram(dataWithName);
            console.log('Diagram created on server with ID:', finalId);

            // IMMEDIATELY update ref with the new ID to prevent race conditions
            // This ensures any concurrent save attempt will see we already have a diagram
            const preliminaryDiagram: SavedDiagram = {
              id: finalId,
              name: diagramName,
              data: savableData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            currentDiagramRef.current = preliminaryDiagram;
          } catch (err) {
            console.error('Failed to create on server:', err);
            // Fallback to local ID if server fails
            finalId = `diagram_${Date.now()}`;
          }
        } else {
          finalId = `diagram_${Date.now()}`;
        }
      }

      const newDiagram: SavedDiagram = {
        id: finalId,
        name: diagramName,
        data: savableData,
        createdAt: currentDiag?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const updatedDiagrams = currentDiag
        ? diagrams.map(d => d.id === currentDiag.id ? newDiagram : d)
        : [...diagrams, newDiagram];

      setDiagrams(updatedDiagrams);
      localStorage.setItem('fossflow_diagrams', JSON.stringify(updatedDiagrams));
      updateCurrentDiagram(newDiagram);

      setShowSaveDialog(false);
      setHasUnsavedChanges(false);
      // Clear auto-save after successful save
      localStorage.removeItem('fossflow_autosave');
    } finally {
      // Always clear saving flag
      isSavingRef.current = false;
    }
  };

  const loadDiagram = (diagram: SavedDiagram) => {
    const mergedData = mergeDiagramData(diagramData, diagram.data);
    setDiagramData(mergedData);
    setCurrentModel(mergedData);
    updateCurrentDiagram(diagram);
    setDiagramName(diagram.name);
    setShowLoadDialog(false);
    setHasUnsavedChanges(false);
    setFossflowKey(prevKey => prevKey + 1); // Force re-render FossFLOW
  };

  const deleteDiagram = (id: string) => {
    if (window.confirm('Are you sure you want to delete this diagram?')) {
      const updatedDiagrams = diagrams.filter(d => d.id !== id);
      setDiagrams(updatedDiagrams);
      localStorage.setItem('fossflow_diagrams', JSON.stringify(updatedDiagrams));

      if (currentDiagram?.id === id) {
        updateCurrentDiagram(null);
        setDiagramName('');
      }
    }
  };

  const exportDiagram = () => {
    const diagramToExport = currentModel || diagramData;
    const savableData = extractSavableData(diagramToExport);

    const exportData = {
      name: diagramName || 'stackdraw-diagram',
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: savableData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName || 'stackdraw-diagram'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();

    // Safely remove the temporary element
    try {
      if (a.parentNode === document.body) {
        document.body.removeChild(a);
      }
    } catch (err) {
      console.warn('Failed to remove temporary download link:', err);
    }

    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const importDiagram = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Merge the imported data with default data structure
        const mergedData = mergeDiagramData(diagramData, parsed.data || parsed);

        setDiagramData(mergedData);
        setCurrentModel(mergedData);
        setDiagramName(parsed.name || '');
        setHasUnsavedChanges(true);
        setFossflowKey(prevKey => prevKey + 1); // Force re-render FossFLOW

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Failed to import diagram:', error);
        alert('Failed to import diagram. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const createNewDiagram = () => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Do you want to continue?')) {
      return;
    }

    setDiagramData(emptyDiagramData);
    setCurrentModel(emptyDiagramData);
    updateCurrentDiagram(null);
    setDiagramName('');
    setHasUnsavedChanges(false);
    setFossflowKey(prevKey => prevKey + 1); // Force re-render FossFLOW
    // Clear auto-save when creating new diagram
    localStorage.removeItem('fossflow_autosave');
  };

  const handleDiagramManagerLoad = async (diagram: any) => {
    const mergedData = mergeDiagramData(diagramData, diagram.data);
    setDiagramData(mergedData);
    setCurrentModel(mergedData);
    updateCurrentDiagram({
      id: diagram.id,
      name: diagram.name,
      data: mergedData,
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt
    });
    setDiagramName(diagram.name);
    setHasUnsavedChanges(false);
    setFossflowKey(prevKey => prevKey + 1);
    setShowDiagramManager(false);
  };

  return (
    <div className="App">
      <div className="toolbar">
        {!isReadonlyUrl ? (
          <>
            <button onClick={createNewDiagram} title={t('toolbar.new')}>
              📄 {t('toolbar.new')}
            </button>
            <button onClick={() => setShowSaveDialog(true)} title={t('toolbar.save')}>
              💾 {t('toolbar.save')}
            </button>
            <button onClick={() => serverStorageAvailable ? setShowDiagramManager(true) : setShowLoadDialog(true)} title={t('toolbar.load')}>
              📁 {t('toolbar.load')}
            </button>
            <button onClick={() => setShowExportDialog(true)} title={t('toolbar.export')}>
              ⬇️ {t('toolbar.export')}
            </button>
            <button onClick={() => fileInputRef.current?.click()} title={t('toolbar.import')}>
              ⬆️ {t('toolbar.import')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={importDiagram}
            />

            <div className="toolbar-separator" />

            <span className="diagram-info">
              {currentDiagram ? `${t('toolbar.current')}: ${diagramName}` : t('toolbar.untitled')}
              {hasUnsavedChanges && ' *'}
            </span>

            {lastAutoSave && (
              <span className="auto-save-info">
                {t('toolbar.autoSaved')}: {lastAutoSave.toLocaleTimeString()}
              </span>
            )}
          </>
        ) : (
          <div className="readonly-badge">
            👁️ {t('dialog.readOnly.mode')} - {diagramName || readonlyDiagramId}
          </div>
        )}

        <div className="toolbar-right">
          <ChangeLanguage locales={allLocales} />
        </div>
      </div>

      <div className="main-content">
        <Isoflow
          key={fossflowKey}
          initialData={diagramData}
          onModelUpdated={handleModelUpdated}
          editorMode={isReadonlyUrl ? 'EXPLORABLE_READONLY' : 'EDITABLE'}
          icons={iconPackManager.icons}
          config={{
            onTogglePack: (packName: string, enabled: boolean) => {
              iconPackManager.togglePack(packName as any, enabled);
            }
          }}
        />
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>{t('dialog.save.title')}</h2>
            <div className="dialog-warning">
              <strong>⚠️ {t('dialog.save.warningTitle')}:</strong> {t('dialog.save.warningMessage')}
              <br />
              <span>
                {t('dialog.save.warningExportText')}{' '}
                <strong>{t('dialog.save.warningExportAction')}</strong>
                {t('dialog.save.warningExportSuffix')}
              </span>
            </div>
            <input
              type="text"
              placeholder={t('dialog.save.placeholder')}
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveDiagram()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={saveDiagram}>{t('dialog.save.btnSave')}</button>
              <button onClick={() => setShowSaveDialog(false)}>{t('dialog.save.btnCancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>{t('dialog.load.title')}</h2>
            <div className="dialog-warning">
              <strong>⚠️ {t('dialog.load.noteTitle')}:</strong> {t('dialog.load.noteMessage')}
            </div>
            <div className="diagram-list">
              {diagrams.length === 0 ? (
                <p>{t('dialog.load.noSavedDiagrams')}</p>
              ) : (
                diagrams.map(diagram => (
                  <div key={diagram.id} className="diagram-item">
                    <div>
                      <strong>{diagram.name}</strong>
                      <br />
                      <small>{t('dialog.load.updated')}: {new Date(diagram.updatedAt).toLocaleString()}</small>
                    </div>
                    <div className="diagram-actions">
                      <button onClick={() => loadDiagram(diagram)}>{t('dialog.load.btnLoad')}</button>
                      <button onClick={() => deleteDiagram(diagram.id)}>{t('dialog.load.btnDelete')}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowLoadDialog(false)}>{t('dialog.load.btnClose')}</button>
            </div>
          </div>
        </div>
      )}


      {/* Export Dialog */}
      {showExportDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>{t('dialog.export.title')}</h2>
            <div className="dialog-success">
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>✅ {t('dialog.export.recommendedTitle')}:</strong> {t('dialog.export.recommendedMessage')}
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {t('dialog.export.noteMessage')}
              </p>
            </div>
            <div className="dialog-buttons">
              <button onClick={exportDiagram}>{t('dialog.export.btnDownload')}</button>
              <button onClick={() => setShowExportDialog(false)}>{t('dialog.export.btnCancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Diagram Manager */}
      {showDiagramManager && (
        <DiagramManager
          onLoadDiagram={handleDiagramManagerLoad}
          onClose={() => setShowDiagramManager(false)}
        />
      )}
    </div>
  );
}

export default EditorPage;