import { useMemo } from 'react';
import { useUiStateStore } from 'src/stores/uiStateStore';

/**
 * Hook to calculate item opacity based on layer display settings.
 *
 * @param itemLayerId - The layer ID of the item (undefined = default layer)
 * @returns Object with opacity value and whether item should be visible
 */
export const useLayerOpacity = (itemLayerId: string | undefined) => {
  const currentLayerId = useUiStateStore((state) => state.currentLayerId);
  const layerDisplayMode = useUiStateStore((state) => state.layerDisplayMode);

  return useMemo(() => {
    // Normalize: undefined layerId means default layer (null)
    const normalizedItemLayerId = itemLayerId || null;
    const isOnCurrentLayer = normalizedItemLayerId === currentLayerId;

    switch (layerDisplayMode) {
      case 'ONLY':
        // Only show items on current layer
        return {
          opacity: isOnCurrentLayer ? 1 : 0,
          visible: isOnCurrentLayer
        };

      case 'OVERLAY':
        // Show all layers at 100% opacity
        return {
          opacity: 1,
          visible: true
        };

      case 'TRANSPARENCY':
      default:
        // Current layer 100%, others 30%
        return {
          opacity: isOnCurrentLayer ? 1 : 0.3,
          visible: true
        };
    }
  }, [itemLayerId, currentLayerId, layerDisplayMode]);
};

/**
 * Calculate opacity for an item without hooks (for use in memos)
 */
export const calculateLayerOpacity = (
  itemLayerId: string | undefined,
  currentLayerId: string | null,
  layerDisplayMode: string
): { opacity: number; visible: boolean } => {
  const normalizedItemLayerId = itemLayerId || null;
  const isOnCurrentLayer = normalizedItemLayerId === currentLayerId;

  switch (layerDisplayMode) {
    case 'ONLY':
      return {
        opacity: isOnCurrentLayer ? 1 : 0,
        visible: isOnCurrentLayer
      };

    case 'OVERLAY':
      return {
        opacity: 1,
        visible: true
      };

    case 'TRANSPARENCY':
    default:
      return {
        opacity: isOnCurrentLayer ? 1 : 0.3,
        visible: true
      };
  }
};
