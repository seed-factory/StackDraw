import { produce } from 'immer';
import { ModeActions, ItemReference } from 'src/types';
import { CoordsUtils, isWithinBounds, hasMovedTile } from 'src/utils';

// Helper to find all items within the lasso bounds
const getItemsInBounds = (
  startTile: { x: number; y: number },
  endTile: { x: number; y: number },
  scene: any
): ItemReference[] => {
  const items: ItemReference[] = [];

  // Check all nodes/items
  scene.items.forEach((item: any) => {
    if (isWithinBounds(item.tile, [startTile, endTile])) {
      items.push({ type: 'ITEM', id: item.id });
    }
  });

  // Check all rectangles - they must be FULLY enclosed (all 4 corners inside)
  scene.rectangles.forEach((rectangle: any) => {
    const corners = [
      rectangle.from,
      { x: rectangle.to.x, y: rectangle.from.y },
      rectangle.to,
      { x: rectangle.from.x, y: rectangle.to.y }
    ];

    // Rectangle is only selected if ALL corners are inside the bounds
    const allCornersInside = corners.every(corner =>
      isWithinBounds(corner, [startTile, endTile])
    );

    if (allCornersInside) {
      items.push({ type: 'RECTANGLE', id: rectangle.id });
    }
  });

  // Check all text boxes
  scene.textBoxes.forEach((textBox: any) => {
    if (isWithinBounds(textBox.tile, [startTile, endTile])) {
      items.push({ type: 'TEXTBOX', id: textBox.id });
    }
  });

  // Check all connectors - select if both anchor points are within bounds
  scene.connectors.forEach((connector: any) => {
    const anchorTiles = connector.anchors.map((anchor: any) => {
      // Get the tile from the referenced item or use the anchor's tile directly
      if (anchor.ref?.item) {
        const anchorItem = scene.items.find((item: any) => item.id === anchor.ref.item);
        if (anchorItem) {
          return anchorItem.tile;
        }
      }
      if (anchor.ref?.tile) {
        return anchor.ref.tile;
      }
      return null;
    });

    // Connector is selected if both anchors are within bounds
    const allAnchorsInside = anchorTiles.every((tile: any) =>
      tile && isWithinBounds(tile, [startTile, endTile])
    );

    if (allAnchorsInside) {
      items.push({ type: 'CONNECTOR', id: connector.id });
    }
  });

  return items;
};

export const Lasso: ModeActions = {
  mousemove: ({ uiState, scene }) => {
    if (uiState.mode.type !== 'LASSO' || !uiState.mouse.mousedown) return;

    if (!hasMovedTile(uiState.mouse)) return;

    if (uiState.mode.isDragging && uiState.mode.selection) {
      // User is dragging an existing selection - switch to DRAG_ITEMS mode
      uiState.actions.setMode({
        type: 'DRAG_ITEMS',
        showCursor: true,
        items: uiState.mode.selection.items,
        isInitialMovement: true
      });
      return;
    }

    // User is creating/updating the selection box
    const startTile = uiState.mouse.mousedown.tile;
    const endTile = uiState.mouse.position.tile;
    const items = getItemsInBounds(startTile, endTile, scene);

    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        if (draft.type === 'LASSO') {
          draft.selection = {
            startTile,
            endTile,
            items
          };
        }
      })
    );
  },

  mousedown: ({ uiState }) => {
    if (uiState.mode.type !== 'LASSO') return;

    // If there's an existing selection, check if click is within it
    if (uiState.mode.selection) {
      const isWithinSelection = isWithinBounds(uiState.mouse.position.tile, [
        uiState.mode.selection.startTile,
        uiState.mode.selection.endTile
      ]);

      if (isWithinSelection) {
        // Clicked within selection - prepare to drag
        uiState.actions.setMode(
          produce(uiState.mode, (draft) => {
            if (draft.type === 'LASSO') {
              draft.isDragging = true;
            }
          })
        );
        return;
      }

      // Clicked outside selection - clear it and stay in LASSO mode
      uiState.actions.setMode(
        produce(uiState.mode, (draft) => {
          if (draft.type === 'LASSO') {
            draft.selection = null;
            draft.isDragging = false;
          }
        })
      );
    }
  },

  mouseup: ({ uiState }) => {
    if (uiState.mode.type !== 'LASSO') return;

    // Sync lasso selection with selectedItems
    if (uiState.mode.selection && uiState.mode.selection.items.length > 0) {
      uiState.actions.setSelectedItems(uiState.mode.selection.items);
    }

    // Reset dragging state but keep selection for drag functionality
    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        if (draft.type === 'LASSO') {
          draft.isDragging = false;
        }
      })
    );
  }
};
