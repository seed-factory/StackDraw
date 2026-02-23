import React, { CSSProperties } from 'react';
import { Box, useMantineColorScheme } from '@mantine/core';

interface Props {
  style?: CSSProperties;
}

export const Gradient = ({ style }: Props) => {
  const { colorScheme } = useMantineColorScheme();

  // Determine if dark mode is active
  const isDark =
    colorScheme === 'dark' ||
    (colorScheme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Use appropriate background color based on theme
  // Light theme: white (#ffffff)
  // Dark theme: Mantine dark body color (#1a1b1e)
  const bgColor = isDark ? '26, 27, 30' : '255, 255, 255';

  return (
    <Box
      style={{
        background: `linear-gradient(0deg, rgba(${bgColor}, 1) 0%, rgba(${bgColor}, 1) 5%, rgba(${bgColor}, 0) 100%)`,
        ...style
      }}
    />
  );
};
