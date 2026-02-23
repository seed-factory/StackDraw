import { createLayer, updateLayer, deleteLayer, moveItemsToLayer } from '../layer';
import { State, ViewReducerContext } from '../types';
import { Layer, View } from 'src/types';

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

describe('layer reducer', () => {
  let mockState: State;
  let mockContext: ViewReducerContext;
  let mockView: View;

  beforeEach(() => {
    jest.clearAllMocks();

    mockView = {
      id: 'view1',
      name: 'Test View',
      items: [
        { id: 'item1', tile: { x: 0, y: 0 }, layerId: 'layer1' },
        { id: 'item2', tile: { x: 1, y: 0 } }
      ],
      connectors: [
        { id: 'conn1', anchors: [], layerId: 'layer1' }
      ],
      rectangles: [
        { id: 'rect1', from: { x: 0, y: 0 }, to: { x: 2, y: 2 }, layerId: 'layer1' }
      ],
      textBoxes: [
        { id: 'text1', tile: { x: 0, y: 0 }, content: 'Test', layerId: 'layer1' }
      ],
      layers: [
        { id: 'layer1', name: 'Layer 1', visible: true },
        { id: 'layer2', name: 'Layer 2', visible: true }
      ]
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

  describe('createLayer', () => {
    it('should create a new layer', () => {
      const newLayer: Layer = {
        id: 'layer3',
        name: 'New Layer',
        visible: true
      };

      const result = createLayer(newLayer, mockContext);

      expect(result.model.views[0].layers).toHaveLength(3);
      expect(result.model.views[0].layers![2]).toEqual(newLayer);
    });

    it('should initialize layers array if undefined', () => {
      mockState.model.views[0].layers = undefined;

      const newLayer: Layer = {
        id: 'layer1',
        name: 'First Layer',
        visible: true
      };

      const result = createLayer(newLayer, mockContext);

      expect(result.model.views[0].layers).toHaveLength(1);
      expect(result.model.views[0].layers![0]).toEqual(newLayer);
    });

    it('should not mutate original state', () => {
      const originalLayersCount = mockState.model.views[0].layers?.length;

      createLayer({ id: 'new', name: 'New', visible: true }, mockContext);

      expect(mockState.model.views[0].layers?.length).toBe(originalLayersCount);
    });

    it('should create layer with all properties', () => {
      const newLayer: Layer = {
        id: 'layer3',
        name: 'Full Layer',
        visible: false
      };

      const result = createLayer(newLayer, mockContext);

      const createdLayer = result.model.views[0].layers![2];
      expect(createdLayer.id).toBe('layer3');
      expect(createdLayer.name).toBe('Full Layer');
      expect(createdLayer.visible).toBe(false);
    });
  });

  describe('updateLayer', () => {
    it('should update layer name', () => {
      const result = updateLayer({ id: 'layer1', name: 'Updated Name' }, mockContext);

      expect(result.model.views[0].layers![0].name).toBe('Updated Name');
    });

    it('should update layer visibility', () => {
      const result = updateLayer({ id: 'layer1', visible: false }, mockContext);

      expect(result.model.views[0].layers![0].visible).toBe(false);
    });

    it('should update multiple properties at once', () => {
      const result = updateLayer({
        id: 'layer1',
        name: 'New Name',
        visible: false
      }, mockContext);

      expect(result.model.views[0].layers![0].name).toBe('New Name');
      expect(result.model.views[0].layers![0].visible).toBe(false);
    });

    it('should not affect other layers', () => {
      const result = updateLayer({ id: 'layer1', name: 'Changed' }, mockContext);

      expect(result.model.views[0].layers![1].name).toBe('Layer 2');
    });

    it('should return unchanged state for non-existent layer', () => {
      mockState.model.views[0].layers = [{ id: 'layer1', name: 'Layer 1', visible: true }];

      const result = updateLayer({ id: 'nonexistent', name: 'Test' }, mockContext);

      expect(result.model.views[0].layers![0].name).toBe('Layer 1');
    });

    it('should return unchanged state when layers is undefined', () => {
      mockState.model.views[0].layers = undefined;

      const result = updateLayer({ id: 'layer1', name: 'Test' }, mockContext);

      expect(result.model.views[0].layers).toBeUndefined();
    });
  });

  describe('deleteLayer', () => {
    it('should delete the specified layer', () => {
      const result = deleteLayer('layer1', mockContext);

      expect(result.model.views[0].layers).toHaveLength(1);
      expect(result.model.views[0].layers![0].id).toBe('layer2');
    });

    it('should clear layerId from items on deleted layer', () => {
      const result = deleteLayer('layer1', mockContext);

      const item1 = result.model.views[0].items.find(i => i.id === 'item1');
      expect(item1?.layerId).toBeUndefined();
    });

    it('should clear layerId from connectors on deleted layer', () => {
      const result = deleteLayer('layer1', mockContext);

      const conn1 = result.model.views[0].connectors?.find(c => c.id === 'conn1');
      expect(conn1?.layerId).toBeUndefined();
    });

    it('should clear layerId from rectangles on deleted layer', () => {
      const result = deleteLayer('layer1', mockContext);

      const rect1 = result.model.views[0].rectangles?.find(r => r.id === 'rect1');
      expect(rect1?.layerId).toBeUndefined();
    });

    it('should clear layerId from textBoxes on deleted layer', () => {
      const result = deleteLayer('layer1', mockContext);

      const text1 = result.model.views[0].textBoxes?.find(t => t.id === 'text1');
      expect(text1?.layerId).toBeUndefined();
    });

    it('should not affect items on other layers', () => {
      // Add an item on layer2
      mockState.model.views[0].items.push({ id: 'item3', tile: { x: 2, y: 0 }, layerId: 'layer2' });

      const result = deleteLayer('layer1', mockContext);

      const item3 = result.model.views[0].items.find(i => i.id === 'item3');
      expect(item3?.layerId).toBe('layer2');
    });

    it('should return unchanged state when layers is undefined', () => {
      mockState.model.views[0].layers = undefined;

      const result = deleteLayer('layer1', mockContext);

      expect(result).toEqual(mockState);
    });

    it('should handle empty connectors, rectangles, textBoxes arrays', () => {
      mockState.model.views[0].connectors = undefined;
      mockState.model.views[0].rectangles = undefined;
      mockState.model.views[0].textBoxes = undefined;

      const result = deleteLayer('layer1', mockContext);

      expect(result.model.views[0].layers).toHaveLength(1);
    });
  });

  describe('moveItemsToLayer', () => {
    it('should move item to specified layer', () => {
      const result = moveItemsToLayer({
        itemIds: [{ type: 'ITEM', id: 'item2' }],
        layerId: 'layer2'
      }, mockContext);

      const item2 = result.model.views[0].items.find(i => i.id === 'item2');
      expect(item2?.layerId).toBe('layer2');
    });

    it('should move connector to specified layer', () => {
      const result = moveItemsToLayer({
        itemIds: [{ type: 'CONNECTOR', id: 'conn1' }],
        layerId: 'layer2'
      }, mockContext);

      const conn1 = result.model.views[0].connectors?.find(c => c.id === 'conn1');
      expect(conn1?.layerId).toBe('layer2');
    });

    it('should move rectangle to specified layer', () => {
      const result = moveItemsToLayer({
        itemIds: [{ type: 'RECTANGLE', id: 'rect1' }],
        layerId: 'layer2'
      }, mockContext);

      const rect1 = result.model.views[0].rectangles?.find(r => r.id === 'rect1');
      expect(rect1?.layerId).toBe('layer2');
    });

    it('should move textbox to specified layer', () => {
      const result = moveItemsToLayer({
        itemIds: [{ type: 'TEXTBOX', id: 'text1' }],
        layerId: 'layer2'
      }, mockContext);

      const text1 = result.model.views[0].textBoxes?.find(t => t.id === 'text1');
      expect(text1?.layerId).toBe('layer2');
    });

    it('should remove layerId when moving to null layer', () => {
      const result = moveItemsToLayer({
        itemIds: [{ type: 'ITEM', id: 'item1' }],
        layerId: null
      }, mockContext);

      const item1 = result.model.views[0].items.find(i => i.id === 'item1');
      expect(item1?.layerId).toBeUndefined();
    });

    it('should move multiple items at once', () => {
      const result = moveItemsToLayer({
        itemIds: [
          { type: 'ITEM', id: 'item1' },
          { type: 'CONNECTOR', id: 'conn1' }
        ],
        layerId: 'layer2'
      }, mockContext);

      const item1 = result.model.views[0].items.find(i => i.id === 'item1');
      const conn1 = result.model.views[0].connectors?.find(c => c.id === 'conn1');

      expect(item1?.layerId).toBe('layer2');
      expect(conn1?.layerId).toBe('layer2');
    });

    it('should handle non-existent items gracefully', () => {
      const result = moveItemsToLayer({
        itemIds: [{ type: 'ITEM', id: 'nonexistent' }],
        layerId: 'layer2'
      }, mockContext);

      // Should not throw and return state with existing items unchanged
      expect(result.model.views[0].items[0].layerId).toBe('layer1');
    });

    it('should handle undefined connectors array', () => {
      mockState.model.views[0].connectors = undefined;

      const result = moveItemsToLayer({
        itemIds: [{ type: 'CONNECTOR', id: 'conn1' }],
        layerId: 'layer2'
      }, mockContext);

      expect(result.model.views[0].connectors).toBeUndefined();
    });
  });

  describe('state immutability', () => {
    it('should not mutate original state on createLayer', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      createLayer({ id: 'new', name: 'New', visible: true }, mockContext);

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on updateLayer', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      updateLayer({ id: 'layer1', name: 'Changed' }, mockContext);

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on deleteLayer', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      deleteLayer('layer1', mockContext);

      expect(mockState).toEqual(originalState);
    });

    it('should not mutate original state on moveItemsToLayer', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));

      moveItemsToLayer({
        itemIds: [{ type: 'ITEM', id: 'item1' }],
        layerId: 'layer2'
      }, mockContext);

      expect(mockState).toEqual(originalState);
    });
  });
});
