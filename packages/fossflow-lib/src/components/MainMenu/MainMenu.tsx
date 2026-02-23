import React, { useState, useCallback, useMemo } from 'react';
import { Menu, Text, Divider, Paper } from '@mantine/core';
import { shallow } from 'zustand/shallow';
import {
  IconMenu2,
  IconBrandGithub,
  IconCode,
  IconPhoto,
  IconFolderOpen,
  IconTrash,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconSettings
} from '@tabler/icons-react';
import { UiElement } from 'src/components/UiElement/UiElement';
import { IconButton } from 'src/components/IconButton/IconButton';
import { useUiStateStore } from 'src/stores/uiStateStore';
import {
  exportAsJSON,
  exportAsCompactJSON,
  transformFromCompactFormat
} from 'src/utils/exportOptions';
import { modelFromModelStore } from 'src/utils';
import { useInitialDataManager } from 'src/hooks/useInitialDataManager';
import { useModelStore } from 'src/stores/modelStore';
import { useHistory } from 'src/hooks/useHistory';
import { DialogTypeEnum } from 'src/types/ui';
import { MenuItem } from './MenuItem';
import { useTranslation } from 'src/stores/localeStore';

export const MainMenu = () => {
  const [opened, setOpened] = useState(false);
  const model = useModelStore((state) => {
    return modelFromModelStore(state);
  });

  // Combine UI state selectors into one with shallow comparison
  const { isMainMenuOpen, mainMenuOptions, uiStateActions } = useUiStateStore(
    (state) => ({
      isMainMenuOpen: state.isMainMenuOpen,
      mainMenuOptions: state.mainMenuOptions,
      uiStateActions: state.actions
    }),
    shallow
  );
  const initialDataManager = useInitialDataManager();
  const { undo, redo, clearHistory } = useHistory();

  const { t } = useTranslation('mainMenu');

  const onToggleMenu = useCallback(() => {
    setOpened((prev) => !prev);
    uiStateActions.setIsMainMenuOpen(!isMainMenuOpen);
  }, [uiStateActions, isMainMenuOpen]);

  const handleClose = useCallback(() => {
    setOpened(false);
    uiStateActions.setIsMainMenuOpen(false);
  }, [uiStateActions]);

  const gotoUrl = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const { load } = initialDataManager;

  const onOpenModel = useCallback(async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (!file) {
        throw new Error('No file selected');
      }

      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        const rawData = JSON.parse(e.target?.result as string);
        let modelData = rawData;

        // Check format and transform if needed
        if (rawData._?.f === 'compact') {
          modelData = transformFromCompactFormat(rawData);
        }

        load(modelData);
        clearHistory(); // Clear history when loading new model
      };
      fileReader.readAsText(file);

      uiStateActions.resetUiState();
    };

    await fileInput.click();
    handleClose();
  }, [uiStateActions, load, clearHistory, handleClose]);

  const onExportAsJSON = useCallback(async () => {
    exportAsJSON(model);
    handleClose();
  }, [model, handleClose]);

  const onExportAsCompactJSON = useCallback(async () => {
    exportAsCompactJSON(model);
    handleClose();
  }, [model, handleClose]);

  const onExportAsImage = useCallback(() => {
    handleClose();
    uiStateActions.setDialog(DialogTypeEnum.EXPORT_IMAGE);
  }, [uiStateActions, handleClose]);

  const { clear } = initialDataManager;

  const onClearCanvas = useCallback(() => {
    clear();
    clearHistory(); // Clear history when clearing canvas
    handleClose();
  }, [handleClose, clear, clearHistory]);

  const handleUndo = useCallback(() => {
    undo();
    handleClose();
  }, [undo, handleClose]);

  const handleRedo = useCallback(() => {
    redo();
    handleClose();
  }, [redo, handleClose]);

  const onOpenSettings = useCallback(() => {
    handleClose();
    uiStateActions.setDialog(DialogTypeEnum.SETTINGS);
  }, [uiStateActions, handleClose]);




  const sectionVisibility = useMemo(() => {
    return {
      actions: Boolean(
        mainMenuOptions.find((opt) => {
          return opt.includes('ACTION') || opt.includes('EXPORT');
        })
      ),
      links: Boolean(
        mainMenuOptions.find((opt) => {
          return opt.includes('LINK');
        })
      ),
      version: Boolean(mainMenuOptions.includes('VERSION'))
    };
  }, [mainMenuOptions]);

  if (mainMenuOptions.length === 0) {
    return null;
  }

  return (
    <UiElement>
      <Menu
        opened={opened}
        onChange={setOpened}
        onClose={handleClose}
        position="bottom-start"
        offset={8}
        shadow="md"
        width={250}
      >
        <Menu.Target>
          <div>
            <IconButton
              Icon={<IconMenu2 size={20} />}
              name="Main menu"
              onClick={onToggleMenu}
              isActive={isMainMenuOpen}
            />
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Paper p={0}>
            {/* Undo/Redo Section */}
            <MenuItem
              onClick={handleUndo}
              Icon={<IconArrowBackUp size={18} style={{ opacity: 0.5 }} />}
            >
              {t('undo')}
            </MenuItem>

            <MenuItem
              onClick={handleRedo}
              Icon={<IconArrowForwardUp size={18} style={{ opacity: 0.5 }} />}
            >
              {t('redo')}
            </MenuItem>


            {sectionVisibility.actions && <Divider my="xs" />}

            {/* File Actions */}
            {mainMenuOptions.includes('ACTION.OPEN') && (
              <MenuItem onClick={onOpenModel} Icon={<IconFolderOpen size={18} />}>
                {t('open')}
              </MenuItem>
            )}

            {mainMenuOptions.includes('EXPORT.JSON') && (
              <MenuItem onClick={onExportAsJSON} Icon={<IconCode size={18} />}>
                {t('exportJson')}
              </MenuItem>
            )}

            {mainMenuOptions.includes('EXPORT.JSON') && (
              <MenuItem onClick={onExportAsCompactJSON} Icon={<IconCode size={18} />}>
                {t('exportCompactJson')}
              </MenuItem>
            )}

            {mainMenuOptions.includes('EXPORT.PNG') && (
              <MenuItem onClick={onExportAsImage} Icon={<IconPhoto size={18} />}>
                {t('exportImage')}
              </MenuItem>
            )}

            {mainMenuOptions.includes('ACTION.CLEAR_CANVAS') && (
              <MenuItem onClick={onClearCanvas} Icon={<IconTrash size={18} />}>
                {t('clearCanvas')}
              </MenuItem>
            )}

            <Divider my="xs" />

            <MenuItem onClick={onOpenSettings} Icon={<IconSettings size={18} />}>
              {t('settings')}
            </MenuItem>

            {sectionVisibility.links && (
              <>
                <Divider my="xs" />

                {mainMenuOptions.includes('LINK.GITHUB') && (
                  <MenuItem
                    onClick={() => {
                      return gotoUrl(`${REPOSITORY_URL}`);
                    }}
                    Icon={<IconBrandGithub size={18} />}
                  >
                    {t('gitHub')}
                  </MenuItem>
                )}
              </>
            )}

            {sectionVisibility.version && (
              <>
                <Divider my="xs" />

                {mainMenuOptions.includes('VERSION') && (
                  <MenuItem>
                    <Text size="sm" c="dimmed">
                      StackDraw v{PACKAGE_VERSION}
                    </Text>
                  </MenuItem>
                )}
              </>
            )}
          </Paper>
        </Menu.Dropdown>
      </Menu>
    </UiElement>
  );
};
