import { isPointInPolygon, screenPathToTilePath, createSmoothPath } from '../pointInPolygon';
import { Coords } from 'src/types';

describe('pointInPolygon utilities', () => {
  describe('isPointInPolygon', () => {
    describe('basic polygon tests', () => {
      it('should return true for point inside a square', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 }
        ];
        const point: Coords = { x: 5, y: 5 };
        expect(isPointInPolygon(point, polygon)).toBe(true);
      });

      it('should return false for point outside a square', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 }
        ];
        const point: Coords = { x: 15, y: 5 };
        expect(isPointInPolygon(point, polygon)).toBe(false);
      });

      it('should return true for point inside a triangle', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 10 }
        ];
        const point: Coords = { x: 5, y: 3 };
        expect(isPointInPolygon(point, polygon)).toBe(true);
      });

      it('should return false for point outside a triangle', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 10 }
        ];
        const point: Coords = { x: 0, y: 10 };
        expect(isPointInPolygon(point, polygon)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false for polygon with less than 3 vertices', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 }
        ];
        const point: Coords = { x: 5, y: 0 };
        expect(isPointInPolygon(point, polygon)).toBe(false);
      });

      it('should return false for empty polygon', () => {
        const polygon: Coords[] = [];
        const point: Coords = { x: 5, y: 5 };
        expect(isPointInPolygon(point, polygon)).toBe(false);
      });

      it('should handle point at origin with polygon around it', () => {
        const polygon: Coords[] = [
          { x: -10, y: -10 },
          { x: 10, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 }
        ];
        const point: Coords = { x: 0, y: 0 };
        expect(isPointInPolygon(point, polygon)).toBe(true);
      });

      it('should handle negative coordinates', () => {
        const polygon: Coords[] = [
          { x: -20, y: -20 },
          { x: -10, y: -20 },
          { x: -10, y: -10 },
          { x: -20, y: -10 }
        ];
        const point: Coords = { x: -15, y: -15 };
        expect(isPointInPolygon(point, polygon)).toBe(true);
      });
    });

    describe('complex polygons', () => {
      it('should handle pentagon', () => {
        const polygon: Coords[] = [
          { x: 5, y: 0 },
          { x: 10, y: 4 },
          { x: 8, y: 10 },
          { x: 2, y: 10 },
          { x: 0, y: 4 }
        ];
        const pointInside: Coords = { x: 5, y: 5 };
        const pointOutside: Coords = { x: 0, y: 0 };

        expect(isPointInPolygon(pointInside, polygon)).toBe(true);
        expect(isPointInPolygon(pointOutside, polygon)).toBe(false);
      });

      it('should handle L-shaped polygon', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 5 },
          { x: 5, y: 5 },
          { x: 5, y: 10 },
          { x: 0, y: 10 }
        ];
        const pointInBottom: Coords = { x: 2, y: 8 };
        const pointInTop: Coords = { x: 7, y: 2 };
        const pointOutside: Coords = { x: 7, y: 8 };

        expect(isPointInPolygon(pointInBottom, polygon)).toBe(true);
        expect(isPointInPolygon(pointInTop, polygon)).toBe(true);
        expect(isPointInPolygon(pointOutside, polygon)).toBe(false);
      });
    });

    describe('boundary cases', () => {
      it('should handle points near but outside polygon', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 }
        ];
        const point: Coords = { x: -0.1, y: 5 };
        expect(isPointInPolygon(point, polygon)).toBe(false);
      });

      it('should handle very small polygon', () => {
        const polygon: Coords[] = [
          { x: 0, y: 0 },
          { x: 0.1, y: 0 },
          { x: 0.05, y: 0.1 }
        ];
        const pointInside: Coords = { x: 0.05, y: 0.03 };
        expect(isPointInPolygon(pointInside, polygon)).toBe(true);
      });
    });
  });

  describe('screenPathToTilePath', () => {
    it('should convert screen path to tile path using provided function', () => {
      const screenPath: Coords[] = [
        { x: 100, y: 200 },
        { x: 300, y: 400 }
      ];

      const screenToIsoFn = (coords: Coords): Coords => ({
        x: coords.x / 100,
        y: coords.y / 100
      });

      const result = screenPathToTilePath(screenPath, screenToIsoFn);

      expect(result).toEqual([
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ]);
    });

    it('should handle empty path', () => {
      const screenPath: Coords[] = [];
      const screenToIsoFn = (coords: Coords): Coords => coords;

      const result = screenPathToTilePath(screenPath, screenToIsoFn);

      expect(result).toEqual([]);
    });

    it('should handle single point path', () => {
      const screenPath: Coords[] = [{ x: 50, y: 50 }];
      const screenToIsoFn = (coords: Coords): Coords => ({
        x: coords.x * 2,
        y: coords.y * 2
      });

      const result = screenPathToTilePath(screenPath, screenToIsoFn);

      expect(result).toEqual([{ x: 100, y: 100 }]);
    });

    it('should preserve order of points', () => {
      const screenPath: Coords[] = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 }
      ];
      const screenToIsoFn = (coords: Coords): Coords => ({
        x: coords.x + 10,
        y: coords.y + 10
      });

      const result = screenPathToTilePath(screenPath, screenToIsoFn);

      expect(result[0].x).toBe(11);
      expect(result[3].x).toBe(14);
    });
  });

  describe('createSmoothPath', () => {
    it('should return empty string for less than 2 points', () => {
      expect(createSmoothPath([])).toBe('');
      expect(createSmoothPath([{ x: 0, y: 0 }])).toBe('');
    });

    it('should create valid SVG path for 2 points', () => {
      const points: Coords[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ];

      const result = createSmoothPath(points);

      expect(result).toContain('M 0,0');
      expect(result).toContain('Z');
    });

    it('should create valid SVG path for multiple points', () => {
      const points: Coords[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ];

      const result = createSmoothPath(points);

      expect(result).toMatch(/^M/);
      expect(result).toMatch(/Z$/);
      expect(result).toContain('Q');
      expect(result).toContain('L');
    });

    it('should handle 3 points', () => {
      const points: Coords[] = [
        { x: 0, y: 0 },
        { x: 5, y: 10 },
        { x: 10, y: 0 }
      ];

      const result = createSmoothPath(points);

      expect(result.startsWith('M 0,0')).toBe(true);
      expect(result.endsWith('Z')).toBe(true);
    });

    it('should create path with correct starting point', () => {
      const points: Coords[] = [
        { x: 100, y: 200 },
        { x: 300, y: 400 },
        { x: 500, y: 200 }
      ];

      const result = createSmoothPath(points);

      expect(result.startsWith('M 100,200')).toBe(true);
    });

    it('should handle points with decimal values', () => {
      const points: Coords[] = [
        { x: 0.5, y: 0.5 },
        { x: 10.5, y: 0.5 },
        { x: 10.5, y: 10.5 }
      ];

      const result = createSmoothPath(points);

      expect(result).toContain('0.5');
      expect(result).toContain('10.5');
    });

    it('should include quadratic bezier curves for smooth lines', () => {
      const points: Coords[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 },
        { x: 30, y: 10 }
      ];

      const result = createSmoothPath(points);

      // Should contain Q for quadratic bezier
      const qCount = (result.match(/Q/g) || []).length;
      expect(qCount).toBeGreaterThan(0);
    });
  });
});
