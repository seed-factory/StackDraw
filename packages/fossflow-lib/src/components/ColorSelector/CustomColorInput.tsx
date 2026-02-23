import React, { useState, useEffect } from 'react';
import { Group, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { IconColorPicker } from '@tabler/icons-react';
import { ColorPicker } from './ColorPicker';

interface EyeDropper {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
}

declare global {
  interface Window {
    EyeDropper?: {
      new (): EyeDropper;
    };
  }
}

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export const CustomColorInput = ({ value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) return;
    const eyeDropper = new window.EyeDropper();
    try {
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
    } catch (e) {
      // User canceled or failed
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // If it's a valid hex, update immediately
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // On blur, if invalid, revert to prop value
    if (!/^#[0-9A-F]{6}$/i.test(localValue)) {
      setLocalValue(value);
    }
  };

  const hasEyeDropper = typeof window !== 'undefined' && !!window.EyeDropper;

  return (
    <Group gap="xs" align="center">
      <ColorPicker value={value} onChange={onChange} />
      <TextInput
        value={localValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        variant="unstyled"
        size="sm"
        styles={{
          input: {
            fontSize: '0.875rem',
            width: '80px',
            color: 'var(--mantine-color-dimmed)'
          }
        }}
      />
      {hasEyeDropper && (
        <Tooltip label="Pick color from screen">
          <ActionIcon onClick={handleEyeDropper} size="sm" variant="subtle" aria-label="Pick color">
            <IconColorPicker size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
};
