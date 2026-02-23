import React from 'react';
import { Box } from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useScene } from 'src/hooks/useScene';
import { LineItem } from './LineItem';

export const DebugUtils = () => {
  const uiState = useUiStateStore(
    ({ scroll, mouse, zoom, mode, rendererEl }) => {
      return { scroll, mouse, zoom, mode, rendererEl };
    }
  );
  const scene = useScene();
  const { size: rendererSize } = useResizeObserver(uiState.rendererEl);

  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--mantine-color-body)',
        paddingLeft: 'var(--mantine-spacing-md)',
        paddingRight: 'var(--mantine-spacing-md)',
        paddingTop: 'var(--mantine-spacing-xs)',
        paddingBottom: 'var(--mantine-spacing-xs)'
      }}
    >
      <LineItem
        title="Mouse"
        value={`${uiState.mouse.position.tile.x}, ${uiState.mouse.position.tile.y}`}
      />
      <LineItem
        title="Mouse down"
        value={
          uiState.mouse.mousedown
            ? `${uiState.mouse.mousedown.tile.x}, ${uiState.mouse.mousedown.tile.y}`
            : 'null'
        }
      />
      <LineItem
        title="Mouse delta"
        value={
          uiState.mouse.delta
            ? `${uiState.mouse.delta.tile.x}, ${uiState.mouse.delta.tile.y}`
            : 'null'
        }
      />
      <LineItem
        title="Scroll"
        value={`${uiState.scroll.position.x}, ${uiState.scroll.position.y}`}
      />
      <LineItem title="Zoom" value={uiState.zoom} />
      <LineItem
        title="Size"
        value={`${rendererSize.width}, ${rendererSize.height}`}
      />
      <LineItem
        title="Scene info"
        value={`${scene.items.length} items in scene`}
      />
      <LineItem title="Mode" value={uiState.mode.type} />
      <LineItem
        title="Mode data"
        value={JSON.stringify(uiState.mode, null, 2)}
      />
    </Box>
  );
};
