import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box } from '@mantine/core';
import { shallow } from 'zustand/shallow';
import { EditorModeEnum, DialogTypeEnum } from 'src/types';
import { UiElement } from 'components/UiElement/UiElement';
import { SceneLayer } from 'src/components/SceneLayer/SceneLayer';
import { DragAndDrop } from 'src/components/DragAndDrop/DragAndDrop';
import { ItemControlsManager } from 'src/components/ItemControls/ItemControlsManager';
import { ToolMenu } from 'src/components/ToolMenu/ToolMenu';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { MainMenu } from 'src/components/MainMenu/MainMenu';
import { ZoomControls } from 'src/components/ZoomControls/ZoomControls';
import { AnimationsPanel } from 'src/components/AnimationsPanel/AnimationsPanel';
import { LayersPanel } from 'src/components/LayersPanel/LayersPanel';
import { DebugUtils } from 'src/components/DebugUtils/DebugUtils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { ContextMenuManager } from 'src/components/ContextMenu/ContextMenuManager';
import { ExportImageDialog } from '../ExportImageDialog/ExportImageDialog';
import { HelpDialog } from '../HelpDialog/HelpDialog';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { ConnectorHintTooltip } from '../ConnectorHintTooltip/ConnectorHintTooltip';
import { ConnectorEmptySpaceTooltip } from '../ConnectorEmptySpaceTooltip/ConnectorEmptySpaceTooltip';
import { ConnectorRerouteTooltip } from '../ConnectorRerouteTooltip/ConnectorRerouteTooltip';
import { ImportHintTooltip } from '../ImportHintTooltip/ImportHintTooltip';
import { LassoHintTooltip } from '../LassoHintTooltip/LassoHintTooltip';
import { getTilePosition } from 'src/utils';
import { useCustomTheme } from 'src/hooks/useCustomTheme';

const ToolsEnum = {
  MAIN_MENU: 'MAIN_MENU',
  ZOOM_CONTROLS: 'ZOOM_CONTROLS',
  TOOL_MENU: 'TOOL_MENU',
  ITEM_CONTROLS: 'ITEM_CONTROLS'
} as const;

interface EditorModeMapping {
  [k: string]: (keyof typeof ToolsEnum)[];
}

const EDITOR_MODE_MAPPING: EditorModeMapping = {
  [EditorModeEnum.EDITABLE]: [
    'ITEM_CONTROLS',
    'ZOOM_CONTROLS',
    'TOOL_MENU',
    'MAIN_MENU'
  ],
  [EditorModeEnum.EXPLORABLE_READONLY]: ['ZOOM_CONTROLS'],
  [EditorModeEnum.NON_INTERACTIVE]: []
};

const getEditorModeMapping = (editorMode: keyof typeof EditorModeEnum) => {
  const availableUiFeatures = EDITOR_MODE_MAPPING[editorMode];

  return availableUiFeatures;
};

