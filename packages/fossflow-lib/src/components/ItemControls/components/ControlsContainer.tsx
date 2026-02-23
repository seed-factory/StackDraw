import React from 'react';
import { Box, Divider } from '@mantine/core';

interface Props {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export const ControlsContainer = ({ header, children }: Props) => {
  return (
    <Box
      onMouseDown={e => e.stopPropagation()}
      onContextMenu={e => e.stopPropagation()}
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'var(--mantine-spacing-md)'
      }}
    >
      {header && (
        <Box
          style={{
            width: '100%',
            zIndex: 1,
            position: 'sticky',
            backgroundColor: 'var(--mantine-color-body)',
            top: 0
          }}
        >
          {header}
          <Divider />
        </Box>
      )}
      <Box
        style={{
          width: '100%',
          flexGrow: 1
        }}
      >
        <Box style={{ width: '100%' }}>{children}</Box>
      </Box>
    </Box>
  );
};
