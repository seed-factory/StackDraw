import { produce } from 'immer';
import { ItemGroup } from 'src/types';
import { getItemByIdOrThrow } from 'src/utils';
import type { ViewReducerContext, State } from './types';

export const createGroup = (
  newGroup: ItemGroup,
  ctx: ViewReducerContext
): State => {
  const newState = produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    if (!view.value.groups) {
      view.value.groups = [];
    }

    view.value.groups.push(newGroup);
  });

  return newState;
};

export const updateGroup = (
  payload: { id: string } & Partial<ItemGroup>,
  ctx: ViewReducerContext
): State => {
  const { id, ...updates } = payload;

  const newState = produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    if (!view.value.groups) return;

    const group = getItemByIdOrThrow(view.value.groups, id);
    view.value.groups[group.index] = { ...group.value, ...updates };
  });

  return newState;
};

export const deleteGroup = (
  groupId: string,
  ctx: ViewReducerContext
): State => {
  const newState = produce(ctx.state, (draft) => {
    const view = getItemByIdOrThrow(draft.model.views, ctx.viewId);

    if (!view.value.groups) return;

    const group = getItemByIdOrThrow(view.value.groups, groupId);
    view.value.groups.splice(group.index, 1);
  });

  return newState;
};
