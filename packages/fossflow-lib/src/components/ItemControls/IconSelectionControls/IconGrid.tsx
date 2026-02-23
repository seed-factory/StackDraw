import React from 'react';
import { Icon as IconI } from 'src/types';
import { Grid, Box } from '@mantine/core';
import { Icon } from './Icon';

interface Props {
  icons: IconI[];
  onMouseDown?: (icon: IconI) => void;
  onClick?: (icon: IconI) => void;
  onDoubleClick?: (icon: IconI) => void;
  hoveredIndex?: number;
  onHover?: (index: number) => void;
}

export const IconGrid = ({ icons, onMouseDown, onClick, onDoubleClick, hoveredIndex, onHover }: Props) => {
  return (
    <Grid gutter={0}>
      {icons.map((icon, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <Grid.Col span={3} key={icon.id}>
            <Box
              style={{
                backgroundColor: isHovered ? 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))' : 'transparent',
                borderRadius: 'var(--mantine-radius-sm)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={() => onHover?.(index)}
            >
              <Icon
                icon={icon}
                onClick={() => {
                  onClick?.(icon);
                }}
                onMouseDown={() => {
                  onMouseDown?.(icon);
                }}
                onDoubleClick={() => {
                  onDoubleClick?.(icon);
                }}
              />
            </Box>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};
