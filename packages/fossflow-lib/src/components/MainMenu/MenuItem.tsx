import React from 'react';
import { Menu, Box, Group } from '@mantine/core';

export interface Props {
  onClick?: () => void;
  Icon?: React.ReactNode;
  children: string | React.ReactNode;
  disabled?: boolean;
}

export const MenuItem = ({
  onClick,
  Icon,
  children,
  disabled = false
}: Props) => {
  return (
    <Menu.Item
      onClick={onClick}
      disabled={disabled}
      leftSection={
        Icon ? (
          <Box style={{ opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
            {Icon}
          </Box>
        ) : undefined
      }
    >
      {children}
    </Menu.Item>
  );
};
