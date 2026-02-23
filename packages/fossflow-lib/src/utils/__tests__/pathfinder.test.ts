import { findPath } from '../pathfinder';

describe('pathfinder', () => {
  describe('findPath', () => {
    it('should find a path from start to end', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 0, y: 0 },
        to: { x: 5, y: 5 }
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual({ x: 0, y: 0 });
      expect(result[result.length - 1]).toEqual({ x: 5, y: 5 });
    });

    it('should return path with correct start and end points', () => {
      const from = { x: 2, y: 3 };
      const to = { x: 7, y: 8 };

      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from,
        to
      });

      expect(result[0]).toEqual(from);
      expect(result[result.length - 1]).toEqual(to);
    });

    it('should find direct path when start equals end', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 5, y: 5 },
        to: { x: 5, y: 5 }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ x: 5, y: 5 });
    });

    it('should find path for adjacent tiles', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 5, y: 5 },
        to: { x: 6, y: 5 }
      });

      expect(result.length).toBeLessThanOrEqual(2);
      expect(result[0]).toEqual({ x: 5, y: 5 });
      expect(result[result.length - 1]).toEqual({ x: 6, y: 5 });
    });

    it('should handle horizontal path', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 0, y: 5 },
        to: { x: 9, y: 5 }
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(9);
      });
    });

    it('should handle vertical path', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 5, y: 0 },
        to: { x: 5, y: 9 }
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach(point => {
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(9);
      });
    });

    it('should handle diagonal movement', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 0, y: 0 },
        to: { x: 3, y: 3 }
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual({ x: 0, y: 0 });
      expect(result[result.length - 1]).toEqual({ x: 3, y: 3 });
    });

    it('should handle small grid', () => {
      const result = findPath({
        gridSize: { width: 3, height: 3 },
        from: { x: 0, y: 0 },
        to: { x: 2, y: 2 }
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThan(3);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThan(3);
      });
    });

    it('should handle large grid', () => {
      const result = findPath({
        gridSize: { width: 100, height: 100 },
        from: { x: 0, y: 0 },
        to: { x: 99, y: 99 }
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual({ x: 0, y: 0 });
      expect(result[result.length - 1]).toEqual({ x: 99, y: 99 });
    });

    it('should return path with coordinates as objects', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 0, y: 0 },
        to: { x: 5, y: 5 }
      });

      result.forEach(point => {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });

    it('should find efficient path (not excessively long)', () => {
      const result = findPath({
        gridSize: { width: 20, height: 20 },
        from: { x: 0, y: 0 },
        to: { x: 10, y: 10 }
      });

      // With diagonal movement, the path should be relatively short
      // Max manhattan distance is 20, but with diagonals it should be shorter
      expect(result.length).toBeLessThanOrEqual(15);
    });

    it('should handle corner to corner path', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 0, y: 0 },
        to: { x: 9, y: 9 }
      });

      expect(result[0]).toEqual({ x: 0, y: 0 });
      expect(result[result.length - 1]).toEqual({ x: 9, y: 9 });
    });

    it('should handle path from corner to opposite corner', () => {
      const result = findPath({
        gridSize: { width: 10, height: 10 },
        from: { x: 9, y: 0 },
        to: { x: 0, y: 9 }
      });

      expect(result[0]).toEqual({ x: 9, y: 0 });
      expect(result[result.length - 1]).toEqual({ x: 0, y: 9 });
    });

    describe('path validity', () => {
      it('should have continuous path (no teleporting)', () => {
        const result = findPath({
          gridSize: { width: 10, height: 10 },
          from: { x: 0, y: 0 },
          to: { x: 7, y: 7 }
        });

        for (let i = 1; i < result.length; i++) {
          const prev = result[i - 1];
          const curr = result[i];
          const dx = Math.abs(curr.x - prev.x);
          const dy = Math.abs(curr.y - prev.y);

          // Each step should move at most 1 in each direction (including diagonal)
          expect(dx).toBeLessThanOrEqual(1);
          expect(dy).toBeLessThanOrEqual(1);
        }
      });

      it('should not go outside grid bounds', () => {
        const gridSize = { width: 10, height: 10 };
        const result = findPath({
          gridSize,
          from: { x: 0, y: 0 },
          to: { x: 9, y: 9 }
        });

        result.forEach(point => {
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.x).toBeLessThan(gridSize.width);
          expect(point.y).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeLessThan(gridSize.height);
        });
      });
    });
  });
});
