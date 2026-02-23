import React, { useMemo } from 'react';
import { UnstyledButton, Box, Tooltip } from '@mantine/core';
import { useCustomTheme } from 'src/hooks/useCustomTheme';

interface Props {
  name: string;
  Icon: React.ReactNode;
  isActive?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  hotkeyLabel?: string | null;
}

export const IconButton = ({
  name,
  Icon,
  onClick,
  isActive = false,
  disabled = false,
  tooltipPosition = 'bottom',
  hotkeyLabel
}: Props) => {
  const theme = useCustomTheme();
  const size = theme.customVars.toolMenu.height;

  const iconColor = useMemo(() => {
    if (isActive) {
      return 'var(--mantine-color-blue-7)';
    }

    if (disabled) {
      return 'var(--mantine-color-gray-4)';
    }

    return 'var(--mantine-color-gray-6)';
  }, [disabled, isActive]);

  return (
    <Tooltip
      label={name}
      position={tooltipPosition}
      openDelay={1000}
      withArrow
    >
      <UnstyledButton
        onClick={onClick}
        disabled={disabled}
        style={{
          borderRadius: 0,
          height: size,
          width: size,
          maxWidth: '100%',
          minWidth: 'auto',
          backgroundColor: isActive ? 'var(--mantine-color-blue-light)' : undefined,
          padding: 0,
          margin: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            color: iconColor
          }}
        >
          {Icon}
          {hotkeyLabel && (
            <Box
              component="span"
              style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                fontSize: '9px',
                fontWeight: 600,
                lineHeight: 1,
                color: isActive ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-gray-5)',
                textTransform: 'uppercase',
                pointerEvents: 'none'
              }}
            >
              {hotkeyLabel}
            </Box>
          )}
        </Box>
      </UnstyledButton>
    </Tooltip>
  );
};