export const UiOverlay = () => {
  const theme = useCustomTheme();
  const contextMenuAnchorRef = useRef<HTMLDivElement>(null);
  const toolMenuRef = useRef<HTMLDivElement>(null);
  const { appPadding } = theme.customVars;
  const spacing = 8; // Base spacing unit

  // Combine all UI state selectors into one to minimize re-renders
  const {
    uiStateActions,
    enableDebugTools,
    mode,
    mouse,
    dialog,
    itemControls,
    editorMode,
    rendererEl,
    iconPackManager,
    contextMenu,
    viewMode,
    animationsPanel,
    layersPanel
  } = useUiStateStore(
    (state) => ({
      uiStateActions: state.actions,
      enableDebugTools: state.enableDebugTools,
      mode: state.mode,
      mouse: state.mouse,
      dialog: state.dialog,
      itemControls: state.itemControls,
      editorMode: state.editorMode,
      rendererEl: state.rendererEl,
      iconPackManager: state.iconPackManager,
      contextMenu: state.contextMenu,
      viewMode: state.viewMode,
      animationsPanel: state.animationsPanel,
      layersPanel: state.layersPanel
    }),
    shallow
  );

  // Listen for external dialog open events
  useEffect(() => {
    const handleOpenSettings = () => {
      uiStateActions.setDialog(DialogTypeEnum.SETTINGS);
    };

    const handleOpenExportImage = () => {
      uiStateActions.setDialog(DialogTypeEnum.EXPORT_IMAGE);
    };

    window.addEventListener('stackdraw:openSettings', handleOpenSettings);
    window.addEventListener('stackdraw:openExportImage', handleOpenExportImage);
    return () => {
      window.removeEventListener('stackdraw:openSettings', handleOpenSettings);
      window.removeEventListener('stackdraw:openExportImage', handleOpenExportImage);
    };
  }, [uiStateActions]);

  const availableTools = useMemo(() => {
    return getEditorModeMapping(editorMode);
  }, [editorMode]);

  const { size: rendererSize } = useResizeObserver(rendererEl);

  return (
    <>
      <Box
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          top: 0,
          left: 0
        }}
      >
        {availableTools.includes('ITEM_CONTROLS') && itemControls && !layersPanel && (
          <UiElement
            style={{
              position: 'absolute',
              width: '360px',
              overflowY: 'scroll',
              scrollbarWidth: 'none',
              left: appPadding.x,
              top: appPadding.y * 2 + spacing * 2,
              maxHeight: rendererSize.height - appPadding.y * 6
            }}
          >
            <ItemControlsManager />
          </UiElement>
        )}

        {availableTools.includes('TOOL_MENU') && (
          <Box
            ref={toolMenuRef}
            style={{
              position: 'absolute',
              transform: 'translateX(-100%)',
              left: rendererSize.width - appPadding.x,
              top: appPadding.y
            }}
          >
            <ToolMenu />
          </Box>
        )}

        {availableTools.includes('ZOOM_CONTROLS') && (
          <>
            {animationsPanel && (
              <Box
                style={{
                  position: 'absolute',
                  transform: 'translateY(-100%)',
                  top: rendererSize.height - appPadding.y * 2 - spacing,
                  left: appPadding.x
                }}
              >
                <AnimationsPanel />
              </Box>
            )}
            {layersPanel && (
              <Box
                style={{
                  position: 'absolute',
                  transform: 'translateY(-100%)',
                  top: rendererSize.height - appPadding.y * 2 - spacing,
                  left: appPadding.x
                }}
              >
                <LayersPanel />
              </Box>
            )}
            <Box
              style={{
                position: 'absolute',
                transformOrigin: 'bottom left',
                top: rendererSize.height - appPadding.y * 2,
                left: appPadding.x
              }}
            >
              <ZoomControls />
            </Box>
          </>
        )}

        {availableTools.includes('MAIN_MENU') && (
          <Box
            style={{
              position: 'absolute',
              top: appPadding.y,
              left: appPadding.x
            }}
          >
            <MainMenu />
          </Box>
        )}

        {enableDebugTools && (
          <UiElement
            style={{
              position: 'absolute',
              width: 350,
              transform: 'translateY(-100%)',
              maxWidth: `calc(${rendererSize.width} - ${appPadding.x * 2}px)`,
              left: appPadding.x,
              top: rendererSize.height - appPadding.y * 2 - spacing
            }}
          >
            <DebugUtils />
          </UiElement>
        )}
      </Box>

      {mode.type === 'PLACE_ICON' && mode.id && (
        <SceneLayer disableAnimation>
          <DragAndDrop iconId={mode.id} tile={mouse.position.tile} />
        </SceneLayer>
      )}

      {dialog === DialogTypeEnum.EXPORT_IMAGE && (
        <ExportImageDialog
          onClose={() => {
            return uiStateActions.setDialog(null);
          }}
        />
      )}

      {dialog === DialogTypeEnum.HELP && <HelpDialog />}

      {dialog === DialogTypeEnum.SETTINGS && <SettingsDialog iconPackManager={iconPackManager || undefined} />}

      {/* Show hint tooltips only in editable mode */}
      {editorMode === EditorModeEnum.EDITABLE && <ConnectorHintTooltip toolMenuRef={toolMenuRef} />}
      {editorMode === EditorModeEnum.EDITABLE && <ConnectorEmptySpaceTooltip />}
      {editorMode === EditorModeEnum.EDITABLE && <ConnectorRerouteTooltip />}
      {editorMode === EditorModeEnum.EDITABLE && <ImportHintTooltip />}
      {editorMode === EditorModeEnum.EDITABLE && <LassoHintTooltip toolMenuRef={toolMenuRef} />}

      <SceneLayer>
        {contextMenu && (
          <Box
            ref={contextMenuAnchorRef}
            style={{
              position: 'absolute',
              left: getTilePosition({ tile: contextMenu.tile, viewMode }).x,
              top: getTilePosition({ tile: contextMenu.tile, viewMode }).y
            }}
          />
        )}
      </SceneLayer>

      {/* ContextMenuManager must be outside SceneLayer because position:fixed inside a transformed parent doesn't work correctly */}
      <ContextMenuManager anchorEl={contextMenu && contextMenu.type === "EMPTY" ? contextMenuAnchorRef.current : null} />
    </>
  );
};
