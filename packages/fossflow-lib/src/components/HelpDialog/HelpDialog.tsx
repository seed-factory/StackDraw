import React from 'react';
import {
  Modal,
  Title,
  Text,
  Table,
  Paper,
  Box,
  Divider,
  Button,
  Group,
  Code,
  Alert
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { DialogTypeEnum } from 'src/types/ui';
import { useTranslation } from 'src/stores/localeStore';

interface ShortcutItem {
  action: string;
  shortcut: string;
  description: string;
}

export const HelpDialog = () => {
  const { t } = useTranslation('helpDialog');

  const dialog = useUiStateStore((state) => {
    return state.dialog;
  });
  const setDialog = useUiStateStore((state) => {
    return state.actions.setDialog;
  });

  const isOpen = dialog === DialogTypeEnum.HELP;

  const handleClose = () => {
    setDialog(null);
  };

  const keyboardShortcuts = [
    {
      action: t('undoAction'),
      shortcut: 'Ctrl+Z',
      description: t('undoDescription')
    },
    {
      action: t('redoAction'),
      shortcut: 'Ctrl+Y',
      description: t('redoDescription')
    },
    {
      action: t('redoAltAction'),
      shortcut: 'Ctrl+Shift+Z',
      description: t('redoAltDescription')
    },
    {
      action: t('helpAction'),
      shortcut: 'F1',
      description: t('helpDescription')
    },
    {
      action: t('zoomInAction'),
      shortcut: t('zoomInShortcut'),
      description: t('zoomInDescription')
    },
    {
      action: t('zoomOutAction'),
      shortcut: t('zoomOutShortcut'),
      description: t('zoomOutDescription')
    },
    {
      action: t('panCanvasAction'),
      shortcut: t('panCanvasShortcut'),
      description: t('panCanvasDescription')
    },
    {
      action: t('contextMenuAction'),
      shortcut: t('contextMenuShortcut'),
      description: t('contextMenuDescription')
    }
  ];

  const mouseInteractions = [
    {
      action: t('selectToolAction'),
      shortcut: t('selectToolShortcut'),
      description: t('selectToolDescription')
    },
    {
      action: t('panToolAction'),
      shortcut: t('panToolShortcut'),
      description: t('panToolDescription')
    },
    {
      action: t('addItemAction'),
      shortcut: t('addItemShortcut'),
      description: t('addItemDescription')
    },
    {
      action: t('drawRectangleAction'),
      shortcut: t('drawRectangleShortcut'),
      description: t('drawRectangleDescription')
    },
    {
      action: t('createConnectorAction'),
      shortcut: t('createConnectorShortcut'),
      description: t('createConnectorDescription')
    },
    {
      action: t('addTextAction'),
      shortcut: t('addTextShortcut'),
      description: t('addTextDescription')
    }
  ];

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      size="lg"
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Title order={4}>{t('title')}</Title>
        </Group>
      }
    >
      <Box mb="lg">
        <Title order={5} mb="sm">{t('keyboardShortcuts')}</Title>
        <Paper withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ fontWeight: 'bold' }}>{t('action')}</Table.Th>
                <Table.Th style={{ fontWeight: 'bold' }}>{t('shortcut')}</Table.Th>
                <Table.Th style={{ fontWeight: 'bold' }}>{t('description')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {keyboardShortcuts.map((shortcut, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{shortcut.action}</Table.Td>
                  <Table.Td>
                    <Code>{shortcut.shortcut}</Code>
                  </Table.Td>
                  <Table.Td>{shortcut.description}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Box>

      <Divider my="lg" />

      <Box>
        <Title order={5} mb="sm">{t('mouseInteractions')}</Title>
        <Paper withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ fontWeight: 'bold' }}>{t('action')}</Table.Th>
                <Table.Th style={{ fontWeight: 'bold' }}>{t('method')}</Table.Th>
                <Table.Th style={{ fontWeight: 'bold' }}>{t('description')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mouseInteractions.map((interaction, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{interaction.action}</Table.Td>
                  <Table.Td>
                    <Code>{interaction.shortcut}</Code>
                  </Table.Td>
                  <Table.Td>{interaction.description}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Box>

      <Alert color="blue" mt="lg">
        <Text size="sm">
          <strong>{t('note')}</strong> {t('noteContent')}
        </Text>
      </Alert>

      <Group justify="flex-end" mt="lg">
        <Button onClick={handleClose}>
          {t('close')}
        </Button>
      </Group>
    </Modal>
  );
};
