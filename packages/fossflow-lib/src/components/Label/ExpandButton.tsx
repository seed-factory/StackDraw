import React, { CSSProperties } from 'react';
import { Button } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface Props {
  isExpanded: boolean;
  onClick: () => void;
  style?: CSSProperties;
}

export const ExpandButton = ({ isExpanded, onClick, style }: Props) => {
  return (
    <Button
      variant="subtle"
      size="compact-xs"
      style={{
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 0,
        paddingBottom: 0,
        height: 'auto',
        minWidth: 0,
        fontSize: '0.7em',
        bottom: 5,
        right: 5,
        color: 'white',
        ...style
      }}
      onClick={onClick}
    >
      {isExpanded ? (
        <IconChevronUp size={16} style={{ color: 'white' }} />
      ) : (
        <IconChevronDown size={16} style={{ color: 'white' }} />
      )}
    </Button>
  );
};
