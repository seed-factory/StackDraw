import React from 'react';
import { IconTrash } from '@tabler/icons-react';
import { Button } from '@mantine/core';

interface Props {
  onClick: () => void;
}

export const DeleteButton = ({ onClick }: Props) => {
  return (
    <Button
      color="red"
      size="xs"
      variant="outline"
      leftSection={<IconTrash size={16} color="var(--mantine-color-red-6)" />}
      onClick={onClick}
    >
      Delete
    </Button>
  );
};
