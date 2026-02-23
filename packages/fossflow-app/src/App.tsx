import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MantineProvider, Button, useMantineColorScheme } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Isoflow } from 'fossflow';
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import { useTranslation } from 'react-i18next';
import {
  DiagramData,
  mergeDiagramData,
  extractSavableData
} from './diagramUtils';
import { StorageManager } from './StorageManager';
import { DiagramManager } from './components/DiagramManager';
import { storageManager } from './services/storageService';
import SplitButton from './components/SplitButton';
import { allLocales } from 'fossflow';
import { useIconPackManager, IconPackName } from './services/iconPackManager';
import i18n from './i18n';
import './App.css';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';

type ColorScheme = 'light' | 'dark' | 'auto';

// Detect system color scheme using matchMedia (works in all browsers including Chrome)
const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Get initial color scheme for MantineProvider
// IMPORTANT: Never return 'auto' - always resolve to actual 'light' or 'dark'
// This fixes Chrome not properly detecting system dark mode with Mantine's 'auto'
const getInitialColorScheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('stackdraw-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  // For 'auto' or no preference, explicitly detect system theme
  return getSystemColorScheme();
};

// Cache the initial color scheme to avoid re-reading on every render
const cachedInitialColorScheme = getInitialColorScheme();

// Load core isoflow icons (always loaded)
const coreIcons = flattenCollections([isoflowIsopack]);

// Empty main menu options - defined as constant to avoid re-renders
const EMPTY_MENU_OPTIONS: never[] = [];

// IsoFlow compatibility mapping - maps IsoFlow icon names to StackDraw equivalents
const ISOFLOW_ICON_MAPPING: Record<string, string> = {
  'web': 'desktop',
  'mobile': 'mobiledevice',
  'cdn': 'cloud',
  'load-balancer': 'loadbalancer',
  'security': 'lock',
  'function': 'function-module',
  'analytics': 'block',
  'database': 'storage',
  'api': 'server',
  'gateway': 'router',
  'user': 'user',
  'users': 'user',
  'email': 'mail',
  'notification': 'mail',
  'file': 'document',
  'files': 'document',
  'compute': 'server',
  'container': 'cube',
  'kubernetes': 'cube',
  'docker': 'cube',
  'lambda': 'function-module',
  'serverless': 'function-module',
  'messaging': 'queue',
  'pubsub': 'queue',
  'monitor': 'desktop',
  'logging': 'document',
  'metrics': 'block',
};

// Default fallback icon ID when no mapping exists
const FALLBACK_ICON_ID = 'block';

interface SavedDiagram {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

// Component that syncs color scheme changes from Isoflow to the outer MantineProvider
const ColorSchemeSyncer = () => {
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    // Apply the current theme setting
    const applyTheme = () => {
      const stored = localStorage.getItem('stackdraw-theme');
      if (stored === 'light' || stored === 'dark') {
        setColorScheme(stored);
      } else {
        // For 'auto' or unset: explicitly detect system preference
        // This fixes Chrome not properly detecting system dark mode
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setColorScheme(systemDark ? 'dark' : 'light');
      }
    };

    // Apply theme on mount
    applyTheme();

    // Listen for theme changes from Settings dialog
    const handleThemeChange = () => {
      applyTheme();
    };

    // Listen for system theme changes (when user changes OS theme)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const stored = localStorage.getItem('stackdraw-theme');
      // Only react to system changes if user has 'auto' or no preference set
      if (!stored || stored === 'auto') {
        applyTheme();
      }
    };

    // Listen for storage changes (when theme is changed)
    window.addEventListener('storage', handleThemeChange);

    // Listen for custom stackdraw theme change event
    window.addEventListener('stackdraw:themeChange', handleThemeChange);

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('stackdraw:themeChange', handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [setColorScheme]);

  return null;
};

