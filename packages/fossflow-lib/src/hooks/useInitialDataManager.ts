import { useCallback, useState, useRef } from 'react';
import { InitialData, IconCollectionState } from 'src/types';
import { INITIAL_DATA, INITIAL_SCENE_STATE } from 'src/config';
import {
  getFitToViewParams,
  CoordsUtils,
  categoriseIcons,
  generateId,
  getItemByIdOrThrow
} from 'src/utils';
import * as reducers from 'src/stores/reducers';
import { useModelStore } from 'src/stores/modelStore';
import { useView } from 'src/hooks/useView';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { modelSchema } from 'src/schemas/model';

// Fast array comparison - checks length and reference equality first,
// then falls back to JSON for content comparison only when needed
const arraysEqual = <T>(a: T[] | undefined, b: T[] | undefined): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  // If references are identical for all elements, arrays are equal
  let allSameRef = true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      allSameRef = false;
      break;
    }
  }
  if (allSameRef) return true;
  // Fall back to JSON comparison for content changes
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useInitialDataManager = () => {
  const [isReady, setIsReady] = useState(false);
  const prevInitialData = useRef<InitialData | undefined>(undefined);
  const model = useModelStore((state) => {
    return state;
  });
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const rendererEl = useUiStateStore((state) => {
    return state.rendererEl;
  });
  const editorMode = useUiStateStore((state) => {
    return state.editorMode;
  });
  const { changeView } = useView();

  const load = useCallback(
    (_initialData: InitialData) => {
      if (!_initialData || prevInitialData.current === _initialData) return;

      // Shallow comparison to prevent unnecessary reloads when data hasn't actually changed
      // Skip this check for NON_INTERACTIVE mode (used by export) to ensure proper initialization
      // Uses optimized array comparison - checks references first, falls back to JSON only when needed
      if (prevInitialData.current && editorMode !== 'NON_INTERACTIVE') {
        const connectorsEqual = arraysEqual(
          prevInitialData.current.views?.[0]?.connectors,
          _initialData.views?.[0]?.connectors
        );
        const itemsEqual = arraysEqual(prevInitialData.current.items, _initialData.items);
        const iconsEqual = arraysEqual(prevInitialData.current.icons, _initialData.icons);
        const colorsEqual = arraysEqual(prevInitialData.current.colors, _initialData.colors);

        if (connectorsEqual && itemsEqual && iconsEqual && colorsEqual) {
          // Data hasn't actually changed, skip reload
          return;
        }
      }

      setIsReady(false);

      const validationResult = modelSchema.safeParse(_initialData);

      if (!validationResult.success) {
        // TODO: let's get better at reporting error messages here
        window.alert('There is an error in your model. Please check the data format.');
        return;
      }

      // Clean up invalid connector references before loading
      const initialData = { ..._initialData };
      initialData.views = initialData.views.map(view => {
        if (!view.connectors) return view;

        // Build Set of item IDs for O(1) lookup instead of O(n) .some() per anchor
        const viewItemIds = new Set(view.items.map(item => item.id));

        const validConnectors = view.connectors.filter(connector => {
          // Check if all anchors reference existing items
          const hasValidAnchors = connector.anchors.every(anchor => {
            if (anchor.ref.item) {
              // O(1) lookup instead of O(n) .some()
              return viewItemIds.has(anchor.ref.item);
            }
            return true; // Allow anchors that reference other anchors
          });

          if (!hasValidAnchors) {
            console.warn(`Removing connector ${connector.id} due to invalid item references`);
          }

          return hasValidAnchors;
        });

        return { ...view, connectors: validConnectors };
      });

      if (initialData.views.length === 0) {
        const updates = reducers.view({
          action: 'CREATE_VIEW',
          payload: {},
          ctx: {
            state: { model: initialData, scene: INITIAL_SCENE_STATE },
            viewId: generateId()
          }
        });

        Object.assign(initialData, updates.model);
      }

      prevInitialData.current = initialData;
      // Skip history when loading initial data - this prevents the old state
      // from being saved to history, protecting the loaded data from being "undone away"
      model.actions.set(initialData, true);

      const view = getItemByIdOrThrow(
        initialData.views,
        initialData.view ?? initialData.views[0].id
      );

      changeView(view.value.id, initialData, true); // Skip history during initial load

      if (initialData.fitToView) {
        const rendererSize = rendererEl?.getBoundingClientRect();

        const { zoom, scroll } = getFitToViewParams(view.value, {
          width: rendererSize?.width ?? 0,
          height: rendererSize?.height ?? 0
        });

        uiStateActions.setScroll({
          position: scroll,
          offset: CoordsUtils.zero()
        });

        uiStateActions.setZoom(zoom);
      }

      const categoriesState: IconCollectionState[] = categoriseIcons(
        initialData.icons
      ).map((collection) => {
        return {
          id: collection.name,
          isExpanded: false
        };
      });

      uiStateActions.setIconCategoriesState(categoriesState);

      setIsReady(true);
    },
    [changeView, model.actions, rendererEl, uiStateActions, editorMode]
  );

  const clear = useCallback(() => {
    load({ ...INITIAL_DATA, icons: model.icons, colors: model.colors });
    uiStateActions.resetUiState();
  }, [load, model.icons, model.colors, uiStateActions]);

  return {
    load,
    clear,
    isReady
  };
};
