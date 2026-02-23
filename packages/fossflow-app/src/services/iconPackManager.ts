import { useState, useEffect, useCallback } from 'react';
import { flattenCollections } from '@isoflow/isopacks/dist/utils';

// Available icon packs (excluding core isoflow which is always loaded)
export type IconPackName = 'aws' | 'gcp' | 'azure' | 'kubernetes';

export interface IconPackInfo {
  name: IconPackName;
  displayName: string;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  iconCount: number;
}

export interface IconPackManagerState {
  lazyLoadingEnabled: boolean;
  enabledPacks: IconPackName[];
  packInfo: Record<IconPackName, IconPackInfo>;
  loadedIcons: any[];
}

// localStorage keys
const LAZY_LOADING_KEY = 'stackdraw-lazy-loading-enabled';
const ENABLED_PACKS_KEY = 'stackdraw-enabled-icon-packs';

// Pack metadata
const PACK_METADATA: Record<IconPackName, string> = {
  aws: 'AWS Icons',
  gcp: 'Google Cloud Icons',
  azure: 'Azure Icons',
  kubernetes: 'Kubernetes Icons'
};

// Load preferences from localStorage
export const loadLazyLoadingPreference = (): boolean => {
  const stored = localStorage.getItem(LAZY_LOADING_KEY);
  return stored === null ? true : stored === 'true'; // Default to true
};

export const saveLazyLoadingPreference = (enabled: boolean): void => {
  localStorage.setItem(LAZY_LOADING_KEY, String(enabled));
};

export const loadEnabledPacks = (): IconPackName[] => {
  const stored = localStorage.getItem(ENABLED_PACKS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as IconPackName[];
  } catch {
    return [];
  }
};

export const saveEnabledPacks = (packs: IconPackName[]): void => {
  localStorage.setItem(ENABLED_PACKS_KEY, JSON.stringify(packs));
};

// Dynamic pack loader
export const loadIconPack = async (packName: IconPackName): Promise<any> => {
  switch (packName) {
    case 'aws':
      return (await import('@isoflow/isopacks/dist/aws')).default;
    case 'gcp':
      return (await import('@isoflow/isopacks/dist/gcp')).default;
    case 'azure':
      return (await import('@isoflow/isopacks/dist/azure')).default;
    case 'kubernetes':
      return (await import('@isoflow/isopacks/dist/kubernetes')).default;
    default:
      throw new Error(`Unknown icon pack: ${packName}`);
  }
};