function App() {
  // Get base path from PUBLIC_URL, ensure no trailing slash for React Router
  const publicUrl = process.env.PUBLIC_URL || '';
  // React Router basename should not have trailing slash
  const basename = publicUrl ? (publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl) : '/';

  return (
    <MantineProvider defaultColorScheme={cachedInitialColorScheme}>
      <Notifications position="top-right" />
      <ColorSchemeSyncer />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/display/:readonlyDiagramId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

function EditorPage() {
  // Initialize icon pack manager with core icons
  const iconPackManager = useIconPackManager(coreIcons);
  const { readonlyDiagramId } = useParams<{ readonlyDiagramId: string }>();

  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [isDiagramsInitialized, setIsDiagramsInitialized] = useState<boolean>(false);
  const [currentDiagram, setCurrentDiagram] = useState<SavedDiagram | null>(
    null
  );
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
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showDiagramManager, setShowDiagramManager] = useState(false);
  const [serverStorageAvailable, setServerStorageAvailable] = useState(false);
  const [storageInitError, setStorageInitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const isReadonlyUrl =
    window.location.pathname.startsWith('/display/') && readonlyDiagramId;

  // Initialize with empty diagram data
  // Create default colors for connectors
  const defaultColors = [
    { id: 'blue', value: '#0066cc' },
    { id: 'green', value: '#00aa00' },
    { id: 'red', value: '#cc0000' },
    { id: 'orange', value: '#ff9900' },
    { id: 'purple', value: '#9900cc' },
    { id: 'black', value: '#000000' },
    { id: 'gray', value: '#666666' }
  ];

  const [diagramData, setDiagramData] = useState<DiagramData>(() => {
    // Initialize with last opened data if available
    const lastOpenedData = localStorage.getItem('stackdraw-last-opened-data');
    if (lastOpenedData) {
      try {
        const data = JSON.parse(lastOpenedData);
        const importedIcons = (data.icons || []).filter((icon: any) => {
          return icon.collection === 'imported';
        });
        const mergedIcons = [...coreIcons, ...importedIcons];
        return {
          ...data,
          icons: mergedIcons,
          colors: data.colors?.length ? data.colors : defaultColors,
          fitToScreen: data.fitToScreen !== false
        };
      } catch {
        // Failed to load last opened data - use defaults
      }
    }

    // Default state if no saved data
    return {
      title: 'Untitled Diagram',
      icons: coreIcons,
      colors: defaultColors,
      items: [],
      views: [],
      fitToScreen: true
    };
  });

  // Check for server storage availability
  useEffect(() => {
    storageManager
      .initialize()
      .then(() => {
        setServerStorageAvailable(storageManager.isServerStorage());
        setStorageInitError(null);
      })
      .catch((error: Error) => {
        setStorageInitError(error.message || 'Storage initialization failed');
        setServerStorageAvailable(false);
      });
  }, []);

  // Listen for language change events from the Settings dialog
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<{ language: string }>) => {
      i18n.changeLanguage(event.detail.language);
    };

    window.addEventListener('stackdraw:languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('stackdraw:languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  // Check if readonlyDiagramId exists - if exists, load diagram in view-only mode
  useEffect(() => {
    if (!isReadonlyUrl || !serverStorageAvailable) return;
    const loadReadonlyDiagram = async () => {
      try {
        const storage = storageManager.getStorage();
        // Get diagram metadata
        const diagramList = await storage.listDiagrams();
        const diagramInfo = diagramList.find((d) => {
          return d.id === readonlyDiagramId;
        });
        // Load the diagram data from server storage
        const data = await storage.loadDiagram(readonlyDiagramId);
        // Convert to SavedDiagram interface format
        const readonlyDiagram: SavedDiagram = {
          id: readonlyDiagramId,
          name: diagramInfo?.name || data.title || 'Readonly Diagram',
          data: data,
          createdAt: new Date().toISOString(),
          updatedAt:
            diagramInfo?.lastModified.toISOString() || new Date().toISOString()
        };
        await loadDiagram(readonlyDiagram, true);
      } catch (error) {
        // Alert if unable to load readonly diagram and redirect to new diagram
        notifications.show({
          title: t('dialog.readOnly.failed'),
          message: '',
          color: 'red'
        });
        window.location.href = '/';
      }
    };
    loadReadonlyDiagram();
  }, [readonlyDiagramId, serverStorageAvailable]);

  // Update diagramData when loaded icons change
  useEffect(() => {
    setDiagramData((prev) => {
      return {
        ...prev,
        icons: [
          ...iconPackManager.loadedIcons,
          ...(prev.icons || []).filter((icon) => {
            return icon.collection === 'imported';
          })
        ]
      };
    });
  }, [iconPackManager.loadedIcons]);

  // Load diagrams from localStorage on component mount
  useEffect(() => {
    const savedDiagrams = localStorage.getItem('stackdraw-diagrams');
    if (savedDiagrams) {
      setDiagrams(JSON.parse(savedDiagrams));
      setIsDiagramsInitialized(true);
    }

    // Load last opened diagram metadata (data is already loaded in state initialization)
    const lastOpenedId = localStorage.getItem('stackdraw-last-opened');

    if (lastOpenedId && savedDiagrams) {
      try {
        const allDiagrams = JSON.parse(savedDiagrams);
        const lastDiagram = allDiagrams.find((d: SavedDiagram) => {
          return d.id === lastOpenedId;
        });
        if (lastDiagram) {
          updateCurrentDiagram(lastDiagram);
          setDiagramName(lastDiagram.name);
          // Also set currentModel to match diagramData
          setCurrentModel(diagramData);
        }
      } catch {
        // Failed to restore last diagram metadata
      }
    }
  }, []);

  // Save diagrams to localStorage whenever they change
  useEffect(() => {
    if (!isDiagramsInitialized) return;

    try {
      // Store diagrams without the full icon data
      const diagramsToStore = diagrams.map((d) => {
        return {
          ...d,
          data: {
            ...d.data,
            icons: [] // Don't store icons with each diagram
          }
        };
      });
      localStorage.setItem(
        'stackdraw-diagrams',
        JSON.stringify(diagramsToStore)
      );
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        notifications.show({
          title: t('alert.quotaExceeded'),
          message: '',
          color: 'red'
        });
      }
    }
  }, [diagrams]);

  // State to track if we're in "Save As" mode (creating a new copy)
  const [isSaveAsMode, setIsSaveAsMode] = useState(false);

  // Helper to update both state and ref synchronously
  const updateCurrentDiagram = (diagram: SavedDiagram | null) => {
    currentDiagramRef.current = diagram;
    setCurrentDiagram(diagram);
  };

  const saveDiagram = async (forceNew = false) => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      return;
    }

    if (!diagramName.trim()) {
      notifications.show({
        title: t('alert.enterDiagramName'),
        message: '',
        color: 'orange'
      });
      return;
    }

    // Mark as saving IMMEDIATELY (synchronously)
    isSavingRef.current = true;

    try {
      // Use forceNew parameter or isSaveAsMode state
      const createNewCopy = forceNew || isSaveAsMode;

      // Use ref for synchronous access to current diagram (avoids stale closure)
      const currentDiag = currentDiagramRef.current;

      // Check if a diagram with this name already exists
      // When creating new copy, check all diagrams; otherwise exclude current
      const existingDiagram = diagrams.find((d) => {
        if (createNewCopy) {
          return d.name === diagramName.trim();
        }
        return d.name === diagramName.trim() && d.id !== currentDiag?.id;
      });

      if (existingDiagram) {
        const confirmOverwrite = window.confirm(
          t('alert.diagramExists', { name: diagramName })
        );
        if (!confirmOverwrite) {
          return;
        }
      }

      // Construct save data - include only imported icons
      const importedIcons = (
        currentModel?.icons ||
        diagramData.icons ||
        []
      ).filter((icon) => {
        return icon.collection === 'imported';
      });

      const savedData = {
        title: diagramName,
        icons: importedIcons, // Save only imported icons with diagram
        colors: currentModel?.colors || diagramData.colors || [],
        items: currentModel?.items || diagramData.items || [],
        views: currentModel?.views || diagramData.views || [],
        fitToScreen: true
      };

      const dataWithName = { ...savedData, name: diagramName };
      let finalId: string;
      let finalCreatedAt: string;

      // Determine ID - FIRST save to server if available to get real ID
      if (serverStorageAvailable) {
        try {
          const storage = storageManager.getStorage();

          if (!createNewCopy && currentDiag) {
            // UPDATE existing diagram
            finalId = currentDiag.id;
            finalCreatedAt = currentDiag.createdAt;
            await storage.saveDiagram(finalId, dataWithName);
          } else if (existingDiagram) {
            // Replace existing diagram with same name
            finalId = existingDiagram.id;
            finalCreatedAt = existingDiagram.createdAt;
            await storage.saveDiagram(finalId, dataWithName);
          } else {
            // CREATE new diagram - get ID from server
            finalId = await storage.createDiagram(dataWithName);
            finalCreatedAt = new Date().toISOString();

            // IMMEDIATELY update ref to prevent race conditions
            currentDiagramRef.current = {
              id: finalId,
              name: diagramName,
              data: savedData,
              createdAt: finalCreatedAt,
              updatedAt: new Date().toISOString()
            };
          }
        } catch {
          // Fallback to local ID if server fails
          if (!createNewCopy && currentDiag) {
            finalId = currentDiag.id;
            finalCreatedAt = currentDiag.createdAt;
          } else if (existingDiagram) {
            finalId = existingDiagram.id;
            finalCreatedAt = existingDiagram.createdAt;
          } else {
            finalId = Date.now().toString();
            finalCreatedAt = new Date().toISOString();
          }
        }
      } else {
        // No server - use local IDs
        if (!createNewCopy && currentDiag) {
          finalId = currentDiag.id;
          finalCreatedAt = currentDiag.createdAt;
        } else if (existingDiagram) {
          finalId = existingDiagram.id;
          finalCreatedAt = existingDiagram.createdAt;
        } else {
          finalId = Date.now().toString();
          finalCreatedAt = new Date().toISOString();
        }
      }

      const newDiagram: SavedDiagram = {
        id: finalId,
        name: diagramName,
        data: savedData,
        createdAt: finalCreatedAt,
        updatedAt: new Date().toISOString()
      };

      // Update local diagrams list
      if (!createNewCopy && currentDiag) {
        // Update existing diagram (normal Save)
        setDiagrams(
          diagrams.map((d) => {
            return d.id === currentDiag.id ? newDiagram : d;
          })
        );
      } else if (existingDiagram) {
        // Replace existing diagram with same name
        setDiagrams(
          diagrams.map((d) => {
            return d.id === existingDiagram.id ? newDiagram : d;
          })
        );
      } else {
        // Add new diagram (Save As creates new entry)
        setDiagrams([...diagrams, newDiagram]);
      }

      updateCurrentDiagram(newDiagram);
      setShowSaveDialog(false);
      setIsSaveAsMode(false); // Reset save as mode
      setHasUnsavedChanges(false);
      setLastAutoSave(new Date());

      // Save as last opened
      try {
        localStorage.setItem('stackdraw-last-opened', newDiagram.id);
        localStorage.setItem(
          'stackdraw-last-opened-data',
          JSON.stringify(newDiagram.data)
        );
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          notifications.show({
            title: t('alert.storageFull'),
            message: '',
            color: 'red'
          });
        }
      }
    } finally {
      // Always clear saving flag
      isSavingRef.current = false;
    }
  };

  const loadDiagram = async (
    diagram: SavedDiagram,
    skipUnsavedCheck = false
  ) => {
    if (
      !skipUnsavedCheck &&
      hasUnsavedChanges &&
      !window.confirm(t('alert.unsavedChanges'))
    ) {
      return;
    }

    // Auto-detect and load required icon packs
    await iconPackManager.loadPacksForDiagram(diagram.data.items || []);

    // Merge imported icons with loaded icon set
    const importedIcons = (diagram.data.icons || []).filter((icon: any) => {
      return icon.collection === 'imported';
    });
    const mergedIcons = [...iconPackManager.loadedIcons, ...importedIcons];
    const dataWithIcons = {
      ...diagram.data,
      icons: mergedIcons
    };

    updateCurrentDiagram(diagram);
    setDiagramName(diagram.name);
    setDiagramData(dataWithIcons);
    setCurrentModel(dataWithIcons);
    setFossflowKey((prev) => {
      return prev + 1;
    }); // Force re-render of FossFLOW
    setShowLoadDialog(false);
    setHasUnsavedChanges(false);

    // Save as last opened (without icons)
    try {
      localStorage.setItem('stackdraw-last-opened', diagram.id);
      localStorage.setItem(
        'stackdraw-last-opened-data',
        JSON.stringify(diagram.data)
      );
    } catch {
      // Failed to save last opened
    }
  };

  const deleteDiagram = (id: string) => {
    if (window.confirm(t('alert.confirmDelete'))) {
      setDiagrams(
        diagrams.filter((d) => {
          return d.id !== id;
        })
      );
      if (currentDiagram?.id === id) {
        updateCurrentDiagram(null);
        setDiagramName('');
      }
    }
  };

  const newDiagram = () => {
    const message = hasUnsavedChanges
      ? t('alert.unsavedChangesExport')
      : t('alert.createNewDiagram');

    if (window.confirm(message)) {
      const emptyDiagram: DiagramData = {
        title: 'Untitled Diagram',
        icons: iconPackManager.loadedIcons, // Use currently loaded icons
        colors: defaultColors,
        items: [],
        views: [],
        fitToScreen: true
      };
      updateCurrentDiagram(null);
      setDiagramName('');
      setDiagramData(emptyDiagram);
      setCurrentModel(emptyDiagram); // Reset current model too
      setFossflowKey((prev) => {
        return prev + 1;
      }); // Force re-render of FossFLOW
      setHasUnsavedChanges(false);

      // Clear last opened
      localStorage.removeItem('stackdraw-last-opened');
      localStorage.removeItem('stackdraw-last-opened-data');
    }
  };

  const handleModelUpdated = (model: any) => {
    // Store the current model state whenever it updates
    // The model from Isoflow contains the COMPLETE state including all icons

    // Simply store the complete model as-is since it has everything
    const updatedModel = {
      title: model.title || diagramName || 'Untitled',
      icons: model.icons || [], // This already includes ALL icons (default + imported)
      colors: model.colors || defaultColors,
      items: model.items || [],
      views: model.views || [],
      fitToScreen: true
    };

    setCurrentModel(updatedModel);
    setDiagramData(updatedModel);

    if (!isReadonlyUrl) {
      setHasUnsavedChanges(true);
    }
  };

  // Memoize deduplicated icons to avoid recalculation on every render
  const allUniqueIcons = useMemo(() => {
    const modelToUse = currentModel || diagramData;
    const allModelIcons = modelToUse.icons || [];
    const diagramImportedIcons = (diagramData.icons || []).filter((icon) => {
      return icon.collection === 'imported';
    });

    // Create a map to deduplicate icons by ID
    const iconMap = new Map();
    allModelIcons.forEach((icon) => iconMap.set(icon.id, icon));
    diagramImportedIcons.forEach((icon) => {
      if (!iconMap.has(icon.id)) {
        iconMap.set(icon.id, icon);
      }
    });

    return Array.from(iconMap.values());
  }, [currentModel, diagramData]);

  const exportDiagram = useCallback(() => {
    const modelToExport = currentModel || diagramData;

    const exportData = {
      title: diagramName || modelToExport.title || 'Exported Diagram',
      icons: allUniqueIcons,
      colors: modelToExport.colors || [],
      items: modelToExport.items || [],
      views: modelToExport.views || [],
      fitToScreen: true
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName || 'diagram'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportDialog(false);
    setHasUnsavedChanges(false);
  }, [currentModel, diagramData, diagramName, allUniqueIcons]);

  // Export as compact JSON (smaller file size, minimal format)
  const exportAsCompactJSON = useCallback(() => {
    const modelToExport = currentModel || diagramData;

    // Transform to compact format
    const items = modelToExport.items || [];
    const views = modelToExport.views || [];

    // Create index map for O(1) lookups instead of O(n) findIndex calls
    const itemIndexMap = new Map<string, number>();
    items.forEach((item: any, index: number) => {
      itemIndexMap.set(item.id, index);
    });

    const compactItems = items.map((item: any) => [
      (item.name || '').substring(0, 30),
      item.icon || 'block',
      (item.description || '').substring(0, 100)
    ]);

    const compactViews = views.map((view: any) => {
      const positions = (view.items || []).map((viewItem: any) => {
        const itemIndex = itemIndexMap.get(viewItem.id) ?? -1;
        return [itemIndex, viewItem.tile?.x || 0, viewItem.tile?.y || 0];
      });

      const connections = (view.connectors || []).map((connector: any) => {
        const fromId = connector.anchors?.[0]?.ref?.item;
        const toId = connector.anchors?.[connector.anchors.length - 1]?.ref?.item;
        const fromIndex = fromId ? (itemIndexMap.get(fromId) ?? -1) : -1;
        const toIndex = toId ? (itemIndexMap.get(toId) ?? -1) : -1;
        return [fromIndex, toIndex];
      }).filter((conn: number[]) => conn[0] !== -1 && conn[1] !== -1);

      return [positions, connections];
    });

    const compactModel = {
      t: (diagramName || modelToExport.title || 'Untitled').substring(0, 40),
      i: compactItems,
      v: compactViews,
      _: { f: 'compact', v: '1.0' }
    };

    const jsonString = JSON.stringify(compactModel);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName || 'diagram'}-${new Date().toISOString().split('T')[0]}.compact.json`;
    a.click();
    URL.revokeObjectURL(url);

    setHasUnsavedChanges(false);
  }, [currentModel, diagramData, diagramName]);

  // Import diagram from JSON file
  const importFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      let modelData = rawData;

      // Check if compact format and transform
      if (rawData._?.f === 'compact') {
        // Transform from compact format
        const { t, i, v } = rawData;

        const fullItems = i.map((item: any, index: number) => ({
          id: `item_${index}`,
          name: item[0],
          icon: item[1],
          description: item[2] || ''
        }));

        const fullViews = v.map((view: any, viewIndex: number) => {
          const [positions, connections] = view;

          const viewItems = positions.map((pos: any) => {
            const [itemIndex, x, y] = pos;
            return {
              id: `item_${itemIndex}`,
              tile: { x, y },
              labelHeight: 80
            };
          });

          const connectors = connections.map((conn: any, connIndex: number) => {
            const [fromIndex, toIndex] = conn;
            return {
              id: `conn_${viewIndex}_${connIndex}`,
              color: defaultColors[0]?.id || 'blue', // Use first default color for IsoFlow compatibility
              anchors: [
                { id: `a_${viewIndex}_${connIndex}_0`, ref: { item: `item_${fromIndex}` } },
                { id: `a_${viewIndex}_${connIndex}_1`, ref: { item: `item_${toIndex}` } }
              ],
              width: 10,
              description: '',
              style: 'SOLID'
            };
          });

          return {
            id: `view_${viewIndex}`,
            name: `View ${viewIndex + 1}`,
            items: viewItems,
            connectors,
            rectangles: [],
            textBoxes: []
          };
        });

        modelData = {
          title: t,
          items: fullItems,
          views: fullViews,
          icons: [],
          colors: defaultColors
        };
      }

      // Auto-detect and load required icon packs - this returns all loaded icons
      const allLoadedIcons = await iconPackManager.loadPacksForDiagram(modelData.items || []);

      // Merge imported icons with loaded icon packs
      const importedIcons = (modelData.icons || []).filter((icon: any) => icon.collection === 'imported');
      const mergedIcons = [...allLoadedIcons, ...importedIcons];

      // IsoFlow compatibility: Check and fix missing icons
      const availableIconIds = new Set(mergedIcons.map((icon: any) => icon.id));
      let iconsMapped = 0;
      let iconsFallback = 0;

      // Map and fix item icons for IsoFlow compatibility
      const fixedItems = (modelData.items || []).map((item: any) => {
        if (!item.icon) return item;

        // If icon exists, keep it
        if (availableIconIds.has(item.icon)) return item;

        // Try IsoFlow mapping
        const mappedIcon = ISOFLOW_ICON_MAPPING[item.icon];
        if (mappedIcon && availableIconIds.has(mappedIcon)) {
          iconsMapped++;
          return { ...item, icon: mappedIcon };
        }

        // Fallback to default icon
        iconsFallback++;
        return { ...item, icon: FALLBACK_ICON_ID };
      });

      // Also fix connector colors for IsoFlow compatibility
      const colorsToUse = modelData.colors?.length ? modelData.colors : defaultColors;
      const availableColorIds = new Set(colorsToUse.map((c: any) => c.id));
      const defaultColorId = colorsToUse[0]?.id || 'blue';
      let colorsFallback = 0;

      const fixedViews = (modelData.views || []).map((view: any) => ({
        ...view,
        connectors: (view.connectors || []).map((conn: any) => {
          if (!conn.color || availableColorIds.has(conn.color)) return conn;
          colorsFallback++;
          return { ...conn, color: defaultColorId };
        })
      }));

      const dataWithIcons: DiagramData = {
        ...modelData,
        items: fixedItems,
        views: fixedViews,
        icons: mergedIcons,
        colors: colorsToUse,
        fitToScreen: true
      };

      // Reset state first
      updateCurrentDiagram(null);
      setDiagramName(modelData.title || file.name.replace(/\.json$/, ''));

      // Use callback to ensure state is set before forcing re-render
      setDiagramData(dataWithIcons);
      setCurrentModel(dataWithIcons);
      setHasUnsavedChanges(true);

      // Force re-render after a microtask to ensure state is committed
      await new Promise(resolve => setTimeout(resolve, 0));
      setFossflowKey((prev) => prev + 1);

    } catch {
      notifications.show({
        title: t('alert.importFailed') || 'Failed to import file',
        message: t('alert.importFailedMessage') || 'Please ensure it is a valid JSON file.',
        color: 'red'
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromFile(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDiagramManagerLoad = async (id: string, data: any) => {
    /**
     * Icon Persistence Strategy:
     * - Server storage saves ALL icons (default collections + imported custom icons)
     * - When loading, if we detect default collection icons, use ALL icons from server
     * - For backward compatibility with old saves, we detect and merge
     */
    const loadedIcons = data.icons || [];

    // Auto-detect and load required icon packs - this returns all loaded icons directly
    const allLoadedPackIcons = await iconPackManager.loadPacksForDiagram(data.items || []);

    let finalIcons;
    const hasDefaultIcons = loadedIcons.some((icon: any) => {
      return (
        icon.collection === 'isoflow' ||
        icon.collection === 'aws' ||
        icon.collection === 'gcp'
      );
    });

    if (hasDefaultIcons) {
      // New format: Server saved ALL icons (default + imported)
      finalIcons = loadedIcons;
    } else {
      // Old format: Server only saved imported icons - merge with defaults
      const importedIcons = loadedIcons.filter((icon: any) => {
        return icon.collection === 'imported';
      });
      finalIcons = [...allLoadedPackIcons, ...importedIcons];
    }

    // IsoFlow compatibility: Check and fix missing icons
    const availableIconIds = new Set(finalIcons.map((icon: any) => icon.id));
    let iconsMapped = 0;
    let iconsFallback = 0;

    const fixedItems = (data.items || []).map((item: any) => {
      if (!item.icon) return item;
      if (availableIconIds.has(item.icon)) return item;

      const mappedIcon = ISOFLOW_ICON_MAPPING[item.icon];
      if (mappedIcon && availableIconIds.has(mappedIcon)) {
        iconsMapped++;
        return { ...item, icon: mappedIcon };
      }

      iconsFallback++;
      return { ...item, icon: FALLBACK_ICON_ID };
    });

    // Fix connector colors
    const colorsToUse = data.colors?.length ? data.colors : defaultColors;
    const availableColorIds = new Set(colorsToUse.map((c: any) => c.id));
    const defaultColorId = colorsToUse[0]?.id || 'blue';
    let colorsFallback = 0;

    const fixedViews = (data.views || []).map((view: any) => ({
      ...view,
      connectors: (view.connectors || []).map((conn: any) => {
        if (!conn.color || availableColorIds.has(conn.color)) return conn;
        colorsFallback++;
        return { ...conn, color: defaultColorId };
      })
    }));

    const mergedData: DiagramData = {
      ...data,
      title: data.title || data.name || 'Loaded Diagram',
      items: fixedItems,
      views: fixedViews,
      icons: finalIcons,
      colors: colorsToUse,
      fitToScreen: data.fitToScreen !== false
    };

    const newDiagram = {
      id,
      name: data.name || 'Loaded Diagram',
      data: mergedData,
      createdAt: data.created || new Date().toISOString(),
      updatedAt: data.lastModified || new Date().toISOString()
    };

    // Use a single batch of state updates to minimize re-render issues
    // Update diagram data and increment key in the same render cycle
    setDiagramName(newDiagram.name);
    updateCurrentDiagram(newDiagram);
    setCurrentModel(mergedData);
    setHasUnsavedChanges(false);

    // Update diagramData and key together
    setDiagramData(mergedData);
    setFossflowKey((prev) => prev + 1);
  };

  // i18n
  const { t, i18n } = useTranslation('app');
  
  // Get locale with fallback to en-US if not found
  const currentLocale = allLocales[i18n.language as keyof typeof allLocales] || allLocales['en-US'];

  // Auto-save functionality
  useEffect(() => {
    if (!currentModel || !hasUnsavedChanges || !currentDiagram) return;

    const autoSaveTimer = setTimeout(() => {
      // Include imported icons in auto-save
      const importedIcons = (
        currentModel?.icons ||
        diagramData.icons ||
        []
      ).filter((icon) => {
        return icon.collection === 'imported';
      });

      const savedData = {
        title: diagramName || currentDiagram.name,
        icons: importedIcons, // Save imported icons in auto-save
        colors: currentModel.colors || [],
        items: currentModel.items || [],
        views: currentModel.views || [],
        fitToScreen: true
      };

      const updatedDiagram: SavedDiagram = {
        ...currentDiagram,
        data: savedData,
        updatedAt: new Date().toISOString()
      };

      setDiagrams((prevDiagrams) => {
        return prevDiagrams.map((d) => {
          return d.id === currentDiagram.id ? updatedDiagram : d;
        });
      });

      // Update last opened data
      try {
        localStorage.setItem(
          'stackdraw-last-opened-data',
          JSON.stringify(savedData)
        );
        setLastAutoSave(new Date());
        setHasUnsavedChanges(false);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          notifications.show({
            title: t('alert.autoSaveFailed'),
            message: '',
            color: 'red'
          });
          setShowStorageManager(true);
        }
      }
    }, 5000); // Auto-save after 5 seconds of changes

    return () => {
      return clearTimeout(autoSaveTimer);
    };
  }, [currentModel, hasUnsavedChanges, currentDiagram, diagramName]);

  // Warn before closing if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = t('alert.beforeUnload');
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      return window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S for Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();

        // Quick save if current diagram exists and has unsaved changes
        if (currentDiagram && hasUnsavedChanges) {
          saveDiagram();
        } else {
          // Otherwise show save dialog
          setShowSaveDialog(true);
        }
      }

      // Ctrl+O or Cmd+O for Open/Load
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        setShowLoadDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentDiagram, hasUnsavedChanges]);

  return (
    <div className="App">
      <div className="toolbar">
        {/* Hidden file input for importing JSON files */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileInputChange}
        />
        {!isReadonlyUrl && (
          <>
            <Button size="sm" onClick={newDiagram}>{t('nav.newDiagram')}</Button>
            <SplitButton
              label={t('nav.save')}
              onClick={() => {
                if (currentDiagram && hasUnsavedChanges) {
                  saveDiagram();
                } else if (!currentDiagram) {
                  setShowSaveDialog(true);
                }
              }}
              disabled={!hasUnsavedChanges && !!currentDiagram}
              options={[
                { label: t('nav.saveAs'), onClick: () => { setIsSaveAsMode(true); setDiagramName(''); setShowSaveDialog(true); } },
                { label: t('nav.exportJSON'), onClick: exportDiagram },
                { label: t('nav.exportCompactJSON'), onClick: exportAsCompactJSON },
                { label: t('nav.exportImage'), onClick: () => window.dispatchEvent(new CustomEvent('stackdraw:openExportImage')) }
              ]}
            />
            <SplitButton
              label={t('nav.load')}
              onClick={() => serverStorageAvailable ? setShowDiagramManager(true) : setShowLoadDialog(true)}
              options={[
                { label: t('nav.openJSONFile'), onClick: () => setTimeout(triggerFileInput, 100) }
              ]}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#228be6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('stackdraw:openSettings'));
              }}
              aria-label={t('nav.settings')}
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </>
        )}
        {isReadonlyUrl && (
          <div
            style={{
              color: 'black',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold',
              border: '2px solid #000000'
            }}
          >
            {t('dialog.readOnly.mode')}
          </div>
        )}
        <span className="current-diagram">
          {isReadonlyUrl ? (
            <span>
              {t('status.current')}: {diagramName}
            </span>
          ) : (
            <>
              {currentDiagram
                ? `${t('status.current')}: ${currentDiagram.name}`
                : diagramName || t('status.untitled')}
              {hasUnsavedChanges && (
                <span style={{ color: '#ff9800', marginLeft: '10px' }}>
                  • {t('status.modified')}
                </span>
              )}
              <span
                style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}
              >
                ({t('status.sessionStorageNote')})
              </span>
            </>
          )}
        </span>
      </div>

      <div className="stackdraw-container">
        <Isoflow
          key={`${fossflowKey}-${i18n.language}`}
          initialData={diagramData}
          onModelUpdated={handleModelUpdated}
          editorMode={isReadonlyUrl ? 'EXPLORABLE_READONLY' : 'EDITABLE'}
          locale={currentLocale}
          mainMenuOptions={EMPTY_MENU_OPTIONS}
          iconPackManager={{
            lazyLoadingEnabled: iconPackManager.lazyLoadingEnabled,
            onToggleLazyLoading: iconPackManager.toggleLazyLoading,
            packInfo: Object.values(iconPackManager.packInfo),
            enabledPacks: iconPackManager.enabledPacks,
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
            <h2>{isSaveAsMode ? t('nav.saveAs') : t('dialog.save.title')}</h2>
            <div className="dialog-warning">
              <strong>⚠️ {t('dialog.save.warningTitle')}:</strong>{' '}
              {t('dialog.save.warningMessage')}
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
              onChange={(e) => {
                return setDiagramName(e.target.value);
              }}
              onKeyDown={(e) => {
                return e.key === 'Enter' && saveDiagram();
              }}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => saveDiagram()}>{t('dialog.save.btnSave')}</button>
              <button
                onClick={() => {
                  setIsSaveAsMode(false);
                  setShowSaveDialog(false);
                }}
              >
                {t('dialog.save.btnCancel')}
              </button>
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
              <strong>⚠️ {t('dialog.load.noteTitle')}:</strong>{' '}
              {t('dialog.load.noteMessage')}
            </div>
            <div className="diagram-list">
              {diagrams.length === 0 ? (
                <p>{t('dialog.load.noSavedDiagrams')}</p>
              ) : (
                diagrams.map((diagram) => {
                  return (
                    <div key={diagram.id} className="diagram-item">
                      <div>
                        <strong>{diagram.name}</strong>
                        <br />
                        <small>
                          {t('dialog.load.updated')}:{' '}
                          {new Date(diagram.updatedAt).toLocaleString()}
                        </small>
                      </div>
                      <div className="diagram-actions">
                        <button
                          onClick={() => {
                            return loadDiagram(diagram, false);
                          }}
                        >
                          {t('dialog.load.btnLoad')}
                        </button>
                        <button
                          onClick={() => {
                            return deleteDiagram(diagram.id);
                          }}
                        >
                          {t('dialog.load.btnDelete')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="dialog-buttons">
              <button
                onClick={() => {
                  return setShowLoadDialog(false);
                }}
              >
                {t('dialog.load.btnClose')}
              </button>
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
                <strong>✅ {t('dialog.export.recommendedTitle')}:</strong>{' '}
                {t('dialog.export.recommendedMessage')}
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {t('dialog.export.noteMessage')}
              </p>
            </div>
            <div className="dialog-buttons">
              <button onClick={exportDiagram}>
                {t('dialog.export.btnDownload')}
              </button>
              <button
                onClick={() => {
                  return setShowExportDialog(false);
                }}
              >
                {t('dialog.export.btnCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Manager */}
      {showStorageManager && (
        <StorageManager
          onClose={() => {
            return setShowStorageManager(false);
          }}
        />
      )}

      {/* Diagram Manager */}
      {showDiagramManager && (
        <DiagramManager
          onLoadDiagram={handleDiagramManagerLoad}
          onClose={() => {
            return setShowDiagramManager(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
