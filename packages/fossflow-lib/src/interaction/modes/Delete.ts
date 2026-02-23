import { ModeActions } from 'src/types';
import { getItemAtTile } from 'src/utils';

export const Delete: ModeActions = {
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'DELETE' || !isRendererInteraction) return;

    const itemAtTile = getItemAtTile({
      tile: uiState.mouse.position.tile,
      scene
    });

    if (itemAtTile) {
      // Clear item controls FIRST to prevent stale references
      // Keep layers panel open if it's currently visible
      const options = uiState.layersPanel ? { keepLayersPanel: true } : undefined;
      uiState.actions.setItemControls(null, options);

      // Delete the item based on its type
      if (itemAtTile.type === 'ITEM') {
        // Delete the ViewItem (the visual representation on canvas)
        scene.deleteViewItem(itemAtTile.id);
      } else if (itemAtTile.type === 'CONNECTOR') {
        scene.deleteConnector(itemAtTile.id);
      } else if (itemAtTile.type === 'RECTANGLE') {
        scene.deleteRectangle(itemAtTile.id);
      } else if (itemAtTile.type === 'TEXTBOX') {
        scene.deleteTextBox(itemAtTile.id);
      }
    }
  }
};
