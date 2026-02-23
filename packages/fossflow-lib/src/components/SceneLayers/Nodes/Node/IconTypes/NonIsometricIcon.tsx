import React from 'react';
import { Box } from '@mantine/core';
import { Icon } from 'src/types';
import { PROJECTED_TILE_SIZE, UNPROJECTED_TILE_SIZE } from 'src/config';
import { getIsoProjectionCss } from 'src/utils';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  icon: Icon;
}

export const NonIsometricIcon = ({ icon }: Props) => {
  const viewMode = useUiStateStore((state) => state.viewMode);
  const isTopDown = viewMode === 'TOP_DOWN';

  if (isTopDown) {
    return (
      <Box style={{ pointerEvents: 'none' }}>
        <Box
          component="img"
          src={icon.url}
          alt={`icon-${icon.id}`}
          style={{
            position: 'absolute',
            width: UNPROJECTED_TILE_SIZE * 0.7 * (icon.scale || 1),
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </Box>
    );
  }

  return (
    <Box style={{ pointerEvents: 'none' }}>
      <Box
        style={{
          position: 'absolute',
          left: -PROJECTED_TILE_SIZE.width / 2,
          top: -PROJECTED_TILE_SIZE.height / 2,
          transformOrigin: 'top left',
          transform: getIsoProjectionCss()
        }}
      >
        <Box
          component="img"
          src={icon.url}
          alt={`icon-${icon.id}`}
          style={{ width: PROJECTED_TILE_SIZE.width * 0.7 * (icon.scale || 1) }}
        />
      </Box>
    </Box>
  );
};
