import {
  UNPROJECTED_TILE_SIZE,
  TILE_PROJECTION_MULTIPLIERS,
  PROJECTED_TILE_SIZE,
  DEFAULT_COLOR,
  DEFAULT_FONT_FAMILY,
  VIEW_DEFAULTS,
  VIEW_ITEM_DEFAULTS,
  CONNECTOR_DEFAULTS,
  CONNECTOR_SEARCH_OFFSET,
  TEXTBOX_DEFAULTS,
  TEXTBOX_PADDING,
  TEXTBOX_FONT_WEIGHT,
  RECTANGLE_DEFAULTS,
  ZOOM_INCREMENT,
  MIN_ZOOM,
  MAX_ZOOM,
  TRANSFORM_ANCHOR_SIZE,
  TRANSFORM_CONTROLS_COLOR,
  INITIAL_DATA,
  INITIAL_UI_STATE,
  INITIAL_SCENE_STATE,
  MAIN_MENU_OPTIONS,
  DEFAULT_ICON,
  DEFAULT_LABEL_HEIGHT,
  PROJECT_BOUNDING_BOX_PADDING,
  MARKDOWN_EMPTY_VALUE
} from '../config';

describe('config constants', () => {
  describe('tile configuration', () => {
    it('should have correct unprojected tile size', () => {
      expect(UNPROJECTED_TILE_SIZE).toBe(100);
      expect(typeof UNPROJECTED_TILE_SIZE).toBe('number');
    });

    it('should have valid projection multipliers', () => {
      expect(TILE_PROJECTION_MULTIPLIERS.width).toBeGreaterThan(0);
      expect(TILE_PROJECTION_MULTIPLIERS.height).toBeGreaterThan(0);
      expect(TILE_PROJECTION_MULTIPLIERS.width).toBeCloseTo(1.415, 2);
      expect(TILE_PROJECTION_MULTIPLIERS.height).toBeCloseTo(0.819, 2);
    });

    it('should calculate projected tile size correctly', () => {
      expect(PROJECTED_TILE_SIZE.width).toBe(UNPROJECTED_TILE_SIZE * TILE_PROJECTION_MULTIPLIERS.width);
      expect(PROJECTED_TILE_SIZE.height).toBe(UNPROJECTED_TILE_SIZE * TILE_PROJECTION_MULTIPLIERS.height);
    });
  });

  describe('default color', () => {
    it('should have valid default color', () => {
      expect(DEFAULT_COLOR.id).toBe('__DEFAULT__');
      expect(typeof DEFAULT_COLOR.value).toBe('string');
      expect(DEFAULT_COLOR.value).toBeTruthy();
    });
  });

  describe('typography', () => {
    it('should have default font family', () => {
      expect(DEFAULT_FONT_FAMILY).toBe('Roboto, Arial, sans-serif');
    });
  });

  describe('view defaults', () => {
    it('should have required view properties', () => {
      expect(VIEW_DEFAULTS.name).toBe('Untitled view');
      expect(Array.isArray(VIEW_DEFAULTS.items)).toBe(true);
      expect(Array.isArray(VIEW_DEFAULTS.connectors)).toBe(true);
      expect(Array.isArray(VIEW_DEFAULTS.rectangles)).toBe(true);
      expect(Array.isArray(VIEW_DEFAULTS.textBoxes)).toBe(true);
      expect(Array.isArray(VIEW_DEFAULTS.groups)).toBe(true);
      expect(Array.isArray(VIEW_DEFAULTS.layers)).toBe(true);
    });

    it('should have empty arrays by default', () => {
      expect(VIEW_DEFAULTS.items).toHaveLength(0);
      expect(VIEW_DEFAULTS.connectors).toHaveLength(0);
      expect(VIEW_DEFAULTS.rectangles).toHaveLength(0);
      expect(VIEW_DEFAULTS.textBoxes).toHaveLength(0);
      expect(VIEW_DEFAULTS.groups).toHaveLength(0);
      expect(VIEW_DEFAULTS.layers).toHaveLength(0);
    });
  });

  describe('view item defaults', () => {
    it('should have valid label height', () => {
      expect(VIEW_ITEM_DEFAULTS.labelHeight).toBe(80);
      expect(typeof VIEW_ITEM_DEFAULTS.labelHeight).toBe('number');
    });
  });

  describe('connector defaults', () => {
    it('should have valid connector properties', () => {
      expect(CONNECTOR_DEFAULTS.width).toBe(10);
      expect(CONNECTOR_DEFAULTS.description).toBe('');
      expect(CONNECTOR_DEFAULTS.startLabel).toBe('');
      expect(CONNECTOR_DEFAULTS.endLabel).toBe('');
      expect(CONNECTOR_DEFAULTS.style).toBe('SOLID');
      expect(CONNECTOR_DEFAULTS.lineType).toBe('SINGLE');
      expect(CONNECTOR_DEFAULTS.showArrow).toBe(true);
      expect(CONNECTOR_DEFAULTS.arrowDirection).toBe('FORWARD');
    });

    it('should have empty labels array', () => {
      expect(Array.isArray(CONNECTOR_DEFAULTS.labels)).toBe(true);
      expect(CONNECTOR_DEFAULTS.labels).toHaveLength(0);
    });

    it('should have valid search offset', () => {
      expect(CONNECTOR_SEARCH_OFFSET.x).toBe(1);
      expect(CONNECTOR_SEARCH_OFFSET.y).toBe(1);
    });
  });

  describe('textbox defaults', () => {
    it('should have valid textbox properties', () => {
      expect(TEXTBOX_DEFAULTS.orientation).toBe('X');
      expect(TEXTBOX_DEFAULTS.fontSize).toBe(0.6);
      expect(TEXTBOX_DEFAULTS.content).toBe('Text');
    });

    it('should have valid textbox styling', () => {
      expect(TEXTBOX_PADDING).toBe(0.2);
      expect(TEXTBOX_FONT_WEIGHT).toBe('bold');
    });
  });

  describe('rectangle defaults', () => {
    it('should have empty custom color by default', () => {
      expect(RECTANGLE_DEFAULTS.customColor).toBe('');
    });
  });

  describe('zoom configuration', () => {
    it('should have valid zoom parameters', () => {
      expect(ZOOM_INCREMENT).toBe(0.05);
      expect(MIN_ZOOM).toBe(0.1);
      expect(MAX_ZOOM).toBe(1);
    });

    it('should have min zoom less than max zoom', () => {
      expect(MIN_ZOOM).toBeLessThan(MAX_ZOOM);
    });

    it('should have zoom increment less than range', () => {
      expect(ZOOM_INCREMENT).toBeLessThan(MAX_ZOOM - MIN_ZOOM);
    });
  });

  describe('transform controls', () => {
    it('should have valid anchor size', () => {
      expect(TRANSFORM_ANCHOR_SIZE).toBe(30);
      expect(typeof TRANSFORM_ANCHOR_SIZE).toBe('number');
    });

    it('should have valid transform color', () => {
      expect(TRANSFORM_CONTROLS_COLOR).toBe('#0392ff');
      expect(TRANSFORM_CONTROLS_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('initial data', () => {
    it('should have required initial data properties', () => {
      expect(INITIAL_DATA.title).toBe('Untitled');
      expect(INITIAL_DATA.version).toBe('');
      expect(Array.isArray(INITIAL_DATA.icons)).toBe(true);
      expect(Array.isArray(INITIAL_DATA.colors)).toBe(true);
      expect(Array.isArray(INITIAL_DATA.items)).toBe(true);
      expect(Array.isArray(INITIAL_DATA.views)).toBe(true);
      expect(INITIAL_DATA.fitToView).toBe(false);
    });

    it('should have default color in colors array', () => {
      expect(INITIAL_DATA.colors).toHaveLength(1);
      expect(INITIAL_DATA.colors[0]).toEqual(DEFAULT_COLOR);
    });
  });

  describe('initial UI state', () => {
    it('should have valid zoom', () => {
      expect(INITIAL_UI_STATE.zoom).toBe(1);
    });

    it('should have valid scroll position', () => {
      expect(INITIAL_UI_STATE.scroll.position).toEqual({ x: 0, y: 0 });
      expect(INITIAL_UI_STATE.scroll.offset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('initial scene state', () => {
    it('should have empty connectors and textBoxes objects', () => {
      expect(INITIAL_SCENE_STATE.connectors).toEqual({});
      expect(INITIAL_SCENE_STATE.textBoxes).toEqual({});
    });
  });

  describe('main menu options', () => {
    it('should have expected menu options', () => {
      expect(MAIN_MENU_OPTIONS).toContain('ACTION.OPEN');
      expect(MAIN_MENU_OPTIONS).toContain('EXPORT.JSON');
      expect(MAIN_MENU_OPTIONS).toContain('EXPORT.PNG');
      expect(MAIN_MENU_OPTIONS).toContain('ACTION.CLEAR_CANVAS');
      expect(MAIN_MENU_OPTIONS).toContain('LINK.DISCORD');
      expect(MAIN_MENU_OPTIONS).toContain('LINK.GITHUB');
      expect(MAIN_MENU_OPTIONS).toContain('VERSION');
    });

    it('should be an array', () => {
      expect(Array.isArray(MAIN_MENU_OPTIONS)).toBe(true);
    });
  });

  describe('default icon', () => {
    it('should have required properties', () => {
      expect(DEFAULT_ICON.id).toBe('default');
      expect(DEFAULT_ICON.name).toBe('block');
      expect(DEFAULT_ICON.isIsometric).toBe(true);
      expect(DEFAULT_ICON.url).toBe('');
    });
  });

  describe('miscellaneous constants', () => {
    it('should have valid default label height', () => {
      expect(DEFAULT_LABEL_HEIGHT).toBe(20);
    });

    it('should have valid project bounding box padding', () => {
      expect(PROJECT_BOUNDING_BOX_PADDING).toBe(3);
    });

    it('should have markdown empty value', () => {
      expect(MARKDOWN_EMPTY_VALUE).toBe('<p><br></p>');
    });
  });

  describe('type safety', () => {
    it('should have correct types for all constants', () => {
      // Numbers
      expect(typeof UNPROJECTED_TILE_SIZE).toBe('number');
      expect(typeof ZOOM_INCREMENT).toBe('number');
      expect(typeof MIN_ZOOM).toBe('number');
      expect(typeof MAX_ZOOM).toBe('number');

      // Strings
      expect(typeof DEFAULT_FONT_FAMILY).toBe('string');
      expect(typeof TRANSFORM_CONTROLS_COLOR).toBe('string');
      expect(typeof MARKDOWN_EMPTY_VALUE).toBe('string');

      // Objects
      expect(typeof TILE_PROJECTION_MULTIPLIERS).toBe('object');
      expect(typeof PROJECTED_TILE_SIZE).toBe('object');
      expect(typeof DEFAULT_COLOR).toBe('object');
      expect(typeof INITIAL_DATA).toBe('object');
      expect(typeof INITIAL_UI_STATE).toBe('object');
      expect(typeof INITIAL_SCENE_STATE).toBe('object');
      expect(typeof DEFAULT_ICON).toBe('object');

      // Arrays
      expect(Array.isArray(MAIN_MENU_OPTIONS)).toBe(true);
    });
  });
});
