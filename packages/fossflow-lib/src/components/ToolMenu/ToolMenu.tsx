import React, { useCallback } from 'react';
import { Stack, Divider } from '@mantine/core';
import {
  IconHandStop,
  IconPointer,
  IconPlus,
  IconArrowRight,
  IconSquare,
  IconTypography,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconHelp,
  IconMarquee,
  IconScribble,
  IconTrash
} from '@tabler/icons-react';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { IconButton } from 'src/components/IconButton/IconButton';
import { UiElement } from 'src/components/UiElement/UiElement';
import { useScene } from 'src/hooks/useScene';
import { useHistory } from 'src/hooks/useHistory';
import { TEXTBOX_DEFAULTS } from 'src/config';
import { generateId } from 'src/utils';
import { HOTKEY_PROFILES } from 'src/config/hotkeys';
import { useTranslation } from 'src/stores/localeStore';

export const ToolMenu = () => {
  const { t } = useTranslation();
  const { createTextBox } = useScene();
  const { undo, redo, canUndo, canRedo } = useHistory();
  const mode = useUiStateStore((state) => {
    return state.mode;
  });
  const uiStateStoreActions = useUiStateStore((state) => {
    return state.actions;
  });
  const mousePosition = useUiStateStore((state) => {
    return state.mouse.position.tile;
  });
  const hotkeyProfile = useUiStateStore((state) => {
    return state.hotkeyProfile;
  });

  const hotkeys = HOTKEY_PROFILES[hotkeyProfile];

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const createTextBoxProxy = useCallback(() => {
    const textBoxId = generateId();

    createTextBox({
      ...TEXTBOX_DEFAULTS,
      id: textBoxId,
      tile: mousePosition
    });

    uiStateStoreActions.setMode({
      type: 'TEXTBOX',
      showCursor: false,
      id: textBoxId
    });
  }, [uiStateStoreActions, createTextBox, mousePosition]);

  return (
    <UiElement>
      <Stack gap={2} align="center" style={{ flexDirection: 'row' }}>
        {/* Undo/Redo Section */}
        <IconButton
          name={`${t('toolMenu.undo')} (Ctrl+Z)`}
          Icon={<IconArrowBackUp size={20} />}
          onClick={handleUndo}
          disabled={!canUndo}
        />
        <IconButton
          name={`${t('toolMenu.redo')} (Ctrl+Y)`}
          Icon={<IconArrowForwardUp size={20} />}
          onClick={handleRedo}
          disabled={!canRedo}
        />

        {/* Main Tools */}
        <IconButton
          name={`${t('toolMenu.select')}${hotkeys.select ? ` (${hotkeys.select.toUpperCase()})` : ''}`}
          Icon={<IconPointer size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'CURSOR',
              showCursor: true,
              mousedownItem: null
            });
          }}
          isActive={mode.type === 'CURSOR' || mode.type === 'DRAG_ITEMS'}
          hotkeyLabel={hotkeys.select}
        />
        <IconButton
          name={`${t('toolMenu.lassoSelect')}${hotkeys.lasso ? ` (${hotkeys.lasso.toUpperCase()})` : ''}`}
          Icon={<IconMarquee size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'LASSO',
              showCursor: true,
              selection: null,
              isDragging: false
            });
          }}
          isActive={mode.type === 'LASSO'}
          hotkeyLabel={hotkeys.lasso}
        />
        <IconButton
          name={`${t('toolMenu.freehandLasso')}${hotkeys.freehandLasso ? ` (${hotkeys.freehandLasso.toUpperCase()})` : ''}`}
          Icon={<IconScribble size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'FREEHAND_LASSO',
              showCursor: true,
              path: [],
              selection: null,
              isDragging: false
            });
          }}
          isActive={mode.type === 'FREEHAND_LASSO'}
          hotkeyLabel={hotkeys.freehandLasso}
        />
        <IconButton
          name={`${t('toolMenu.pan')}${hotkeys.pan ? ` (${hotkeys.pan.toUpperCase()})` : ''}`}
          Icon={<IconHandStop size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'PAN',
              showCursor: false
            });

            uiStateStoreActions.setItemControls(null);
          }}
          isActive={mode.type === 'PAN'}
          hotkeyLabel={hotkeys.pan}
        />
        <IconButton
          name={`${t('toolMenu.addItem')}${hotkeys.addItem ? ` (${hotkeys.addItem.toUpperCase()})` : ''}`}
          Icon={<IconPlus size={20} />}
          onClick={() => {
            uiStateStoreActions.setItemControls({
              type: 'ADD_ITEM'
            });
            uiStateStoreActions.setMode({
              type: 'PLACE_ICON',
              showCursor: true,
              id: null
            });
          }}
          isActive={mode.type === 'PLACE_ICON'}
          hotkeyLabel={hotkeys.addItem}
        />
        <IconButton
          name={`${t('toolMenu.rectangle')}${hotkeys.rectangle ? ` (${hotkeys.rectangle.toUpperCase()})` : ''}`}
          Icon={<IconSquare size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'RECTANGLE.DRAW',
              showCursor: true,
              id: null
            });
          }}
          isActive={mode.type === 'RECTANGLE.DRAW'}
          hotkeyLabel={hotkeys.rectangle}
        />
        <IconButton
          name={`${t('toolMenu.connector')}${hotkeys.connector ? ` (${hotkeys.connector.toUpperCase()})` : ''}`}
          Icon={<IconArrowRight size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'CONNECTOR',
              id: null,
              showCursor: true
            });
          }}
          isActive={mode.type === 'CONNECTOR'}
          hotkeyLabel={hotkeys.connector}
        />
        <IconButton
          name={`${t('toolMenu.text')}${hotkeys.text ? ` (${hotkeys.text.toUpperCase()})` : ''}`}
          Icon={<IconTypography size={20} />}
          onClick={createTextBoxProxy}
          isActive={mode.type === 'TEXTBOX'}
          hotkeyLabel={hotkeys.text}
        />
        <IconButton
          name={`${t('toolMenu.delete')}${hotkeys.delete ? ` (${hotkeys.delete.toUpperCase()})` : ''}`}
          Icon={<IconTrash size={20} />}
          onClick={() => {
            uiStateStoreActions.setMode({
              type: 'DELETE',
              showCursor: true
            });
            uiStateStoreActions.setItemControls(null);
          }}
          isActive={mode.type === 'DELETE'}
          hotkeyLabel={hotkeys.delete}
        />
      </Stack>
    </UiElement>
  );
};
