import { produce } from 'immer';
import {
  ConnectorAnchor,
  SceneConnector,
  ModeActions,
  ModeActionsAction,
  Coords,
  View,
  ItemReference
} from 'src/types';
import {
  getItemAtTile,
  hasMovedTile,
  getAnchorAtTile,
  getItemByIdOrThrow,
  generateId,
  CoordsUtils,
  getAnchorTile,
  connectorPathTileToGlobal
} from 'src/utils';
import { useScene } from 'src/hooks/useScene';

const getAnchorOrdering = (
  anchor: ConnectorAnchor,
  connector: SceneConnector,
  view: View
) => {
  const anchorTile = getAnchorTile(anchor, view);
  const index = connector.path.tiles.findIndex((pathTile) => {
    const globalTile = connectorPathTileToGlobal(
      pathTile,
      connector.path.rectangle.from
    );
    return CoordsUtils.isEqual(globalTile, anchorTile);
  });

  if (index === -1) {
    throw new Error(
      `Could not calculate ordering index of anchor [anchorId: ${anchor.id}]`
    );
  }

  return index;
};

const getAnchor = (
  connectorId: string,
  tile: Coords,
  scene: ReturnType<typeof useScene>
) => {
  const connector = getItemByIdOrThrow(scene.connectors, connectorId).value;
  const anchor = getAnchorAtTile(tile, connector.anchors);

  if (!anchor) {
    const newAnchor: ConnectorAnchor = {
      id: generateId(),
      ref: { tile }
    };

    const orderedAnchors = [...connector.anchors, newAnchor]
      .map((anch) => {
        return {
          ...anch,
          ordering: getAnchorOrdering(anch, connector, scene.currentView)
        };
      })
      .sort((a, b) => {
        return a.ordering - b.ordering;
      });

    scene.updateConnector(connector.id, { anchors: orderedAnchors });
    return newAnchor;
  }

  return anchor;
};

const mousedown: ModeActionsAction = ({
  uiState,
  scene,
  isRendererInteraction
}) => {
  if (uiState.mode.type !== 'CURSOR' || !isRendererInteraction) return;

  const itemAtTile = getItemAtTile({
    tile: uiState.mouse.position.tile,
    scene
  });

  // Keep layers panel open if it's currently visible
  const options = uiState.layersPanel ? { keepLayersPanel: true } : undefined;

  if (itemAtTile) {
    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        draft.mousedownItem = itemAtTile;
      })
    );
  } else {
    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        draft.mousedownItem = null;
      })
    );

    uiState.actions.setItemControls(null, options);

    // Show context menu for empty space on left click
    uiState.actions.setContextMenu({
      type: 'EMPTY',
      tile: uiState.mouse.position.tile
    });
  }
};

