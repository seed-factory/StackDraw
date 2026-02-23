import { CoordsUtils } from '../CoordsUtils';
import { Coords } from 'src/types';

describe('CoordsUtils', () => {
  describe('isEqual', () => {
    it('should return true for identical coordinates', () => {
      const a: Coords = { x: 5, y: 10 };
      const b: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.isEqual(a, b)).toBe(true);
    });

    it('should return false when x differs', () => {
      const a: Coords = { x: 5, y: 10 };
      const b: Coords = { x: 6, y: 10 };
      expect(CoordsUtils.isEqual(a, b)).toBe(false);
    });

    it('should return false when y differs', () => {
      const a: Coords = { x: 5, y: 10 };
      const b: Coords = { x: 5, y: 11 };
      expect(CoordsUtils.isEqual(a, b)).toBe(false);
    });

    it('should return true for zero coordinates', () => {
      const a: Coords = { x: 0, y: 0 };
      const b: Coords = { x: 0, y: 0 };
      expect(CoordsUtils.isEqual(a, b)).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const a: Coords = { x: -5, y: -10 };
      const b: Coords = { x: -5, y: -10 };
      expect(CoordsUtils.isEqual(a, b)).toBe(true);
    });

    it('should handle decimal coordinates', () => {
      const a: Coords = { x: 5.5, y: 10.5 };
      const b: Coords = { x: 5.5, y: 10.5 };
      expect(CoordsUtils.isEqual(a, b)).toBe(true);
    });
  });

  describe('subtract', () => {
    it('should subtract coordinates correctly', () => {
      const a: Coords = { x: 10, y: 20 };
      const b: Coords = { x: 3, y: 5 };
      expect(CoordsUtils.subtract(a, b)).toEqual({ x: 7, y: 15 });
    });

    it('should handle subtracting from zero', () => {
      const a: Coords = { x: 0, y: 0 };
      const b: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.subtract(a, b)).toEqual({ x: -5, y: -10 });
    });

    it('should handle negative results', () => {
      const a: Coords = { x: 5, y: 10 };
      const b: Coords = { x: 10, y: 20 };
      expect(CoordsUtils.subtract(a, b)).toEqual({ x: -5, y: -10 });
    });

    it('should handle subtracting negative coordinates', () => {
      const a: Coords = { x: 10, y: 20 };
      const b: Coords = { x: -5, y: -10 };
      expect(CoordsUtils.subtract(a, b)).toEqual({ x: 15, y: 30 });
    });
  });

  describe('add', () => {
    it('should add coordinates correctly', () => {
      const a: Coords = { x: 10, y: 20 };
      const b: Coords = { x: 3, y: 5 };
      expect(CoordsUtils.add(a, b)).toEqual({ x: 13, y: 25 });
    });

    it('should handle adding to zero', () => {
      const a: Coords = { x: 0, y: 0 };
      const b: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.add(a, b)).toEqual({ x: 5, y: 10 });
    });

    it('should handle adding negative coordinates', () => {
      const a: Coords = { x: 10, y: 20 };
      const b: Coords = { x: -5, y: -10 };
      expect(CoordsUtils.add(a, b)).toEqual({ x: 5, y: 10 });
    });
  });

  describe('multiply', () => {
    it('should multiply coordinates by a positive number', () => {
      const coords: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.multiply(coords, 2)).toEqual({ x: 10, y: 20 });
    });

    it('should multiply coordinates by zero', () => {
      const coords: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.multiply(coords, 0)).toEqual({ x: 0, y: 0 });
    });

    it('should multiply coordinates by a negative number', () => {
      const coords: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.multiply(coords, -2)).toEqual({ x: -10, y: -20 });
    });

    it('should multiply coordinates by a decimal', () => {
      const coords: Coords = { x: 10, y: 20 };
      expect(CoordsUtils.multiply(coords, 0.5)).toEqual({ x: 5, y: 10 });
    });

    it('should multiply by 1 (identity)', () => {
      const coords: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.multiply(coords, 1)).toEqual({ x: 5, y: 10 });
    });
  });

  describe('toString', () => {
    it('should format coordinates as string', () => {
      const coords: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.toString(coords)).toBe('x: 5, y: 10');
    });

    it('should handle zero coordinates', () => {
      const coords: Coords = { x: 0, y: 0 };
      expect(CoordsUtils.toString(coords)).toBe('x: 0, y: 0');
    });

    it('should handle negative coordinates', () => {
      const coords: Coords = { x: -5, y: -10 };
      expect(CoordsUtils.toString(coords)).toBe('x: -5, y: -10');
    });

    it('should handle decimal coordinates', () => {
      const coords: Coords = { x: 5.5, y: 10.5 };
      expect(CoordsUtils.toString(coords)).toBe('x: 5.5, y: 10.5');
    });
  });

  describe('sum', () => {
    it('should return sum of x and y', () => {
      const coords: Coords = { x: 5, y: 10 };
      expect(CoordsUtils.sum(coords)).toBe(15);
    });

    it('should return 0 for zero coordinates', () => {
      const coords: Coords = { x: 0, y: 0 };
      expect(CoordsUtils.sum(coords)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const coords: Coords = { x: -5, y: 10 };
      expect(CoordsUtils.sum(coords)).toBe(5);
    });

    it('should handle both negative coordinates', () => {
      const coords: Coords = { x: -5, y: -10 };
      expect(CoordsUtils.sum(coords)).toBe(-15);
    });
  });

  describe('zero', () => {
    it('should return zero coordinates', () => {
      expect(CoordsUtils.zero()).toEqual({ x: 0, y: 0 });
    });

    it('should return a new object each time', () => {
      const a = CoordsUtils.zero();
      const b = CoordsUtils.zero();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('chained operations', () => {
    it('should support chaining add and subtract', () => {
      const a: Coords = { x: 10, y: 20 };
      const b: Coords = { x: 5, y: 5 };
      const c: Coords = { x: 3, y: 3 };

      const result = CoordsUtils.subtract(CoordsUtils.add(a, b), c);
      expect(result).toEqual({ x: 12, y: 22 });
    });

    it('should support chaining add and multiply', () => {
      const a: Coords = { x: 10, y: 20 };
      const b: Coords = { x: 5, y: 5 };

      const result = CoordsUtils.multiply(CoordsUtils.add(a, b), 2);
      expect(result).toEqual({ x: 30, y: 50 });
    });
  });
});
