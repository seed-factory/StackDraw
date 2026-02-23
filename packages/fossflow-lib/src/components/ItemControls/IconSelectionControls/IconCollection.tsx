import React, { useState } from 'react';
import { Divider, Stack, Text, Button } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Icon as IconI } from 'src/types';
import { Section } from 'src/components/ItemControls/components/Section';
import { IconGrid } from './IconGrid';

interface Props {
  id?: string;
  icons: IconI[];
  onClick?: (icon: IconI) => void;
  onMouseDown?: (icon: IconI) => void;
  isExpanded: boolean;
}

export const IconCollection = ({
  id,
  icons,
  onClick,
  onMouseDown,
  isExpanded: _isExpanded
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(_isExpanded);

  return (
    <Section style={{ paddingTop: 0, paddingBottom: 0 }}>
      <Button
        variant="subtle"
        fullWidth
        onClick={() => {
          return setIsExpanded(!isExpanded);
        }}
        style={{ height: 'auto', padding: 'var(--mantine-spacing-sm)' }}
      >
        <Stack
          style={{ width: '100%' }}
          gap="md"
        >
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text
              size="sm"
              c="dimmed"
              style={{
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              {id}
            </Text>
            {isExpanded ? (
              <IconChevronUp size={20} color="var(--mantine-color-gray-6)" />
            ) : (
              <IconChevronDown size={20} color="var(--mantine-color-gray-6)" />
            )}
          </div>
        </Stack>
      </Button>
      <Divider />

      {isExpanded && (
        <IconGrid icons={icons} onMouseDown={onMouseDown} onClick={onClick} />
      )}
    </Section>
  );
};
