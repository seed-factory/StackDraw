import React from 'react';
import { Box, Radio, Text } from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useTranslation } from 'src/stores/localeStore';

const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'en-US' },
  { label: '中文', value: 'zh-CN' },
  { label: 'Español', value: 'es-ES' },
  { label: 'Português', value: 'pt-BR' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'हिन्दी', value: 'hi-IN' },
  { label: 'বাংলা', value: 'bn-BD' },
  { label: 'Русский', value: 'ru-RU' },
  { label: 'Polski', value: 'pl-PL' },
  { label: 'Italiano', value: 'it-IT' },
  { label: 'Bahasa Indonesia', value: 'id-ID' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Türkçe', value: 'tr-TR' }
];

export const LanguageSettings = () => {
  const { t } = useTranslation();
  const currentLanguage = useUiStateStore((state) => state.language) || 'en-US';
  const setLanguage = useUiStateStore((state) => state.actions.setLanguage);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    // Dispatch event for the parent app to handle i18n change
    window.dispatchEvent(new CustomEvent('stackdraw:languageChange', {
      detail: { language: newLanguage }
    }));

    // Also save to localStorage for persistence
    localStorage.setItem('i18nextLng', newLanguage);
  };

  return (
    <Box>
      <Text size="sm" c="dimmed" mb="md">
        {t('languageSettings.description')}
      </Text>

      <Radio.Group
        value={currentLanguage}
        onChange={handleLanguageChange}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Radio
            key={lang.value}
            value={lang.value}
            label={lang.label}
            size="sm"
            mb="xs"
          />
        ))}
      </Radio.Group>
    </Box>
  );
};
