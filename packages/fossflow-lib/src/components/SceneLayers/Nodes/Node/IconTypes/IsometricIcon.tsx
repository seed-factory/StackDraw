import React, { useRef, useEffect } from 'react';
import { Box } from '@mantine/core';
import { PROJECTED_TILE_SIZE, UNPROJECTED_TILE_SIZE } from 'src/config';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  url: string;
  scale?: number;
  onImageLoaded?: () => void;
}

export const IsometricIcon = ({ url, scale = 1, onImageLoaded }: Props) => {
  const ref = useRef<HTMLImageElement>(null);
  const { size, observe, disconnect } = useResizeObserver();
  const viewMode = useUiStateStore((state) => state.viewMode);
  const isTopDown = viewMode === 'TOP_DOWN';

  useEffect(() => {
    if (!ref.current) return;

    observe(ref.current);

    return disconnect;
  }, [observe, disconnect]);

  if (isTopDown) {
    return (
      <Box
        ref={ref}
        component="img"
        onLoad={onImageLoaded}
        src={url}
        style={{
          position: 'absolute',
          width: UNPROJECTED_TILE_SIZE * 0.7 * scale,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />
    );
  }

  return (
    <Box
      ref={ref}
      component="img"
      onLoad={onImageLoaded}
      src={url}
      style={{
        position: 'absolute',
        width: PROJECTED_TILE_SIZE.width * 0.8 * scale,
        top: -size.height,
        left: -size.width / 2,
        pointerEvents: 'none'
      }}
    />
  );
};
