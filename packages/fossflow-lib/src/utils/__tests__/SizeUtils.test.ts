import { SizeUtils } from '../SizeUtils';
import { Size } from 'src/types';

describe('SizeUtils', () => {
  describe('isEqual', () => {
    it('should return true for identical sizes', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 100, height: 200 };
      expect(SizeUtils.isEqual(a, b)).toBe(true);
    });

    it('should return false when width differs', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 150, height: 200 };
      expect(SizeUtils.isEqual(a, b)).toBe(false);
    });

    it('should return false when height differs', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 100, height: 250 };
      expect(SizeUtils.isEqual(a, b)).toBe(false);
    });

    it('should return true for zero sizes', () => {
      const a: Size = { width: 0, height: 0 };
      const b: Size = { width: 0, height: 0 };
      expect(SizeUtils.isEqual(a, b)).toBe(true);
    });

    it('should handle decimal sizes', () => {
      const a: Size = { width: 100.5, height: 200.5 };
      const b: Size = { width: 100.5, height: 200.5 };
      expect(SizeUtils.isEqual(a, b)).toBe(true);
    });
  });

  describe('subtract', () => {
    it('should subtract sizes correctly', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 30, height: 50 };
      expect(SizeUtils.subtract(a, b)).toEqual({ width: 70, height: 150 });
    });

    it('should handle subtracting from zero', () => {
      const a: Size = { width: 0, height: 0 };
      const b: Size = { width: 50, height: 100 };
      expect(SizeUtils.subtract(a, b)).toEqual({ width: -50, height: -100 });
    });

    it('should handle negative results', () => {
      const a: Size = { width: 50, height: 100 };
      const b: Size = { width: 100, height: 200 };
      expect(SizeUtils.subtract(a, b)).toEqual({ width: -50, height: -100 });
    });
  });

  describe('add', () => {
    it('should add sizes correctly', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 30, height: 50 };
      expect(SizeUtils.add(a, b)).toEqual({ width: 130, height: 250 });
    });

    it('should handle adding to zero', () => {
      const a: Size = { width: 0, height: 0 };
      const b: Size = { width: 50, height: 100 };
      expect(SizeUtils.add(a, b)).toEqual({ width: 50, height: 100 });
    });
  });

  describe('multiply', () => {
    it('should multiply sizes by a positive number', () => {
      const size: Size = { width: 50, height: 100 };
      expect(SizeUtils.multiply(size, 2)).toEqual({ width: 100, height: 200 });
    });

    it('should multiply sizes by zero', () => {
      const size: Size = { width: 50, height: 100 };
      expect(SizeUtils.multiply(size, 0)).toEqual({ width: 0, height: 0 });
    });

    it('should multiply sizes by a decimal', () => {
      const size: Size = { width: 100, height: 200 };
      expect(SizeUtils.multiply(size, 0.5)).toEqual({ width: 50, height: 100 });
    });

    it('should multiply by 1 (identity)', () => {
      const size: Size = { width: 50, height: 100 };
      expect(SizeUtils.multiply(size, 1)).toEqual({ width: 50, height: 100 });
    });
  });

  describe('toString', () => {
    it('should format size as string', () => {
      const size: Size = { width: 100, height: 200 };
      expect(SizeUtils.toString(size)).toBe('width: 100, height: 200');
    });

    it('should handle zero size', () => {
      const size: Size = { width: 0, height: 0 };
      expect(SizeUtils.toString(size)).toBe('width: 0, height: 0');
    });

    it('should handle decimal sizes', () => {
      const size: Size = { width: 100.5, height: 200.5 };
      expect(SizeUtils.toString(size)).toBe('width: 100.5, height: 200.5');
    });
  });

  describe('zero', () => {
    it('should return zero size', () => {
      const zero = SizeUtils.zero();
      expect(zero.width).toBe(0);
    });

    it('should return a new object each time', () => {
      const a = SizeUtils.zero();
      const b = SizeUtils.zero();
      expect(a).not.toBe(b);
    });
  });

  describe('chained operations', () => {
    it('should support chaining add and subtract', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 50, height: 50 };
      const c: Size = { width: 30, height: 30 };

      const result = SizeUtils.subtract(SizeUtils.add(a, b), c);
      expect(result).toEqual({ width: 120, height: 220 });
    });

    it('should support chaining add and multiply', () => {
      const a: Size = { width: 100, height: 200 };
      const b: Size = { width: 50, height: 50 };

      const result = SizeUtils.multiply(SizeUtils.add(a, b), 2);
      expect(result).toEqual({ width: 300, height: 500 });
    });
  });
});
