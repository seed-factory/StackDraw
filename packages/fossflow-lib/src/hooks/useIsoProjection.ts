import { useMemo } from 'react';
import { Coords, Size, ProjectionOrientationEnum } from 'src/types';
import {
  getBoundingBox,
  getIsoProjectionCss,
  getTilePosition,
  sortByPosition
} from 'src/utils';
import { UNPROJECTED_TILE_SIZE } from 'src/config';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  from: Coords;
  to: Coords;
  originOverride?: Coords;
  orientation?: keyof typeof ProjectionOrientationEnum;
}

export const useIsoProjection = ({
  from,
  to,
  originOverride,
  orientation
}: Props): {
  css: React.CSSProperties;
  position: Coords;
  gridSize: Size;
  pxSize: Size;
} => {
  const viewMode = useUiStateStore((state) => state.viewMode);
  const isTopDown = viewMode === 'TOP_DOWN';

  const gridSize = useMemo(() => {
    return {
      width: Math.abs(from.x - to.x) + 1,
      height: Math.abs(from.y - to.y) + 1
    };
  }, [from, to]);

  const origin = useMemo(() => {
    if (originOverride) return originOverride;

    const boundingBox = getBoundingBox([from, to]);

    return boundingBox[3];
  }, [from, to, originOverride]);

  const position = useMemo(() => {
    if (isTopDown) {
      // In 2D mode, calculate top-left corner of the bounding area
      const sorted = sortByPosition([from, to]);
      const halfSize = UNPROJECTED_TILE_SIZE / 2;

      // Top-left corner: lowest X, highest Y (in tile coords)
      // Screen position: tile center minus half tile size
      return {
        x: sorted.lowX * UNPROJECTED_TILE_SIZE - halfSize,
        y: -sorted.highY * UNPROJECTED_TILE_SIZE - halfSize
      };
    }

    const pos = getTilePosition({
      tile: origin,
      origin: orientation === 'Y' ? 'TOP' : 'LEFT',
      viewMode
    });

    return pos;
  }, [origin, orientation, viewMode, isTopDown, from, to]);

  const pxSize = useMemo(() => {
    return {
      width: gridSize.width * UNPROJECTED_TILE_SIZE,
      height: gridSize.height * UNPROJECTED_TILE_SIZE
    };
  }, [gridSize]);

  return useMemo(() => ({
    css: {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
      width: `${pxSize.width}px`,
      height: `${pxSize.height}px`,
      transform: isTopDown ? 'none' : getIsoProjectionCss(orientation),
      transformOrigin: 'top left'
    },
    position,
    gridSize,
    pxSize
  }), [position, pxSize, gridSize, orientation, isTopDown]);
};
