import { createView, updateView, deleteView, updateViewTimestamp, syncScene, view } from '../view';
import { State, ViewReducerContext } from '../types';
import { View } from 'src/types';

// Use actual implementations
jest.mock('src/utils', () => {
  const actual = jest.requireActual('src/utils');
  return {
    ...actual,
    getConnectorPath: jest.fn(() => ({
      tiles: [],
      rectangle: { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } }
    }))
  };
});

jest.mock('src/config', () => ({
  VIEW_DEFAULTS: {
    name: 'Untitled view',
    items: [],
    connectors: [],
    rectangles: [],
    textBoxes: [],
    groups: [],
    layers: []
  },
  INITIAL_SCENE_STATE: {
    connectors: {},
    textBoxes: {}
  }
}));

describe('view reducer', () => {
  let mockState: State;
  let mockContext: ViewReducerContext;
  let mockView: View;

  beforeEach(() => {
    jest.clearAllMocks();

    mockView = {
      id: 'view1',
      name: 'Test View',
      items: [
        { id: 'item1', tile: { x: 0, y: 0 } }
      ],
      connectors: [],
      textBoxes: []
    };

    mockState = {
      model: {
        version: '1.0',
        title: 'Test Model',
        description: '',
        colors: [],
        icons: [],
        items: [],
        views: [mockView]
      },
      scene: {
        connectors: {},
        textBoxes: {}
      }
    };

    mockContext = {
      viewId: 'view1',
      state: mockState
    };
  });

  describe('createView', () => {
    it('should create a new view with defaults', () => {
      const newViewContext: ViewReducerContext = {
        viewId: 'view2',
        state: mockState
      };

      const result = createView({}, newViewContext);

      expect(result.model.views).toHaveLength(2);
      const newView = result.model.views[1];
      expect(newView.id).toBe('view2');
      expect(newView.name).toBe('Untitled view');
    });

    it('should create view with custom properties', () => {
      const newViewContext: ViewReducerContext = {
        viewId: 'view2',
        state: mockState
      };

      const result = createView({ name: 'Custom View' }, newViewContext);

      expect(result.model.views[1].name).toBe('Custom View');
    });

    it('should not mutate original state', () => {
      const originalViewCount = mockState.model.views.length;

      createView({}, { viewId: 'view2', state: mockState });

      expect(mockState.model.views.length).toBe(originalViewCount);
    });
  });

  describe('updateView', () => {
    it('should update view name', () => {
      const result = updateView({ name: 'Updated Name' }, mockContext);

      expect(result.model.views[0].name).toBe('Updated Name');
    });

    it('should preserve other view properties', () => {
      const result = updateView({ name: 'Updated' }, mockContext);

      expect(result.model.views[0].items).toHaveLength(1);
    });

    it('should throw error for non-existent view', () => {
      const badContext: ViewReducerContext = {
        viewId: 'nonexistent',
        state: mockState
      };

      expect(() => {
        updateView({ name: 'Test' }, badContext);
      }).toThrow('Item with id "nonexistent" not found.');
    });

    it('should not mutate original state', () => {
      const originalName = mockState.model.views[0].name;

      updateView({ name: 'Updated' }, mockContext);

      expect(mockState.model.views[0].name).toBe(originalName);
    });
  });

  describe('deleteView', () => {
    it('should delete the specified view', () => {
      const result = deleteView(mockContext);

      expect(result.model.views).toHaveLength(0);
    });

    it('should delete correct view from multiple views', () => {
      mockState.model.views.push({
        id: 'view2',
        name: 'View 2',
        items: []
      });

      const result = deleteView(mockContext);

      expect(result.model.views).toHaveLength(1);
      expect(result.model.views[0].id).toBe('view2');
    });

    it('should throw error for non-existent view', () => {
      const badContext: ViewReducerContext = {
        viewId: 'nonexistent',
        state: mockState
      };

      expect(() => {
        deleteView(badContext);
      }).toThrow();
    });

    it('should not mutate original state', () => {
      const originalViewCount = mockState.model.views.length;

      deleteView(mockContext);

      expect(mockState.model.views.length).toBe(originalViewCount);
    });
  });

  describe('updateViewTimestamp', () => {
    it('should update lastUpdated field', () => {
      const result = updateViewTimestamp(mockContext);

      expect(result.model.views[0].lastUpdated).toBeDefined();
    });

    it('should set ISO date string', () => {
      const result = updateViewTimestamp(mockContext);

      const lastUpdated = result.model.views[0].lastUpdated;
      expect(new Date(lastUpdated!).toISOString()).toBe(lastUpdated);
    });

    it('should not mutate original state', () => {
      const originalLastUpdated = mockState.model.views[0].lastUpdated;

      updateViewTimestamp(mockContext);

      expect(mockState.model.views[0].lastUpdated).toBe(originalLastUpdated);
    });
  });

  describe('syncScene', () => {
    it('should reset scene state', () => {
      mockState.scene.connectors = { 'old': {} as any };

      const result = syncScene(mockContext);

      expect(result.scene.connectors).toEqual({});
      expect(result.scene.textBoxes).toEqual({});
    });

    it('should preserve model', () => {
      const result = syncScene(mockContext);

      expect(result.model).toBe(mockState.model);
    });

    it('should sync connectors if present', () => {
      mockState.model.views[0].connectors = [
        {
          id: 'conn1',
          anchors: [
            { id: 'a1', ref: { item: 'item1' } },
            { id: 'a2', ref: { item: 'item1' } }
          ]
        }
      ];

      const result = syncScene(mockContext);

      expect(result.scene.connectors['conn1']).toBeDefined();
    });

    it('should handle view with no connectors', () => {
      mockState.model.views[0].connectors = undefined;

      const result = syncScene(mockContext);

      expect(result.scene.connectors).toEqual({});
    });

    it('should handle view with no textBoxes', () => {
      mockState.model.views[0].textBoxes = undefined;

      const result = syncScene(mockContext);

      expect(result.scene.textBoxes).toEqual({});
    });
  });

  describe('view reducer dispatcher', () => {
    it('should handle CREATE_VIEW action', () => {
      const result = view({
        action: 'CREATE_VIEW',
        payload: { name: 'New View' },
        ctx: { viewId: 'view2', state: mockState }
      });

      expect(result.model.views).toHaveLength(2);
    });

    it('should handle UPDATE_VIEW action', () => {
      const result = view({
        action: 'UPDATE_VIEW',
        payload: { name: 'Updated' },
        ctx: mockContext
      });

      expect(result.model.views[0].name).toBe('Updated');
    });

    it('should handle DELETE_VIEW action', () => {
      const result = view({
        action: 'DELETE_VIEW',
        payload: undefined,
        ctx: mockContext
      });

      expect(result.model.views).toHaveLength(0);
    });

    it('should handle SYNC_SCENE action', () => {
      const result = view({
        action: 'SYNC_SCENE',
        payload: undefined,
        ctx: mockContext
      });

      expect(result.scene).toBeDefined();
    });

    it('should throw error for invalid action', () => {
      expect(() => {
        view({
          action: 'INVALID_ACTION' as any,
          payload: undefined,
          ctx: mockContext
        });
      }).toThrow('Invalid action.');
    });

    it('should update timestamp for most actions', () => {
      const result = view({
        action: 'UPDATE_VIEW',
        payload: { name: 'Test' },
        ctx: mockContext
      });

      expect(result.model.views[0].lastUpdated).toBeDefined();
    });

    it('should not update timestamp for SYNC_SCENE', () => {
      // Clear any existing lastUpdated
      mockState.model.views[0].lastUpdated = undefined;

      const result = view({
        action: 'SYNC_SCENE',
        payload: undefined,
        ctx: mockContext
      });

      expect(result.model.views[0].lastUpdated).toBeUndefined();
    });

    it('should not update timestamp for DELETE_VIEW', () => {
      const result = view({
        action: 'DELETE_VIEW',
        payload: undefined,
        ctx: mockContext
      });

      // View is deleted, so there's nothing to check timestamp on
      expect(result.model.views).toHaveLength(0);
    });
  });

  describe('state immutability', () => {
    it('should not mutate original state on createView', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      createView({ name: 'New' }, { viewId: 'view2', state: mockState });

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on updateView', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      updateView({ name: 'Updated' }, mockContext);

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on deleteView', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      deleteView(mockContext);

      expect(mockState).toEqual(originalState);
    });
  });
});
