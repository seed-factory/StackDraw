import React from 'react';
import {
  Box,
  Select,
  Text,
  Title,
  Paper,
  Table,
  Stack
} from '@mantine/core';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { HOTKEY_PROFILES, HotkeyProfile } from 'src/config/hotkeys';
import { useTranslation } from 'src/stores/localeStore';

export const HotkeySettings = () => {
  const hotkeyProfile = useUiStateStore((state) => state.hotkeyProfile);
  const setHotkeyProfile = useUiStateStore((state) => state.actions.setHotkeyProfile);
  const { t } = useTranslation();

  const currentMapping = HOTKEY_PROFILES[hotkeyProfile];

  const tools = [
    { name: t('settings.hotkeys.toolSelect'), key: currentMapping.select },
    { name: t('settings.hotkeys.toolPan'), key: currentMapping.pan },
    { name: t('settings.hotkeys.toolAddItem'), key: currentMapping.addItem },
    { name: t('settings.hotkeys.toolRectangle'), key: currentMapping.rectangle },
    { name: t('settings.hotkeys.toolConnector'), key: currentMapping.connector },
    { name: t('settings.hotkeys.toolText'), key: currentMapping.text }
  ];

  const profileOptions = [
    { value: 'qwerty', label: t('settings.hotkeys.profileQwerty') },
    { value: 'smnrct', label: t('settings.hotkeys.profileSmnrct') },
    { value: 'none', label: t('settings.hotkeys.profileNone') }
  ];

  return (
    <Box p="md">
      <Stack gap="md">
        <Title order={4}>{t('settings.hotkeys.title')}</Title>

        <Select
          label={t('settings.hotkeys.profile')}
          value={hotkeyProfile}
          onChange={(value) => setHotkeyProfile(value as HotkeyProfile)}
          data={profileOptions}
          comboboxProps={{ withinPortal: true }}
        />

        {hotkeyProfile !== 'none' && (
          <Paper withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('settings.hotkeys.tool')}</Table.Th>
                  <Table.Th>{t('settings.hotkeys.hotkey')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tools.map((tool) => (
                  <Table.Tr key={tool.name}>
                    <Table.Td>{tool.name}</Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="monospace">
                        {tool.key ? tool.key.toUpperCase() : '-'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        <Text size="xs" c="dimmed">
          {t('settings.hotkeys.note')}
        </Text>
      </Stack>
    </Box>
  );
};
