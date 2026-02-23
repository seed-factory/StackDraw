import { migrateLegacyLabels, getConnectorLabels, getLabelTileIndex } from '../connectorLabels';
import { Connector, ConnectorLabel } from 'src/types';

// Mock the generateId function
jest.mock('../common', () => ({
  ...jest.requireActual('../common'),
  generateId: jest.fn(() => 'mocked-id')
}));

describe('connectorLabels utilities', () => {
  describe('migrateLegacyLabels', () => {
    it('should return empty array for connector with no labels', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: []
      };

      const result = migrateLegacyLabels(connector);

      expect(result).toEqual([]);
    });

    it('should migrate startLabel to 10% position', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        startLabel: 'Start',
        startLabelHeight: 20
      };

      const result = migrateLegacyLabels(connector);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Start');
      expect(result[0].position).toBe(10);
      expect(result[0].height).toBe(20);
      expect(result[0].line).toBe('1');
    });

    it('should migrate description to 50% position', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        description: 'Center Label',
        centerLabelHeight: 30
      };

      const result = migrateLegacyLabels(connector);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Center Label');
      expect(result[0].position).toBe(50);
      expect(result[0].height).toBe(30);
    });

    it('should migrate endLabel to 90% position', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        endLabel: 'End',
        endLabelHeight: 15
      };

      const result = migrateLegacyLabels(connector);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('End');
      expect(result[0].position).toBe(90);
      expect(result[0].height).toBe(15);
    });

    it('should migrate all legacy labels in order', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        startLabel: 'Start',
        startLabelHeight: 10,
        description: 'Middle',
        centerLabelHeight: 20,
        endLabel: 'End',
        endLabelHeight: 30
      };

      const result = migrateLegacyLabels(connector);

      expect(result).toHaveLength(3);
      expect(result[0].position).toBe(10);
      expect(result[1].position).toBe(50);
      expect(result[2].position).toBe(90);
    });

    it('should generate unique ids for each label', () => {
      const generateId = require('../common').generateId;
      generateId.mockReturnValueOnce('id1').mockReturnValueOnce('id2');

      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        startLabel: 'Start',
        endLabel: 'End'
      };

      const result = migrateLegacyLabels(connector);

      expect(result[0].id).toBe('id1');
      expect(result[1].id).toBe('id2');
    });

    it('should handle undefined label heights', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        startLabel: 'Start'
      };

      const result = migrateLegacyLabels(connector);

      expect(result[0].height).toBeUndefined();
    });
  });

  describe('getConnectorLabels', () => {
    it('should return existing labels if present', () => {
      const existingLabels: ConnectorLabel[] = [
        { id: 'l1', text: 'Label 1', position: 25, line: '1' },
        { id: 'l2', text: 'Label 2', position: 75, line: '1' }
      ];

      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        labels: existingLabels,
        startLabel: 'Legacy Start' // Should be ignored
      };

      const result = getConnectorLabels(connector);

      expect(result).toEqual(existingLabels);
      expect(result).toHaveLength(2);
    });

    it('should migrate legacy labels when no new labels exist', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        description: 'Center Label'
      };

      const result = getConnectorLabels(connector);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Center Label');
    });

    it('should migrate legacy labels when labels array is empty', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: [],
        labels: [],
        startLabel: 'Start'
      };

      const result = getConnectorLabels(connector);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Start');
    });

    it('should return empty array when no labels of any kind exist', () => {
      const connector: Connector = {
        id: 'conn1',
        anchors: []
      };

      const result = getConnectorLabels(connector);

      expect(result).toEqual([]);
    });
  });

  describe('getLabelTileIndex', () => {
    it('should return 0 for 0% position', () => {
      const result = getLabelTileIndex(10, 0);
      expect(result).toBe(0);
    });

    it('should return last index for 100% position', () => {
      const result = getLabelTileIndex(10, 100);
      expect(result).toBe(9);
    });

    it('should return middle index for 50% position', () => {
      const result = getLabelTileIndex(11, 50);
      expect(result).toBe(5);
    });

    it('should return 0 for zero-length path', () => {
      const result = getLabelTileIndex(0, 50);
      expect(result).toBe(0);
    });

    it('should clamp to valid range for negative position', () => {
      const result = getLabelTileIndex(10, -10);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should clamp to valid range for position > 100', () => {
      const result = getLabelTileIndex(10, 150);
      expect(result).toBeLessThan(10);
    });

    it('should handle single tile path', () => {
      const result = getLabelTileIndex(1, 50);
      expect(result).toBe(0);
    });

    it('should handle two tile path', () => {
      expect(getLabelTileIndex(2, 0)).toBe(0);
      expect(getLabelTileIndex(2, 100)).toBe(1);
      expect(getLabelTileIndex(2, 50)).toBe(1);
    });

    it('should return integer index', () => {
      const result = getLabelTileIndex(10, 33);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle positions at each quarter', () => {
      const pathLength = 9; // 0-8

      expect(getLabelTileIndex(pathLength, 0)).toBe(0);
      expect(getLabelTileIndex(pathLength, 25)).toBe(2);
      expect(getLabelTileIndex(pathLength, 50)).toBe(4);
      expect(getLabelTileIndex(pathLength, 75)).toBe(6);
      expect(getLabelTileIndex(pathLength, 100)).toBe(8);
    });
  });
});
