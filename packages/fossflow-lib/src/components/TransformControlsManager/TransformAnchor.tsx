import React, { memo, useCallback } from 'react';
import { Coords } from 'src/types';
import { Box } from '@mantine/core';
import { getIsoProjectionCss } from 'src/utils';
import { Svg } from 'src/components/Svg/Svg';
import { TRANSFORM_ANCHOR_SIZE, TRANSFORM_CONTROLS_COLOR } from 'src/config';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  position: Coords;
  onMouseDown: () => void;
}

const strokeWidth = 2;
const rectSize = TRANSFORM_ANCHOR_SIZE - strokeWidth * 2;

export const TransformAnchor = memo(({ position, onMouseDown }: Props) => {
  const viewMode = useUiStateStore((state) => state.viewMode);
  const isTopDown = viewMode === 'TOP_DOWN';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onMouseDown();
  }, [onMouseDown]);

  return (
    <Box
      onMouseDown={handleMouseDown}
      className="transform-anchor"
      style={{
        position: 'absolute',
        transform: isTopDown ? 'none' : getIsoProjectionCss(),
        width: TRANSFORM_ANCHOR_SIZE,
        height: TRANSFORM_ANCHOR_SIZE,
        cursor: 'pointer',
        left: position.x - TRANSFORM_ANCHOR_SIZE / 2,
        top: position.y - TRANSFORM_ANCHOR_SIZE / 2
      }}
    >
      <style>{`
        .transform-anchor rect {
          fill: var(--mantine-color-body);
          transition: fill 0.1s;
        }
        .transform-anchor:hover rect {
          fill: var(--mantine-color-blue-7);
        }
      `}</style>
      <Svg
        style={{
          width: TRANSFORM_ANCHOR_SIZE,
          height: TRANSFORM_ANCHOR_SIZE
        }}
      >
        <g transform={`translate(${strokeWidth}, ${strokeWidth})`}>
          <rect
            width={rectSize}
            height={rectSize}
            stroke={TRANSFORM_CONTROLS_COLOR}
            strokeWidth={strokeWidth}
            rx={3}
          />
        </g>
      </Svg>
    </Box>
  );
});
