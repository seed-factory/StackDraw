import { model } from '../model';
import { colors } from '../colors';
import { icons } from '../icons';
import { modelItems } from '../modelItems';
import { views } from '../views';

describe('Test fixtures', () => {
  describe('model fixture', () => {
    it('should have valid structure', () => {
      expect(model).toBeDefined();
      expect(model.version).toBe('1.0.0');
      expect(model.title).toBe('TestModel');
      expect(model.description).toBe('TestModelDescription');
    });

    it('should have all required arrays', () => {
      expect(Array.isArray(model.colors)).toBe(true);
      expect(Array.isArray(model.icons)).toBe(true);
      expect(Array.isArray(model.items)).toBe(true);
      expect(Array.isArray(model.views)).toBe(true);
    });

    it('should contain colors from colors fixture', () => {
      expect(model.colors).toEqual(colors);
    });

    it('should contain icons from icons fixture', () => {
      expect(model.icons).toEqual(icons);
    });

    it('should contain items from modelItems fixture', () => {
      expect(model.items).toEqual(modelItems);
    });

    it('should contain views from views fixture', () => {
      expect(model.views).toEqual(views);
    });
  });

  describe('colors fixture', () => {
    it('should have valid color entries', () => {
      expect(colors).toHaveLength(2);
    });

    it('should have color1 with black value', () => {
      const color1 = colors.find(c => c.id === 'color1');
      expect(color1).toBeDefined();
      expect(color1?.value).toBe('#000000');
    });

    it('should have color2 with white value', () => {
      const color2 = colors.find(c => c.id === 'color2');
      expect(color2).toBeDefined();
      expect(color2?.value).toBe('#ffffff');
    });

    it('should have unique ids', () => {
      const ids = colors.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('icons fixture', () => {
    it('should have valid icon entries', () => {
      expect(icons).toHaveLength(2);
    });

    it('should have icon1', () => {
      const icon1 = icons.find(i => i.id === 'icon1');
      expect(icon1).toBeDefined();
      expect(icon1?.name).toBe('Icon1');
      expect(icon1?.url).toContain('server.svg');
    });

    it('should have icon2', () => {
      const icon2 = icons.find(i => i.id === 'icon2');
      expect(icon2).toBeDefined();
      expect(icon2?.name).toBe('Icon2');
      expect(icon2?.url).toContain('block.svg');
    });

    it('should have unique ids', () => {
      const ids = icons.map(i => i.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have valid URLs', () => {
      icons.forEach(icon => {
        expect(icon.url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('modelItems fixture', () => {
    it('should have valid model item entries', () => {
      expect(modelItems).toHaveLength(3);
    });

    it('should have node1 with description', () => {
      const node1 = modelItems.find(i => i.id === 'node1');
      expect(node1).toBeDefined();
      expect(node1?.name).toBe('Node1');
      expect(node1?.icon).toBe('icon1');
      expect(node1?.description).toBe('Node1Description');
    });

    it('should have node2', () => {
      const node2 = modelItems.find(i => i.id === 'node2');
      expect(node2).toBeDefined();
      expect(node2?.name).toBe('Node2');
      expect(node2?.icon).toBe('icon2');
    });

    it('should have node3', () => {
      const node3 = modelItems.find(i => i.id === 'node3');
      expect(node3).toBeDefined();
      expect(node3?.name).toBe('Node3');
      expect(node3?.icon).toBe('icon1');
    });

    it('should have unique ids', () => {
      const ids = modelItems.map(i => i.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should reference valid icons', () => {
      const iconIds = icons.map(i => i.id);
      modelItems.forEach(item => {
        if (item.icon) {
          expect(iconIds).toContain(item.icon);
        }
      });
    });
  });

  describe('views fixture', () => {
    it('should have valid view entries', () => {
      expect(views).toHaveLength(1);
    });

    it('should have view1 with proper structure', () => {
      const view1 = views[0];
      expect(view1.id).toBe('view1');
      expect(view1.name).toBe('View1');
      expect(view1.description).toBe('View1Description');
    });

    it('should have view items', () => {
      const view1 = views[0];
      expect(Array.isArray(view1.items)).toBe(true);
      expect(view1.items).toHaveLength(3);
    });

    it('should have view items with valid coordinates', () => {
      const view1 = views[0];
      view1.items.forEach(item => {
        expect(typeof item.tile.x).toBe('number');
        expect(typeof item.tile.y).toBe('number');
      });
    });

    it('should have rectangles', () => {
      const view1 = views[0];
      expect(Array.isArray(view1.rectangles)).toBe(true);
      expect(view1.rectangles).toHaveLength(2);
    });

    it('should have rectangle with color reference', () => {
      const view1 = views[0];
      const rect1 = view1.rectangles?.find(r => r.id === 'rectangle1');
      expect(rect1?.color).toBe('color1');
    });

    it('should have rectangle without color reference', () => {
      const view1 = views[0];
      const rect2 = view1.rectangles?.find(r => r.id === 'rectangle2');
      expect(rect2?.color).toBeUndefined();
    });

    it('should have connectors', () => {
      const view1 = views[0];
      expect(Array.isArray(view1.connectors)).toBe(true);
      expect(view1.connectors).toHaveLength(2);
    });

    it('should have connector with color reference', () => {
      const view1 = views[0];
      const conn1 = view1.connectors?.find(c => c.id === 'connector1');
      expect(conn1?.color).toBe('color1');
    });

    it('should have connector without color reference', () => {
      const view1 = views[0];
      const conn2 = view1.connectors?.find(c => c.id === 'connector2');
      expect(conn2?.color).toBeUndefined();
    });

    it('should have connectors with valid anchors', () => {
      const view1 = views[0];
      view1.connectors?.forEach(connector => {
        expect(connector.anchors).toHaveLength(2);
        connector.anchors.forEach(anchor => {
          expect(anchor.id).toBeDefined();
          expect(anchor.ref).toBeDefined();
          expect(anchor.ref.item).toBeDefined();
        });
      });
    });

    it('should reference valid model items in view items', () => {
      const view1 = views[0];
      const modelItemIds = modelItems.map(i => i.id);
      view1.items.forEach(item => {
        expect(modelItemIds).toContain(item.id);
      });
    });

    it('should reference valid view items in connector anchors', () => {
      const view1 = views[0];
      const viewItemIds = view1.items.map(i => i.id);
      view1.connectors?.forEach(connector => {
        connector.anchors.forEach(anchor => {
          if (anchor.ref.item) {
            expect(viewItemIds).toContain(anchor.ref.item);
          }
        });
      });
    });

    it('should reference valid colors', () => {
      const view1 = views[0];
      const colorIds = colors.map(c => c.id);

      view1.rectangles?.forEach(rect => {
        if (rect.color) {
          expect(colorIds).toContain(rect.color);
        }
      });

      view1.connectors?.forEach(conn => {
        if (conn.color) {
          expect(colorIds).toContain(conn.color);
        }
      });
    });
  });

  describe('fixture consistency', () => {
    it('should have consistent references across all fixtures', () => {
      const colorIds = new Set(colors.map(c => c.id));
      const iconIds = new Set(icons.map(i => i.id));
      const modelItemIds = new Set(modelItems.map(i => i.id));

      // Check model items reference valid icons
      modelItems.forEach(item => {
        if (item.icon) {
          expect(iconIds.has(item.icon)).toBe(true);
        }
      });

      // Check views reference valid model items
      views.forEach(view => {
        view.items.forEach(viewItem => {
          expect(modelItemIds.has(viewItem.id)).toBe(true);
        });

        // Check connectors reference valid colors
        view.connectors?.forEach(conn => {
          if (conn.color) {
            expect(colorIds.has(conn.color)).toBe(true);
          }
        });

        // Check rectangles reference valid colors
        view.rectangles?.forEach(rect => {
          if (rect.color) {
            expect(colorIds.has(rect.color)).toBe(true);
          }
        });
      });
    });

    it('should have consistent model assembly', () => {
      expect(model.colors).toBe(colors);
      expect(model.icons).toBe(icons);
      expect(model.items).toBe(modelItems);
      expect(model.views).toBe(views);
    });
  });
});
