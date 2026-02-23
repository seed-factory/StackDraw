import React, { useState } from 'react';
import { ColorPicker as MantineColorPicker, Popover, ColorSwatch } from '@mantine/core';

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: Props) => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <ColorSwatch
          color={value || '#000000'}
          onClick={() => setOpened((o) => !o)}
          style={{ cursor: 'pointer' }}
          size={28}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <MantineColorPicker
          format="hex"
          value={value || '#000000'}
          onChange={(color) => {
            onChange(color);
          }}
          swatches={[
            '#25262b', '#868e96', '#fa5252', '#e64980', '#be4bdb',
            '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886',
            '#40c057', '#82c91e', '#fab005', '#fd7e14'
          ]}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