// React hook for managing icon packs
export const useIconPackManager = (coreIcons: any[]) => {
  const [lazyLoadingEnabled, setLazyLoadingEnabled] = useState<boolean>(() =>
    loadLazyLoadingPreference()
  );

  const [enabledPacks, setEnabledPacks] = useState<IconPackName[]>(() =>
    loadEnabledPacks()
  );

  const [packInfo, setPackInfo] = useState<Record<IconPackName, IconPackInfo>>(() => {
    const info: Record<string, IconPackInfo> = {};
    const packNames: IconPackName[] = ['aws', 'gcp', 'azure', 'kubernetes'];
    packNames.forEach(name => {
      info[name] = {
        name,
        displayName: PACK_METADATA[name],
        loaded: false,
        loading: false,
        error: null,
        iconCount: 0
      };
    });
    return info as Record<IconPackName, IconPackInfo>;
  });

  const [loadedIcons, setLoadedIcons] = useState<any[]>(coreIcons);
  const [loadedPackData, setLoadedPackData] = useState<Record<IconPackName, any>>({} as Record<IconPackName, any>);

  // Load a specific pack
  const loadPack = useCallback(async (packName: IconPackName) => {
    // Already loaded?
    if (packInfo[packName].loaded || packInfo[packName].loading) {
      return;
    }

    // Set loading state
    setPackInfo(prev => ({
      ...prev,
      [packName]: { ...prev[packName], loading: true, error: null }
    }));

    try {
      const pack = await loadIconPack(packName);
      const flattenedIcons = flattenCollections([pack]);

      // Store the loaded pack data
      setLoadedPackData(prev => ({
        ...prev,
        [packName]: pack
      }));

      // Update pack info
      setPackInfo(prev => ({
        ...prev,
        [packName]: {
          ...prev[packName],
          loaded: true,
          loading: false,
          iconCount: flattenedIcons.length,
          error: null
        }
      }));

      // Add icons to the loaded icons array
      setLoadedIcons(prev => [...prev, ...flattenedIcons]);

      return flattenedIcons;
    } catch (error) {
      setPackInfo(prev => ({
        ...prev,
        [packName]: {
          ...prev[packName],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load pack'
        }
      }));
      throw error;
    }
  }, [packInfo]);

  // Enable/disable a pack
  const togglePack = useCallback(async (packName: IconPackName, enabled: boolean) => {
    if (enabled) {
      // Add to enabled packs
      const newEnabledPacks = [...enabledPacks, packName];
      setEnabledPacks(newEnabledPacks);
      saveEnabledPacks(newEnabledPacks);

      // Load the pack
      await loadPack(packName);
    } else {
      // Remove from enabled packs
      const newEnabledPacks = enabledPacks.filter(p => p !== packName);
      setEnabledPacks(newEnabledPacks);
      saveEnabledPacks(newEnabledPacks);

      // Remove icons from loaded icons
      // We need to rebuild the icons array from core + enabled packs
      const newIcons = [coreIcons];
      for (const pack of newEnabledPacks) {
        if (loadedPackData[pack]) {
          newIcons.push(flattenCollections([loadedPackData[pack]]));
        }
      }
      setLoadedIcons(newIcons.flat());
    }
  }, [enabledPacks, loadPack, coreIcons, loadedPackData]);

  // Toggle lazy loading
  const toggleLazyLoading = useCallback((enabled: boolean) => {
    setLazyLoadingEnabled(enabled);
    saveLazyLoadingPreference(enabled);
  }, []);

  // Load all packs (for when lazy loading is disabled)
  const loadAllPacks = useCallback(async () => {
    const allPacks: IconPackName[] = ['aws', 'gcp', 'azure', 'kubernetes'];
    for (const pack of allPacks) {
      if (!packInfo[pack].loaded && !packInfo[pack].loading) {
        await loadPack(pack);
      }
    }
  }, [packInfo, loadPack]);

  // Helper function to detect pack from icon name prefix
  const detectPackFromIconName = (iconName: string): IconPackName | null => {
    if (!iconName || typeof iconName !== 'string') return null;

    // Check for common prefixes
    if (iconName.startsWith('aws-') || iconName.startsWith('aws_')) return 'aws';
    if (iconName.startsWith('gcp-') || iconName.startsWith('gcp_') || iconName.startsWith('google-')) return 'gcp';
    if (iconName.startsWith('azure-') || iconName.startsWith('azure_')) return 'azure';
    if (iconName.startsWith('kubernetes-') || iconName.startsWith('k8s-') || iconName.startsWith('k8s_')) return 'kubernetes';

    return null;
  };

  // Auto-detect required packs from diagram data
  const loadPacksForDiagram = useCallback(async (diagramItems: any[]): Promise<any[]> => {
    if (!diagramItems || diagramItems.length === 0) return coreIcons;

    // Extract unique collections from diagram items
    const collections = new Set<string>();
    diagramItems.forEach(item => {
      // New format: item.icon is an object with collection
      if (item.icon?.collection) {
        collections.add(item.icon.collection);
      }
      // Old format: item.icon is a string (icon ID)
      else if (typeof item.icon === 'string') {
        const detectedPack = detectPackFromIconName(item.icon);
        if (detectedPack) {
          collections.add(detectedPack);
        }
      }
      // Also check item.icon.id for icon name
      else if (item.icon?.id) {
        const detectedPack = detectPackFromIconName(item.icon.id);
        if (detectedPack) {
          collections.add(detectedPack);
        }
      }
    });

    // Load any missing packs
    const packsToLoad: IconPackName[] = [];
    collections.forEach(collection => {
      if (collection !== 'isoflow' && collection !== 'imported') {
        const packName = collection as IconPackName;
        if (['aws', 'gcp', 'azure', 'kubernetes'].includes(packName)) {
          if (!packInfo[packName].loaded && !packInfo[packName].loading) {
            packsToLoad.push(packName);
          }
        }
      }
    });

    // Load required packs and collect all icons
    const newlyLoadedIcons: any[] = [];
    for (const pack of packsToLoad) {
      const packIcons = await loadPack(pack);
      if (packIcons) {
        newlyLoadedIcons.push(...packIcons);
      }
      // Also add to enabled packs
      if (!enabledPacks.includes(pack)) {
        const newEnabledPacks = [...enabledPacks, pack];
        setEnabledPacks(newEnabledPacks);
        saveEnabledPacks(newEnabledPacks);
      }
    }

    // Return all icons: core + already loaded + newly loaded
    // We need to include icons from already loaded packs too
    const allLoadedPackIcons: any[] = [];
    Object.entries(loadedPackData).forEach(([packName, pack]) => {
      if (pack && !packsToLoad.includes(packName as IconPackName)) {
        allLoadedPackIcons.push(...flattenCollections([pack]));
      }
    });

    const allIcons = [...coreIcons, ...allLoadedPackIcons, ...newlyLoadedIcons];

    return allIcons;
  }, [packInfo, enabledPacks, loadPack, coreIcons, loadedPackData]);

  // Get all currently loaded icons (including from pack data)
  const getAllLoadedIcons = useCallback(() => {
    const allIcons = [...coreIcons];
    Object.values(loadedPackData).forEach((pack: any) => {
      if (pack) {
        allIcons.push(...flattenCollections([pack]));
      }
    });
    return allIcons;
  }, [coreIcons, loadedPackData]);

  // Initialize: Load enabled packs or all packs depending on lazy loading setting
  useEffect(() => {
    const initialize = async () => {
      if (!lazyLoadingEnabled) {
        // Load all packs immediately
        await loadAllPacks();
      } else {
        // Load only enabled packs
        for (const pack of enabledPacks) {
          if (!packInfo[pack].loaded && !packInfo[pack].loading) {
            await loadPack(pack);
          }
        }
      }
    };
    initialize();
  }, []); // Only run once on mount

  return {
    lazyLoadingEnabled,
    enabledPacks,
    packInfo,
    loadedIcons,
    togglePack,
    toggleLazyLoading,
    loadAllPacks,
    loadPacksForDiagram,
    getAllLoadedIcons,
    isPackEnabled: (packName: IconPackName) => enabledPacks.includes(packName)
  };
};
