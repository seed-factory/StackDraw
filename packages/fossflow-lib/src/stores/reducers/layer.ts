import { produce } from 'immer';
import { Layer } from 'src/types';
import { ViewReducerContext, State } from './types';
import { getItemByIdOrThrow } from 'src/utils';

export const createLayer = (
  newLayer: Layer,
  ctx: ViewReducerContext
): State => {
  return produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    if (!view.value.layers) {
      view.value.layers = [];
    }

    view.value.layers.push(newLayer);
  });
};

export const updateLayer = (
  payload: { id: string } & Partial<Layer>,
  ctx: ViewReducerContext
): State => {
  return produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    if (!view.value.layers) return;

    const layerIndex = view.value.layers.findIndex((l) => l.id === payload.id);
    if (layerIndex === -1) return;

    const { id, ...updates } = payload;
    view.value.layers[layerIndex] = {
      ...view.value.layers[layerIndex],
      ...updates
    };
  });
};

export const deleteLayer = (
  layerId: string,
  ctx: ViewReducerContext
): State => {
  return produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    if (!view.value.layers) return;

    // Remove the layer
    view.value.layers = view.value.layers.filter((l) => l.id !== layerId);

    // Clear layerId from all items that were on this layer
    view.value.items = view.value.items.map((item) => {
      if (item.layerId === layerId) {
        const { layerId: _, ...rest } = item;
        return rest;
      }
      return item;
    });

    if (view.value.connectors) {
      view.value.connectors = view.value.connectors.map((connector) => {
        if (connector.layerId === layerId) {
          const { layerId: _, ...rest } = connector;
          return rest;
        }
        return connector;
      });
    }

    if (view.value.rectangles) {
      view.value.rectangles = view.value.rectangles.map((rect) => {
        if (rect.layerId === layerId) {
          const { layerId: _, ...rest } = rect;
          return rest;
        }
        return rect;
      });
    }

    if (view.value.textBoxes) {
      view.value.textBoxes = view.value.textBoxes.map((textBox) => {
        if (textBox.layerId === layerId) {
          const { layerId: _, ...rest } = textBox;
          return rest;
        }
        return textBox;
      });
    }
  });
};

export const moveItemsToLayer = (
  payload: { itemIds: Array<{ type: string; id: string }>; layerId: string | null },
  ctx: ViewReducerContext
): State => {
  return produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    payload.itemIds.forEach(({ type, id }) => {
      if (type === 'ITEM') {
        const item = view.value.items.find((i) => i.id === id);
        if (item) {
          if (payload.layerId) {
            item.layerId = payload.layerId;
          } else {
            delete item.layerId;
          }
        }
      } else if (type === 'CONNECTOR' && view.value.connectors) {
        const connector = view.value.connectors.find((c) => c.id === id);
        if (connector) {
          if (payload.layerId) {
            connector.layerId = payload.layerId;
          } else {
            delete connector.layerId;
          }
        }
      } else if (type === 'RECTANGLE' && view.value.rectangles) {
        const rect = view.value.rectangles.find((r) => r.id === id);
        if (rect) {
          if (payload.layerId) {
            rect.layerId = payload.layerId;
          } else {
            delete rect.layerId;
          }
        }
      } else if (type === 'TEXTBOX' && view.value.textBoxes) {
        const textBox = view.value.textBoxes.find((t) => t.id === id);
        if (textBox) {
          if (payload.layerId) {
            textBox.layerId = payload.layerId;
          } else {
            delete textBox.layerId;
          }
        }
      }
    });
  });
};
