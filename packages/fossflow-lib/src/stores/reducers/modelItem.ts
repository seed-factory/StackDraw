import { produce } from 'immer';
import { ModelItem } from 'src/types';
import { getItemByIdOrThrow } from 'src/utils';
import { State } from './types';

/**
 * Get all ModelItem IDs that are referenced by at least one ViewItem
 */
const getReferencedModelItemIds = (views: State['model']['views']): Set<string> => {
  const referencedIds = new Set<string>();
  views.forEach(view => {
    view.items.forEach(item => {
      referencedIds.add(item.id);
    });
  });
  return referencedIds;
};

/**
 * Find all orphaned ModelItems (not referenced by any ViewItem in any view)
 */
export const findOrphanedModelItems = (state: State): string[] => {
  const referencedIds = getReferencedModelItemIds(state.model.views);
  return state.model.items
    .filter(item => !referencedIds.has(item.id))
    .map(item => item.id);
};

/**
 * Clean up all orphaned ModelItems in one operation
 * Useful for data migrations or manual cleanup
 */
export const cleanupOrphanedModelItems = (state: State): State => {
  const referencedIds = getReferencedModelItemIds(state.model.views);

  const newState = produce(state, (draft) => {
    draft.model.items = draft.model.items.filter(item => referencedIds.has(item.id));
  });

  return newState;
};

export const updateModelItem = (
  id: string,
  updates: Partial<ModelItem>,
  state: State
): State => {
  const modelItem = getItemByIdOrThrow(state.model.items, id);

  const newState = produce(state, (draft) => {
    draft.model.items[modelItem.index] = { ...modelItem.value, ...updates };
  });

  return newState;
};

export const createModelItem = (
  newModelItem: ModelItem,
  state: State
): State => {
  const newState = produce(state, (draft) => {
    draft.model.items.push(newModelItem);
  });

  return updateModelItem(newModelItem.id, newModelItem, newState);
};

export const deleteModelItem = (id: string, state: State): State => {
  const modelItem = getItemByIdOrThrow(state.model.items, id);

  const newState = produce(state, (draft) => {
    draft.model.items.splice(modelItem.index, 1);
  });

  return newState;
};