export const Cursor: ModeActions = {
  entry: (state) => {
    const { uiState } = state;

    if (uiState.mode.type !== 'CURSOR') return;

    if (uiState.mode.mousedownItem) {
      mousedown(state);
    }
  },
  mousemove: ({ scene, uiState }) => {
    if (uiState.mode.type !== 'CURSOR' || !hasMovedTile(uiState.mouse)) return;

    let item = uiState.mode.mousedownItem;

    if (item?.type === 'CONNECTOR' && uiState.mouse.mousedown) {
      const anchor = getAnchor(item.id, uiState.mouse.mousedown.tile, scene);

      item = {
        type: 'CONNECTOR_ANCHOR',
        id: anchor.id
      };
    }

    if (item) {
      // Check if the clicked item is part of the current selection
      const selectedItems = uiState.selectedItems;
      const isPartOfSelection = selectedItems.some(
        (selected) => selected.id === item!.id && selected.type === item!.type
      );

      let itemsToDrag: ItemReference[];

      if (isPartOfSelection) {
        // If clicked item is in selection, drag all selected items
        // This respects "single-item mode" - if only one item is selected, only drag that one
        itemsToDrag = selectedItems;
      } else {
        // Item is not in current selection
        // Check if item belongs to a group
        const groups = scene.groups || [];
        const itemGroup = groups.find(g =>
          g.items.some(i => i.id === item!.id && i.type === item!.type)
        );

        if (itemGroup) {
          // Drag the whole group
          itemsToDrag = itemGroup.items.map(i => ({
            type: i.type as ItemReference['type'],
            id: i.id
          }));
          // Also update selection to include the group
          uiState.actions.setSelectedItems(itemsToDrag);
        } else {
          // Just drag the clicked item
          itemsToDrag = [{ type: item.type as ItemReference['type'], id: item.id }];
        }
      }

      uiState.actions.setMode({
        type: 'DRAG_ITEMS',
        showCursor: true,
        items: itemsToDrag,
        isInitialMovement: true
      });
    } else {
      // If no item is being dragged and the mouse has moved, switch to PAN mode
      // Only do this if the drag started on empty space
      if (uiState.mouse.mousedown) {
        uiState.actions.setMode({
          type: 'PAN',
          showCursor: false
        });
      }
    }
  },
  mousedown,
  mouseup: ({ uiState, scene, isRendererInteraction, modifiers }) => {
    if (uiState.mode.type !== 'CURSOR' || !isRendererInteraction) return;

    const hasMoved = uiState.mouse.mousedown && hasMovedTile(uiState.mouse);

    // Keep layers panel open if it's currently visible
    const options = uiState.layersPanel ? { keepLayersPanel: true } : undefined;

    // Check if multi-select modifier is pressed (Cmd on Mac, Ctrl on Windows/Linux)
    const isMultiSelect = modifiers.metaKey || modifiers.ctrlKey;

    if (uiState.mode.mousedownItem && !hasMoved) {
      const clickedItem = uiState.mode.mousedownItem;

      // Create ItemReference for selection
      const itemRef: ItemReference = {
        type: clickedItem.type as ItemReference['type'],
        id: clickedItem.id
      };

      // Check if clicked item belongs to a group
      const groups = scene.groups || [];
      const itemGroup = groups.find(g =>
        g.items.some(i => i.id === clickedItem.id && i.type === clickedItem.type)
      );

      // Update selection based on modifier key and group membership
      if (isMultiSelect) {
        // Toggle the item in selection
        uiState.actions.toggleSelection(itemRef);
      } else if (itemGroup) {
        // Item is in a group
        // Check if we're already in "single item mode" (only one item from this group selected)
        const selectedFromThisGroup = uiState.selectedItems.filter(si =>
          itemGroup.items.some(gi => gi.id === si.id)
        );
        const isInSingleItemMode = selectedFromThisGroup.length === 1 && uiState.selectedItems.length === 1;

        if (isInSingleItemMode) {
          // Stay in single-item mode - just select this item (don't go back to group)
          uiState.actions.setSelectedItems([itemRef]);
        } else {
          // Check if the whole group is already selected
          const isWholeGroupSelected = itemGroup.items.length === uiState.selectedItems.length &&
            itemGroup.items.every(gi => uiState.selectedItems.some(si => si.id === gi.id));

          if (isWholeGroupSelected) {
            // Group is selected, drill down to single item
            uiState.actions.setSelectedItems([itemRef]);
          } else {
            // Select the whole group
            const groupItems = itemGroup.items.map(i => ({
              type: i.type as ItemReference['type'],
              id: i.id
            }));
            uiState.actions.setSelectedItems(groupItems);
          }
        }
      } else {
        // Replace selection with clicked item
        uiState.actions.setSelectedItems([itemRef]);
      }

      // Set item controls only if not in layers panel mode
      if (!uiState.layersPanel) {
        if (clickedItem.type === 'ITEM') {
          uiState.actions.setItemControls({
            type: 'ITEM',
            id: clickedItem.id
          }, options);
        } else if (clickedItem.type === 'RECTANGLE') {
          uiState.actions.setItemControls({
            type: 'RECTANGLE',
            id: clickedItem.id
          }, options);
        } else if (clickedItem.type === 'CONNECTOR') {
          uiState.actions.setItemControls({
            type: 'CONNECTOR',
            id: clickedItem.id
          }, options);
        } else if (clickedItem.type === 'TEXTBOX') {
          uiState.actions.setItemControls({
            type: 'TEXTBOX',
            id: clickedItem.id
          }, options);
        }
      }
    } else {
      // Clicked on empty space
      if (!isMultiSelect) {
        // Clear selection when clicking on empty space without modifier
        uiState.actions.clearSelection();
      }
      uiState.actions.setItemControls(null, options);
    }

    uiState.actions.setMode(
      produce(uiState.mode, (draft) => {
        draft.mousedownItem = null;
      })
    );
  }
};
