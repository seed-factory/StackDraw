import React, { CSSProperties } from 'react';
import { Box, Text, Stack } from '@mantine/core';

interface Props {
  children: React.ReactNode;
  title?: string;
  style?: CSSProperties;
}

export const Section = ({ children, style, title }: Props) => {
  return (
    <Box
      style={{
        paddingTop: 'var(--mantine-spacing-lg)',
        paddingLeft: 'var(--mantine-spacing-lg)',
        paddingRight: 'var(--mantine-spacing-lg)',
        ...style
      }}
    >
      <Stack gap={0}>
        {title && (
          <Text
            size="sm"
            c="dimmed"
            style={{
              textTransform: 'uppercase',
              paddingBottom: 'var(--mantine-spacing-xs)'
            }}
          >
            {title}
          </Text>
        )}
        {children}
      </Stack>
    </Box>
  );
};
