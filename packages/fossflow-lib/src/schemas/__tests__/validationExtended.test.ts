import {
  validateConnectorAnchor,
  validateConnector,
  validateRectangle,
  validateView,
  validateModelItem,
  validateModel
} from '../validation';
import { Model, Connector, ConnectorAnchor, View, Rectangle, ModelItem } from 'src/types';

describe('validation - extended tests', () => {
  const createBasicModel = (): Model => ({
    version: '1.0.0',
    title: 'Test Model',
    description: '',
    colors: [{ id: 'color1', value: '#ff0000' }],
    icons: [{ id: 'icon1', name: 'Icon 1', url: 'http://example.com/icon.svg' }],
    items: [{ id: 'item1', name: 'Item 1', icon: 'icon1' }],
    views: [{
      id: 'view1',
      name: 'View 1',
      items: [{ id: 'item1', tile: { x: 0, y: 0 } }],
      connectors: [{
        id: 'conn1',
        anchors: [
          { id: 'a1', ref: { item: 'item1' } },
          { id: 'a2', ref: { item: 'item1' } }
        ]
      }]
    }]
  });

  describe('validateConnectorAnchor', () => {
    it('should return no issues for valid anchor with item ref', () => {
      const anchor: ConnectorAnchor = { id: 'a1', ref: { item: 'item1' } };
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }]
      };
      const connector: Connector = {
        id: 'conn1',
        anchors: [anchor]
      };

      const issues = validateConnectorAnchor(anchor, {
        view,
        connector,
        allAnchors: [anchor]
      });

      expect(issues).toHaveLength(0);
    });

    it('should detect invalid view item reference', () => {
      const anchor: ConnectorAnchor = { id: 'a1', ref: { item: 'nonexistent' } };
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }]
      };
      const connector: Connector = {
        id: 'conn1',
        anchors: [anchor]
      };

      const issues = validateConnectorAnchor(anchor, {
        view,
        connector,
        allAnchors: [anchor]
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('INVALID_ANCHOR_TO_VIEW_ITEM_REF');
    });

    it('should detect anchor referencing non-existent anchor', () => {
      const anchor: ConnectorAnchor = { id: 'a1', ref: { anchor: 'nonexistent' } };
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: []
      };
      const connector: Connector = {
        id: 'conn1',
        anchors: [anchor]
      };

      const issues = validateConnectorAnchor(anchor, {
        view,
        connector,
        allAnchors: [anchor]
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('INVALID_ANCHOR_TO_ANCHOR_REF');
    });

    it('should detect anchor with multiple refs', () => {
      const anchor: ConnectorAnchor = {
        id: 'a1',
        ref: { item: 'item1', anchor: 'a2' } as any
      };
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }]
      };
      const connector: Connector = {
        id: 'conn1',
        anchors: [anchor]
      };

      const issues = validateConnectorAnchor(anchor, {
        view,
        connector,
        allAnchors: [anchor, { id: 'a2', ref: { item: 'item1' } }]
      });

      expect(issues.some(i => i.type === 'INVALID_ANCHOR_REF')).toBe(true);
    });

    it('should validate anchor referencing another valid anchor', () => {
      const anchor1: ConnectorAnchor = { id: 'a1', ref: { item: 'item1' } };
      const anchor2: ConnectorAnchor = { id: 'a2', ref: { anchor: 'a1' } };
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }]
      };
      const connector: Connector = {
        id: 'conn1',
        anchors: [anchor1, anchor2]
      };

      const issues = validateConnectorAnchor(anchor2, {
        view,
        connector,
        allAnchors: [anchor1, anchor2]
      });

      expect(issues).toHaveLength(0);
    });
  });

  describe('validateConnector', () => {
    it('should return no issues for valid connector', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const connector = view.connectors![0];

      const issues = validateConnector(connector, {
        view,
        model,
        allAnchors: connector.anchors
      });

      expect(issues).toHaveLength(0);
    });

    it('should detect connector with invalid color reference', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const connector: Connector = {
        id: 'conn1',
        color: 'nonexistent-color',
        anchors: [
          { id: 'a1', ref: { item: 'item1' } },
          { id: 'a2', ref: { item: 'item1' } }
        ]
      };

      const issues = validateConnector(connector, {
        view,
        model,
        allAnchors: connector.anchors
      });

      expect(issues.some(i => i.type === 'INVALID_CONNECTOR_COLOR_REF')).toBe(true);
    });

    it('should detect connector with too few anchors', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const connector: Connector = {
        id: 'conn1',
        anchors: [{ id: 'a1', ref: { item: 'item1' } }]
      };

      const issues = validateConnector(connector, {
        view,
        model,
        allAnchors: connector.anchors
      });

      expect(issues.some(i => i.type === 'CONNECTOR_TOO_FEW_ANCHORS')).toBe(true);
    });

    it('should detect connector with no anchors', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const connector: Connector = {
        id: 'conn1',
        anchors: []
      };

      const issues = validateConnector(connector, {
        view,
        model,
        allAnchors: connector.anchors
      });

      expect(issues.some(i => i.type === 'CONNECTOR_TOO_FEW_ANCHORS')).toBe(true);
    });

    it('should handle connector without color', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const connector: Connector = {
        id: 'conn1',
        anchors: [
          { id: 'a1', ref: { item: 'item1' } },
          { id: 'a2', ref: { item: 'item1' } }
        ]
      };

      const issues = validateConnector(connector, {
        view,
        model,
        allAnchors: connector.anchors
      });

      expect(issues).toHaveLength(0);
    });

    it('should validate all anchors in connector', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const connector: Connector = {
        id: 'conn1',
        anchors: [
          { id: 'a1', ref: { item: 'item1' } },
          { id: 'a2', ref: { item: 'nonexistent' } }
        ]
      };

      const issues = validateConnector(connector, {
        view,
        model,
        allAnchors: connector.anchors
      });

      expect(issues.some(i => i.type === 'INVALID_ANCHOR_TO_VIEW_ITEM_REF')).toBe(true);
    });
  });

  describe('validateRectangle', () => {
    it('should return no issues for valid rectangle', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const rectangle: Rectangle = {
        id: 'rect1',
        from: { x: 0, y: 0 },
        to: { x: 5, y: 5 },
        color: 'color1'
      };

      const issues = validateRectangle(rectangle, { view, model });

      expect(issues).toHaveLength(0);
    });

    it('should detect rectangle with invalid color reference', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const rectangle: Rectangle = {
        id: 'rect1',
        from: { x: 0, y: 0 },
        to: { x: 5, y: 5 },
        color: 'nonexistent-color'
      };

      const issues = validateRectangle(rectangle, { view, model });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('INVALID_RECTANGLE_COLOR_REF');
    });

    it('should handle rectangle without color', () => {
      const model = createBasicModel();
      const view = model.views[0];
      const rectangle: Rectangle = {
        id: 'rect1',
        from: { x: 0, y: 0 },
        to: { x: 5, y: 5 }
      };

      const issues = validateRectangle(rectangle, { view, model });

      expect(issues).toHaveLength(0);
    });
  });

  describe('validateView', () => {
    it('should return no issues for valid view', () => {
      const model = createBasicModel();
      const view = model.views[0];

      const issues = validateView(view, { model });

      expect(issues).toHaveLength(0);
    });

    it('should detect invalid view item to model item reference', () => {
      const model = createBasicModel();
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'nonexistent-item', tile: { x: 0, y: 0 } }]
      };

      const issues = validateView(view, { model });

      expect(issues.some(i => i.type === 'INVALID_VIEW_ITEM_TO_MODEL_ITEM_REF')).toBe(true);
    });

    it('should validate all connectors in view', () => {
      const model = createBasicModel();
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }],
        connectors: [
          {
            id: 'conn1',
            color: 'nonexistent',
            anchors: [
              { id: 'a1', ref: { item: 'item1' } },
              { id: 'a2', ref: { item: 'item1' } }
            ]
          }
        ]
      };

      const issues = validateView(view, { model });

      expect(issues.some(i => i.type === 'INVALID_CONNECTOR_COLOR_REF')).toBe(true);
    });

    it('should validate all rectangles in view', () => {
      const model = createBasicModel();
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }],
        rectangles: [
          {
            id: 'rect1',
            from: { x: 0, y: 0 },
            to: { x: 5, y: 5 },
            color: 'nonexistent'
          }
        ]
      };

      const issues = validateView(view, { model });

      expect(issues.some(i => i.type === 'INVALID_RECTANGLE_COLOR_REF')).toBe(true);
    });

    it('should handle view without connectors', () => {
      const model = createBasicModel();
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }]
      };

      const issues = validateView(view, { model });

      expect(issues).toHaveLength(0);
    });

    it('should handle view without rectangles', () => {
      const model = createBasicModel();
      const view: View = {
        id: 'view1',
        name: 'View 1',
        items: [{ id: 'item1', tile: { x: 0, y: 0 } }]
      };

      const issues = validateView(view, { model });

      expect(issues).toHaveLength(0);
    });
  });

  describe('validateModelItem', () => {
    it('should return no issues for valid model item', () => {
      const model = createBasicModel();
      const modelItem: ModelItem = {
        id: 'item1',
        name: 'Item 1',
        icon: 'icon1'
      };

      const issues = validateModelItem(modelItem, { model });

      expect(issues).toHaveLength(0);
    });

    it('should detect invalid icon reference', () => {
      const model = createBasicModel();
      const modelItem: ModelItem = {
        id: 'item1',
        name: 'Item 1',
        icon: 'nonexistent-icon'
      };

      const issues = validateModelItem(modelItem, { model });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('INVALID_MODEL_TO_ICON_REF');
    });

    it('should handle model item without icon', () => {
      const model = createBasicModel();
      const modelItem: ModelItem = {
        id: 'item1',
        name: 'Item 1'
      };

      const issues = validateModelItem(modelItem, { model });

      expect(issues).toHaveLength(0);
    });
  });

  describe('validateModel', () => {
    it('should return no issues for valid model', () => {
      const model = createBasicModel();

      const issues = validateModel(model);

      expect(issues).toHaveLength(0);
    });

    it('should detect all issues across model', () => {
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
        views: [
          {
            id: 'view1',
            name: 'View 1',
            items: [
              { id: 'item1', tile: { x: 0, y: 0 } },
              { id: 'item2', tile: { x: 1, y: 0 } },
              { id: 'nonexistent', tile: { x: 2, y: 0 } }
            ],
            connectors: [
              {
                id: 'conn1',
                color: 'bad-color',
                anchors: [{ id: 'a1', ref: { item: 'item1' } }] // Too few
              }
            ],
            rectangles: [
              {
                id: 'rect1',
                from: { x: 0, y: 0 },
                to: { x: 5, y: 5 },
                color: 'bad-color'
              }
            ]
          }
        ]
      };

      const issues = validateModel(model);

      // Should have multiple issues
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.type === 'INVALID_MODEL_TO_ICON_REF')).toBe(true);
      expect(issues.some(i => i.type === 'INVALID_VIEW_ITEM_TO_MODEL_ITEM_REF')).toBe(true);
      expect(issues.some(i => i.type === 'CONNECTOR_TOO_FEW_ANCHORS')).toBe(true);
    });

    it('should validate all views in model', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Test',
        description: '',
        colors: [],
        icons: [],
        items: [{ id: 'item1', name: 'Item 1' }],
        views: [
          {
            id: 'view1',
            name: 'View 1',
            items: [{ id: 'nonexistent1', tile: { x: 0, y: 0 } }]
          },
          {
            id: 'view2',
            name: 'View 2',
            items: [{ id: 'nonexistent2', tile: { x: 0, y: 0 } }]
          }
        ]
      };

      const issues = validateModel(model);

      const viewIssues = issues.filter(i => i.type === 'INVALID_VIEW_ITEM_TO_MODEL_ITEM_REF');
      expect(viewIssues).toHaveLength(2);
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

      const issues = validateModel(model);

      expect(issues).toHaveLength(0);
    });

    it('should include meaningful error messages', () => {
      const model: Model = {
        version: '1.0.0',
        title: 'Test',
        description: '',
        colors: [],
        icons: [],
        items: [{ id: 'item1', name: 'Item 1', icon: 'bad-icon' }],
        views: []
      };

      const issues = validateModel(model);

      expect(issues[0].message).toBeDefined();
      expect(issues[0].message.length).toBeGreaterThan(0);
    });
  });
});
