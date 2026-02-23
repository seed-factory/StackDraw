import React from 'react';
import { Box, Stack, Button, Text } from '@mantine/core';
import { Icon as IconI } from 'src/types';

const SIZE = 50;

interface Props {
  icon: IconI;
  onClick?: () => void;
  onMouseDown?: () => void;
  onDoubleClick?: () => void;
}

export const Icon = ({ icon, onClick, onMouseDown, onDoubleClick }: Props) => {
  return (
    <Button
      variant="subtle"
      onClick={onClick}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{
        userSelect: 'none',
        height: 'auto',
        padding: 'var(--mantine-spacing-xs)'
      }}
    >
      <Stack
        style={{ overflow: 'hidden', justifyContent: 'flex-start', width: SIZE }}
        gap="xs"
      >
        <Box style={{ position: 'relative', width: SIZE, height: SIZE, overflow: 'hidden' }}>
          <Box
            component="img"
            draggable={false}
            src={icon.url}
            alt={`Icon ${icon.name}`}
            style={{ width: SIZE, height: SIZE }}
          />
          {icon.isIsometric === false && (
            <Box
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                padding: '1px 4px',
                borderRadius: '4px',
                backgroundColor: 'var(--mantine-color-gray-light)',
                color: 'var(--mantine-color-text)'
              }}
            >
              <Text size="sm">
                flat
              </Text>
            </Box>
          )}
        </Box>
        <Text
          size="sm"
          c="dimmed"
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {icon.name}
        </Text>
      </Stack>
    </Button>
  );
};
