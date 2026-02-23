import { fixModel, modelFromModelStore } from '../model';
import { Model, ModelStore } from 'src/types';

describe('model utilities', () => {
  describe('fixModel', () => {
    it('should return model unchanged when no issues exist', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Test',
        description: 'Test description',
        colors: [{ id: 'color1', value: '#ff0000' }],
        icons: [{ id: 'icon1', name: 'Icon 1', url: 'http://example.com/icon.svg' }],
        items: [{ id: 'item1', name: 'Item 1', icon: 'icon1' }],
        views: [{
          id: 'view1',
          name: 'View 1',
          items: [{ id: 'item1', tile: { x: 0, y: 0 } }],
          connectors: [{
            id: 'conn1',
            color: 'color1',
            anchors: [
              { id: 'a1', ref: { item: 'item1' } },
              { id: 'a2', ref: { item: 'item1' } }
            ]
          }]
        }]
      };

      const result = fixModel(model);
      expect(result).toEqual(model);
    });

    it('should fix invalid icon reference by removing icon from item', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Test',
        description: '',
        colors: [],
        icons: [], // No icons
        items: [{ id: 'item1', name: 'Item 1', icon: 'nonexistent-icon' }],
        views: []
      };

      const result = fixModel(model);
      expect(result.items[0].icon).toBeUndefined();
    });

    it('should fix connector with too few anchors by removing it', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Test',
        description: '',
        colors: [],
        icons: [],
        items: [{ id: 'item1', name: 'Item 1' }],
        views: [{
          id: 'view1',
          name: 'View 1',
          items: [{ id: 'item1', tile: { x: 0, y: 0 } }],
          connectors: [{
            id: 'conn1',
            anchors: [{ id: 'a1', ref: { item: 'item1' } }] // Only one anchor
          }]
        }]
      };

      const result = fixModel(model);
      expect(result.views[0].connectors).toHaveLength(0);
    });

    it('should handle model with multiple issues', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Test',
        description: '',
        colors: [],
        icons: [],
        items: [
          { id: 'item1', name: 'Item 1', icon: 'bad-icon' },
          { id: 'item2', name: 'Item 2', icon: 'another-bad-icon' }
        ],
        views: [{
          id: 'view1',
          name: 'View 1',
          items: [
            { id: 'item1', tile: { x: 0, y: 0 } },
            { id: 'item2', tile: { x: 1, y: 0 } }
          ],
          connectors: [{
            id: 'conn1',
            anchors: [{ id: 'a1', ref: { item: 'item1' } }] // Too few anchors
          }]
        }]
      };

      const result = fixModel(model);
      expect(result.items[0].icon).toBeUndefined();
      expect(result.items[1].icon).toBeUndefined();
      expect(result.views[0].connectors).toHaveLength(0);
    });

    it('should preserve valid parts of the model', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Preserved Title',
        description: 'Preserved Description',
        colors: [{ id: 'color1', value: '#ff0000' }],
        icons: [],
        items: [{ id: 'item1', name: 'Item 1', icon: 'bad-icon' }],
        views: []
      };

      const result = fixModel(model);
      expect(result.title).toBe('Preserved Title');
      expect(result.description).toBe('Preserved Description');
      expect(result.colors).toHaveLength(1);
    });

    it('should handle empty model', () => {
      const model: Model = {
        version: '1.0.0',
        title: '',
        description: '',
        colors: [],
        icons: [],
        items: [],
        views: []
      };

      const result = fixModel(model);
      expect(result).toEqual(model);
    });

    it('should not modify the original model', () => {
      const original: Model = {
        version: '1.0.0',
        title: 'Test',
        description: '',
        colors: [],
        icons: [],
        items: [{ id: 'item1', name: 'Item 1', icon: 'bad-icon' }],
        views: []
      };

      const originalCopy = JSON.parse(JSON.stringify(original));
      fixModel(original);

      expect(original).toEqual(originalCopy);
    });
  });

  describe('modelFromModelStore', () => {
    it('should extract model from model store', () => {
      const modelStore: ModelStore = {
        version: '2.0.0',
        title: 'Store Title',
        description: 'Store Description',
        colors: [{ id: 'c1', value: '#000' }],
        icons: [{ id: 'i1', name: 'Icon', url: 'http://test.com/icon.svg' }],
        items: [{ id: 'item1', name: 'Item' }],
        views: [{ id: 'v1', name: 'View', items: [] }],
        actions: {} as any // Mock actions
      };

      const result = modelFromModelStore(modelStore);

      expect(result.version).toBe('2.0.0');
      expect(result.title).toBe('Store Title');
      expect(result.description).toBe('Store Description');
      expect(result.colors).toEqual(modelStore.colors);
      expect(result.icons).toEqual(modelStore.icons);
      expect(result.items).toEqual(modelStore.items);
      expect(result.views).toEqual(modelStore.views);
    });

    it('should not include store actions in result', () => {
      const modelStore: ModelStore = {
        version: '1.0.0',
        title: '',
        description: '',
        colors: [],
        icons: [],
        items: [],
        views: [],
        actions: {
          someAction: () => {}
        } as any
      };

      const result = modelFromModelStore(modelStore);

      expect(result).not.toHaveProperty('actions');
      expect(Object.keys(result)).toEqual([
        'version',
        'title',
        'description',
        'colors',
        'icons',
        'items',
        'views'
      ]);
    });

    it('should handle empty arrays', () => {
      const modelStore: ModelStore = {
        version: '',
        title: '',
        description: '',
        colors: [],
        icons: [],
        items: [],
        views: [],
        actions: {} as any
      };

      const result = modelFromModelStore(modelStore);

      expect(result.colors).toEqual([]);
      expect(result.icons).toEqual([]);
      expect(result.items).toEqual([]);
      expect(result.views).toEqual([]);
    });

    it('should preserve complex nested data', () => {
      const complexView = {
        id: 'v1',
        name: 'Complex View',
        items: [
          { id: 'item1', tile: { x: 0, y: 0 }, labelHeight: 100 },
          { id: 'item2', tile: { x: 5, y: 5 }, labelHeight: 80 }
        ],
        connectors: [{
          id: 'conn1',
          anchors: [
            { id: 'a1', ref: { item: 'item1' } },
            { id: 'a2', ref: { item: 'item2' } }
          ],
          color: 'c1'
        }],
        rectangles: [{
          id: 'rect1',
          from: { x: 0, y: 0 },
          to: { x: 10, y: 10 },
          color: 'c1'
        }]
      };

      const modelStore: ModelStore = {
        version: '1.0.0',
        title: 'Complex',
        description: '',
        colors: [{ id: 'c1', value: '#fff' }],
        icons: [],
        items: [
          { id: 'item1', name: 'Item 1' },
          { id: 'item2', name: 'Item 2' }
        ],
        views: [complexView],
        actions: {} as any
      };

      const result = modelFromModelStore(modelStore);

      expect(result.views[0]).toEqual(complexView);
    });
  });
});
