import React, { memo, useMemo, useCallback } from 'react';
import { Coords, AnchorPosition } from 'src/types';
import { Svg } from 'src/components/Svg/Svg';
import { TRANSFORM_CONTROLS_COLOR, UNPROJECTED_TILE_SIZE } from 'src/config';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import {
  getBoundingBox,
  outermostCornerPositions,
  getTilePosition,
  convertBoundsToNamedAnchors,
  sortByPosition
} from 'src/utils';
import { TransformAnchor } from './TransformAnchor';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  from: Coords;
  to: Coords;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const strokeWidth = 2;
const ANCHOR_KEYS: AnchorPosition[] = ['BOTTOM_LEFT', 'BOTTOM_RIGHT', 'TOP_RIGHT', 'TOP_LEFT'];

export const TransformControls = memo(({ from, to, onAnchorMouseDown }: Props) => {
  const viewMode = useUiStateStore((state) => state.viewMode);
  const isTopDown = viewMode === 'TOP_DOWN';
  const { css, pxSize } = useIsoProjection({
    from,
    to
  });

  // Memoize anchor positions separately from handlers
  const anchorPositions = useMemo(() => {
    if (!onAnchorMouseDown) return [];

    if (isTopDown) {
      // In 2D mode, calculate corner positions directly
      const sorted = sortByPosition([from, to]);
      const halfSize = UNPROJECTED_TILE_SIZE / 2;

      return [
        {
          key: 'BOTTOM_LEFT' as AnchorPosition,
          position: {
            x: sorted.lowX * UNPROJECTED_TILE_SIZE - halfSize,
            y: -sorted.lowY * UNPROJECTED_TILE_SIZE + halfSize
          }
        },
        {
          key: 'BOTTOM_RIGHT' as AnchorPosition,
          position: {
            x: (sorted.highX + 1) * UNPROJECTED_TILE_SIZE - halfSize,
            y: -sorted.lowY * UNPROJECTED_TILE_SIZE + halfSize
          }
        },
        {
          key: 'TOP_RIGHT' as AnchorPosition,
          position: {
            x: (sorted.highX + 1) * UNPROJECTED_TILE_SIZE - halfSize,
            y: -(sorted.highY + 1) * UNPROJECTED_TILE_SIZE + halfSize
          }
        },
        {
          key: 'TOP_LEFT' as AnchorPosition,
          position: {
            x: sorted.lowX * UNPROJECTED_TILE_SIZE - halfSize,
            y: -(sorted.highY + 1) * UNPROJECTED_TILE_SIZE + halfSize
          }
        }
      ];
    }

    const corners = getBoundingBox([from, to]);
    const namedCorners = convertBoundsToNamedAnchors(corners);

    return Object.entries(namedCorners).map(([key, value], i) => ({
      key: key as AnchorPosition,
      position: getTilePosition({
        tile: value,
        origin: outermostCornerPositions[i],
        viewMode
      })
    }));
  }, [from, to, onAnchorMouseDown, viewMode, isTopDown]);

  // Stable callback that uses the anchor key
  const handleAnchorMouseDown = useCallback((anchorKey: AnchorPosition) => {
    onAnchorMouseDown?.(anchorKey);
  }, [onAnchorMouseDown]);

  return (
    <>
      <Svg
        style={{
          ...css,
          pointerEvents: 'none'
        }}
      >
        <g transform={`translate(${strokeWidth}, ${strokeWidth})`}>
          <rect
            width={pxSize.width - strokeWidth * 2}
            height={pxSize.height - strokeWidth * 2}
            fill="none"
            stroke={TRANSFORM_CONTROLS_COLOR}
            strokeDasharray={`${strokeWidth * 2} ${strokeWidth * 2}`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      </Svg>

      {anchorPositions.map(({ key, position }) => (
        <TransformAnchor
          key={key}
          position={position}
          onMouseDown={() => handleAnchorMouseDown(key)}
        />
      ))}
    </>
  );
});
