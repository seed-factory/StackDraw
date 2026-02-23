import React from 'react';
import { UnstyledButton, Box, ColorSwatch as MantineColorSwatch } from '@mantine/core';

export type Props = {
  hex: string;
  isActive?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

export const ColorSwatch = ({ hex, onClick, isActive }: Props) => {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        minWidth: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <MantineColorSwatch
        color={hex}
        size={isActive ? 35 : 28}
        style={{
          transition: 'transform 0.1s ease',
          transform: `scale(${isActive ? 1.1 : 1})`
        }}
      />
    </UnstyledButton>
  );
};
