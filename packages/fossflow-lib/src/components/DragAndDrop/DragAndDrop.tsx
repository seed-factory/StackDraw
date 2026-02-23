import React, { useMemo } from 'react';
import { Box } from '@mantine/core';
import { Coords } from 'src/types';
import { getTilePosition } from 'src/utils';
import { useIcon } from 'src/hooks/useIcon';
import { useUiStateStore } from 'src/stores/uiStateStore';

interface Props {
  iconId: string;
  tile: Coords;
}

export const DragAndDrop = ({ iconId, tile }: Props) => {
  const { iconComponent } = useIcon(iconId);
  const viewMode = useUiStateStore((state) => state.viewMode);

  const tilePosition = useMemo(() => {
    return getTilePosition({ tile, origin: 'BOTTOM', viewMode });
  }, [tile, viewMode]);

  return (
    <Box
      style={{
        position: 'absolute',
        left: tilePosition.x,
        top: tilePosition.y
      }}
    >
      {iconComponent}
    </Box>
  );
};
