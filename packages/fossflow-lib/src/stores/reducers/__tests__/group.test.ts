import { createGroup, updateGroup, deleteGroup } from '../group';
import { State, ViewReducerContext } from '../types';
import { ItemGroup, View } from 'src/types';

// Mock the utility functions
jest.mock('src/utils', () => ({
  getItemByIdOrThrow: jest.fn((items: any[], id: string) => {
    const index = items.findIndex((item: any) =>
      (typeof item === 'object' && item.id === id) || item === id
    );
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    return { value: items[index], index };
  })
}));

describe('group reducer', () => {
  let mockState: State;
  let mockContext: ViewReducerContext;
  let mockView: View;
  let mockGroup: ItemGroup;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGroup = {
      id: 'group1',
      name: 'Test Group',
      itemIds: ['item1', 'item2']
    };

    mockView = {
      id: 'view1',
      name: 'Test View',
      items: [
        { id: 'item1', tile: { x: 0, y: 0 } },
        { id: 'item2', tile: { x: 1, y: 0 } },
        { id: 'item3', tile: { x: 2, y: 0 } }
      ],
      groups: [mockGroup]
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
        viewId: 'view1',
        connectors: {},
        textBoxes: {}
      }
    };

    mockContext = {
      viewId: 'view1',
      state: mockState
    };
  });

  describe('createGroup', () => {
    it('should create a new group', () => {
      const newGroup: ItemGroup = {
        id: 'group2',
        name: 'New Group',
        itemIds: ['item3']
      };

      const result = createGroup(newGroup, mockContext);

      expect(result.model.views[0].groups).toHaveLength(2);
      expect(result.model.views[0].groups![1]).toEqual(newGroup);
    });

    it('should initialize groups array if undefined', () => {
      mockState.model.views[0].groups = undefined;

      const newGroup: ItemGroup = {
        id: 'group1',
        name: 'First Group',
        itemIds: ['item1']
      };

      const result = createGroup(newGroup, mockContext);

      expect(result.model.views[0].groups).toHaveLength(1);
      expect(result.model.views[0].groups![0]).toEqual(newGroup);
    });

    it('should not mutate original state', () => {
      const originalGroupsCount = mockState.model.views[0].groups?.length;

      createGroup({
        id: 'new',
        name: 'New',
        itemIds: []
      }, mockContext);

      expect(mockState.model.views[0].groups?.length).toBe(originalGroupsCount);
    });

    it('should create group with empty itemIds', () => {
      const newGroup: ItemGroup = {
        id: 'group2',
        name: 'Empty Group',
        itemIds: []
      };

      const result = createGroup(newGroup, mockContext);

      expect(result.model.views[0].groups![1].itemIds).toEqual([]);
    });

    it('should create group with all properties', () => {
      const newGroup: ItemGroup = {
        id: 'group2',
        name: 'Full Group',
        itemIds: ['item1', 'item2', 'item3']
      };

      const result = createGroup(newGroup, mockContext);

      const createdGroup = result.model.views[0].groups![1];
      expect(createdGroup.id).toBe('group2');
      expect(createdGroup.name).toBe('Full Group');
      expect(createdGroup.itemIds).toHaveLength(3);
    });

    it('should throw error when view does not exist', () => {
      mockContext.viewId = 'nonexistent';

      const newGroup: ItemGroup = {
        id: 'group2',
        name: 'New Group',
        itemIds: []
      };

      expect(() => {
        createGroup(newGroup, mockContext);
      }).toThrow('Item with id nonexistent not found');
    });
  });

  describe('updateGroup', () => {
    it('should update group name', () => {
      const result = updateGroup({ id: 'group1', name: 'Updated Name' }, mockContext);

      expect(result.model.views[0].groups![0].name).toBe('Updated Name');
    });

    it('should update group itemIds', () => {
      const result = updateGroup({
        id: 'group1',
        itemIds: ['item3']
      }, mockContext);

      expect(result.model.views[0].groups![0].itemIds).toEqual(['item3']);
    });

    it('should update multiple properties at once', () => {
      const result = updateGroup({
        id: 'group1',
        name: 'New Name',
        itemIds: ['item1', 'item2', 'item3']
      }, mockContext);

      expect(result.model.views[0].groups![0].name).toBe('New Name');
      expect(result.model.views[0].groups![0].itemIds).toHaveLength(3);
    });

    it('should preserve unchanged properties', () => {
      const result = updateGroup({ id: 'group1', name: 'Changed' }, mockContext);

      expect(result.model.views[0].groups![0].itemIds).toEqual(['item1', 'item2']);
    });

    it('should not mutate original state', () => {
      const originalName = mockState.model.views[0].groups![0].name;

      updateGroup({ id: 'group1', name: 'Changed' }, mockContext);

      expect(mockState.model.views[0].groups![0].name).toBe(originalName);
    });

    it('should throw error for non-existent group', () => {
      expect(() => {
        updateGroup({ id: 'nonexistent', name: 'Test' }, mockContext);
      }).toThrow('Item with id nonexistent not found');
    });

    it('should return unchanged state when groups is undefined', () => {
      mockState.model.views[0].groups = undefined;

      const result = updateGroup({ id: 'group1', name: 'Test' }, mockContext);

      expect(result.model.views[0].groups).toBeUndefined();
    });
  });

  describe('deleteGroup', () => {
    it('should delete the specified group', () => {
      const result = deleteGroup('group1', mockContext);

      expect(result.model.views[0].groups).toHaveLength(0);
    });

    it('should not affect other groups', () => {
      // Add another group
      mockState.model.views[0].groups!.push({
        id: 'group2',
        name: 'Group 2',
        itemIds: ['item3']
      });

      const result = deleteGroup('group1', mockContext);

      expect(result.model.views[0].groups).toHaveLength(1);
      expect(result.model.views[0].groups![0].id).toBe('group2');
    });

    it('should not mutate original state', () => {
      const originalGroupsCount = mockState.model.views[0].groups?.length;

      deleteGroup('group1', mockContext);

      expect(mockState.model.views[0].groups?.length).toBe(originalGroupsCount);
    });

    it('should throw error for non-existent group', () => {
      expect(() => {
        deleteGroup('nonexistent', mockContext);
      }).toThrow('Item with id nonexistent not found');
    });

    it('should return unchanged state when groups is undefined', () => {
      mockState.model.views[0].groups = undefined;

      const result = deleteGroup('group1', mockContext);

      expect(result.model.views[0].groups).toBeUndefined();
    });

    it('should delete correct group from multiple groups', () => {
      mockState.model.views[0].groups = [
        { id: 'group1', name: 'Group 1', itemIds: ['item1'] },
        { id: 'group2', name: 'Group 2', itemIds: ['item2'] },
        { id: 'group3', name: 'Group 3', itemIds: ['item3'] }
      ];

      const result = deleteGroup('group2', mockContext);

      expect(result.model.views[0].groups).toHaveLength(2);
      expect(result.model.views[0].groups![0].id).toBe('group1');
      expect(result.model.views[0].groups![1].id).toBe('group3');
    });
  });

  describe('state immutability', () => {
    it('should not mutate original state on createGroup', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      createGroup({
        id: 'new',
        name: 'New',
        itemIds: []
      }, mockContext);

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on updateGroup', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      updateGroup({ id: 'group1', name: 'Changed' }, mockContext);

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on deleteGroup', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      deleteGroup('group1', mockContext);

      expect(mockState).toEqual(originalState);
    });
  });

  describe('edge cases', () => {
    it('should handle group with single item', () => {
      const result = updateGroup({
        id: 'group1',
        itemIds: ['item1']
      }, mockContext);

      expect(result.model.views[0].groups![0].itemIds).toHaveLength(1);
    });

    it('should handle group with many items', () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => `item${i}`);

      const result = updateGroup({
        id: 'group1',
        itemIds: manyItems
      }, mockContext);

      expect(result.model.views[0].groups![0].itemIds).toHaveLength(100);
    });

    it('should handle multiple sequential operations', () => {
      // Create
      let result = createGroup({
        id: 'group2',
        name: 'Group 2',
        itemIds: ['item3']
      }, { ...mockContext, state: mockState });

      // Update
      result = updateGroup({
        id: 'group2',
        name: 'Updated Group 2'
      }, { ...mockContext, state: result });

      // Delete original
      result = deleteGroup('group1', { ...mockContext, state: result });

      expect(result.model.views[0].groups).toHaveLength(1);
      expect(result.model.views[0].groups![0].name).toBe('Updated Group 2');
    });
  });
});
