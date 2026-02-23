import React from 'react';
import { Box, Loader as MantineLoader, MantineColor } from '@mantine/core';

interface Props {
  size?: number;
  color?: MantineColor;
  isInline?: boolean;
}

export const Loader = ({ size = 1, color = 'blue', isInline }: Props) => {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isInline ? 'auto' : '100%',
        height: isInline ? 'auto' : '100%'
      }}
    >
      <MantineLoader size={size * 20} color={color} />
    </Box>
  );
};
