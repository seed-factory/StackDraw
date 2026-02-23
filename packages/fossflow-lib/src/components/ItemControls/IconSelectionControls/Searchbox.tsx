import React from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const Searchbox = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <TextInput
      placeholder={t('searchbox.placeholder')}
      value={value}
      onChange={(e) => {
        return onChange(e.target.value as string);
      }}
      leftSection={<IconSearch size={16} />}
    />
  );
};
