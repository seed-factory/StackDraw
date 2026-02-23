import {
  generateId,
  getRandom,
  roundToOneDecimalPlace,
  roundToTwoDecimalPlaces,
  getColorVariant,
  setWindowCursor,
  toPx,
  categoriseIcons,
  getStartingMode,
  getItemByIdOrThrow,
  getItemById,
  getItemByIndexOrThrow
} from '../common';
import { Icon } from 'src/types';

describe('common utilities - extended tests', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('getRandom', () => {
    it('should return a number within the range', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandom(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThan(10);
      }
    });

    it('should handle same min and max', () => {
      const result = getRandom(5, 5);
      expect(result).toBe(5);
    });

    it('should return integers', () => {
      for (let i = 0; i < 50; i++) {
        const result = getRandom(0, 100);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should handle negative ranges', () => {
      for (let i = 0; i < 50; i++) {
        const result = getRandom(-10, -5);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThan(-5);
      }
    });

    it('should handle ranges crossing zero', () => {
      for (let i = 0; i < 50; i++) {
        const result = getRandom(-5, 5);
        expect(result).toBeGreaterThanOrEqual(-5);
        expect(result).toBeLessThan(5);
      }
    });
  });

  describe('roundToOneDecimalPlace', () => {
    it('should round to one decimal place', () => {
      expect(roundToOneDecimalPlace(5.67)).toBe(5.7);
      expect(roundToOneDecimalPlace(5.64)).toBe(5.6);
      expect(roundToOneDecimalPlace(5.65)).toBe(5.7);
    });

    it('should handle integers', () => {
      expect(roundToOneDecimalPlace(5)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(roundToOneDecimalPlace(-5.67)).toBe(-5.7);
      expect(roundToOneDecimalPlace(-5.64)).toBe(-5.6);
    });

    it('should handle zero', () => {
      expect(roundToOneDecimalPlace(0)).toBe(0);
    });

    it('should handle numbers with many decimals', () => {
      expect(roundToOneDecimalPlace(5.123456789)).toBe(5.1);
    });
  });

  describe('roundToTwoDecimalPlaces', () => {
    it('should round to two decimal places', () => {
      expect(roundToTwoDecimalPlaces(5.678)).toBe(5.68);
      expect(roundToTwoDecimalPlaces(5.674)).toBe(5.67);
      expect(roundToTwoDecimalPlaces(5.675)).toBe(5.68);
    });

    it('should handle integers', () => {
      expect(roundToTwoDecimalPlaces(5)).toBe(5);
    });

    it('should handle one decimal place', () => {
      expect(roundToTwoDecimalPlaces(5.6)).toBe(5.6);
    });

    it('should handle negative numbers', () => {
      expect(roundToTwoDecimalPlaces(-5.678)).toBe(-5.68);
    });

    it('should handle zero', () => {
      expect(roundToTwoDecimalPlaces(0)).toBe(0);
    });
  });

  describe('getColorVariant', () => {
    it('should lighten a color', () => {
      const result = getColorVariant('#ff0000', 'light', {});
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should darken a color', () => {
      const result = getColorVariant('#ff0000', 'dark', {});
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle alpha option', () => {
      const result = getColorVariant('#ff0000', 'light', { alpha: 0.5 });
      expect(result).toBeDefined();
      // Result should contain rgba or have transparency
    });

    it('should handle grade option', () => {
      const lightGrade1 = getColorVariant('#888888', 'light', { grade: 1 });
      const lightGrade2 = getColorVariant('#888888', 'light', { grade: 2 });
      expect(lightGrade1).not.toBe(lightGrade2);
    });

    it('should handle both alpha and grade', () => {
      const result = getColorVariant('#ff0000', 'dark', { alpha: 0.7, grade: 2 });
      expect(result).toBeDefined();
    });

    it('should work with hex colors', () => {
      const result = getColorVariant('#336699', 'light', {});
      expect(result).toBeDefined();
    });

    it('should work with named colors', () => {
      const result = getColorVariant('red', 'light', {});
      expect(result).toBeDefined();
    });
  });

  describe('setWindowCursor', () => {
    it('should set cursor style on document body', () => {
      setWindowCursor('pointer');
      expect(window.document.body.style.cursor).toBe('pointer');
    });

    it('should set different cursor types', () => {
      setWindowCursor('crosshair');
      expect(window.document.body.style.cursor).toBe('crosshair');

      setWindowCursor('grab');
      expect(window.document.body.style.cursor).toBe('grab');
    });

    it('should reset to default cursor', () => {
      setWindowCursor('pointer');
      setWindowCursor('default');
      expect(window.document.body.style.cursor).toBe('default');
    });
  });

  describe('toPx', () => {
    it('should convert number to px string', () => {
      expect(toPx(100)).toBe('100px');
    });

    it('should handle zero', () => {
      expect(toPx(0)).toBe('0px');
    });

    it('should handle negative numbers', () => {
      expect(toPx(-50)).toBe('-50px');
    });

    it('should handle decimals', () => {
      expect(toPx(50.5)).toBe('50.5px');
    });

    it('should handle string input', () => {
      expect(toPx('100')).toBe('100px');
    });
  });

  describe('categoriseIcons', () => {
    it('should group icons by collection', () => {
      const icons: Icon[] = [
        { id: '1', name: 'icon1', url: 'url1', collection: 'collection1' },
        { id: '2', name: 'icon2', url: 'url2', collection: 'collection1' },
        { id: '3', name: 'icon3', url: 'url3', collection: 'collection2' }
      ];

      const result = categoriseIcons(icons);

      expect(result).toHaveLength(2);
      expect(result.find(c => c.name === 'collection1')?.icons).toHaveLength(2);
      expect(result.find(c => c.name === 'collection2')?.icons).toHaveLength(1);
    });

    it('should handle icons without collection', () => {
      const icons: Icon[] = [
        { id: '1', name: 'icon1', url: 'url1' },
        { id: '2', name: 'icon2', url: 'url2' }
      ];

      const result = categoriseIcons(icons);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBeUndefined();
      expect(result[0].icons).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const result = categoriseIcons([]);
      expect(result).toHaveLength(0);
    });

    it('should handle mixed icons with and without collection', () => {
      const icons: Icon[] = [
        { id: '1', name: 'icon1', url: 'url1', collection: 'collection1' },
        { id: '2', name: 'icon2', url: 'url2' },
        { id: '3', name: 'icon3', url: 'url3', collection: 'collection1' }
      ];

      const result = categoriseIcons(icons);

      expect(result).toHaveLength(2);
    });

    it('should preserve icon data in categories', () => {
      const icons: Icon[] = [
        { id: '1', name: 'icon1', url: 'url1', collection: 'collection1', isIsometric: true }
      ];

      const result = categoriseIcons(icons);

      expect(result[0].icons[0]).toEqual(icons[0]);
    });
  });

  describe('getStartingMode', () => {
    it('should return CURSOR mode for EDITABLE', () => {
      const result = getStartingMode('EDITABLE');
      expect(result.type).toBe('CURSOR');
      expect(result.showCursor).toBe(true);
    });

    it('should return PAN mode for EXPLORABLE_READONLY', () => {
      const result = getStartingMode('EXPLORABLE_READONLY');
      expect(result.type).toBe('PAN');
      expect(result.showCursor).toBe(false);
    });

    it('should return INTERACTIONS_DISABLED mode for NON_INTERACTIVE', () => {
      const result = getStartingMode('NON_INTERACTIVE');
      expect(result.type).toBe('INTERACTIONS_DISABLED');
      expect(result.showCursor).toBe(false);
    });

    it('should throw error for invalid mode', () => {
      expect(() => {
        // @ts-expect-error testing invalid input
        getStartingMode('INVALID');
      }).toThrow('Invalid editor mode.');
    });
  });

  describe('getItemByIdOrThrow', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
      { id: 'c', value: 3 }
    ];

    it('should return item and index for existing id', () => {
      const result = getItemByIdOrThrow(items, 'b');
      expect(result.value).toEqual({ id: 'b', value: 2 });
      expect(result.index).toBe(1);
    });

    it('should throw error for non-existing id', () => {
      expect(() => {
        getItemByIdOrThrow(items, 'nonexistent');
      }).toThrow('Item with id "nonexistent" not found.');
    });

    it('should return first item for first id', () => {
      const result = getItemByIdOrThrow(items, 'a');
      expect(result.index).toBe(0);
    });

    it('should return last item for last id', () => {
      const result = getItemByIdOrThrow(items, 'c');
      expect(result.index).toBe(2);
    });

    it('should throw for empty array', () => {
      expect(() => {
        getItemByIdOrThrow([], 'any');
      }).toThrow();
    });
  });

  describe('getItemById', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
      { id: 'c', value: 3 }
    ];

    it('should return item and index for existing id', () => {
      const result = getItemById(items, 'b');
      expect(result).not.toBeNull();
      expect(result?.value).toEqual({ id: 'b', value: 2 });
      expect(result?.index).toBe(1);
    });

    it('should return null for non-existing id', () => {
      const result = getItemById(items, 'nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for empty array', () => {
      const result = getItemById([], 'any');
      expect(result).toBeNull();
    });
  });

  describe('getItemByIndexOrThrow', () => {
    const items = ['a', 'b', 'c'];

    it('should return item at valid index', () => {
      expect(getItemByIndexOrThrow(items, 0)).toBe('a');
      expect(getItemByIndexOrThrow(items, 1)).toBe('b');
      expect(getItemByIndexOrThrow(items, 2)).toBe('c');
    });

    it('should throw for negative index', () => {
      expect(() => {
        getItemByIndexOrThrow(items, -1);
      }).toThrow('Item with index "-1" not found.');
    });

    it('should throw for out of bounds index', () => {
      expect(() => {
        getItemByIndexOrThrow(items, 3);
      }).toThrow('Item with index "3" not found.');
    });

    it('should throw for empty array', () => {
      expect(() => {
        getItemByIndexOrThrow([], 0);
      }).toThrow();
    });
  });
});
