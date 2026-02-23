import React from 'react';
import {
  IconPlus,
  IconMinus,
  IconMaximize,
  IconHelp,
  Icon3dCubeSphere,
  IconGrid4x4,
  IconMovie,
  IconStack2
} from '@tabler/icons-react';
import { Stack, Box, Text, Divider } from '@mantine/core';
import { toPx } from 'src/utils';
import { UiElement } from 'src/components/UiElement/UiElement';
import { IconButton } from 'src/components/IconButton/IconButton';
import { MAX_ZOOM, MIN_ZOOM } from 'src/config';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useDiagramUtils } from 'src/hooks/useDiagramUtils';
import { DialogTypeEnum } from 'src/types/ui';

export const ZoomControls = () => {
  const uiStateStoreActions = useUiStateStore((state) => {
    return state.actions;
  });
  const zoom = useUiStateStore((state) => {
    return state.zoom;
  });
  const viewMode = useUiStateStore((state) => {
    return state.viewMode;
  });
  const animationsPanel = useUiStateStore((state) => {
    return state.animationsPanel;
  });
  const layersPanel = useUiStateStore((state) => {
    return state.layersPanel;
  });
  const { fitToView } = useDiagramUtils();

  const isTopDown = viewMode === 'TOP_DOWN';

  return (
    <Stack gap={8} align="center" style={{ flexDirection: 'row' }}>
      <UiElement>
        <Stack gap={0} align="center" style={{ flexDirection: 'row' }}>
          <IconButton
            name={isTopDown ? 'Switch to isometric view' : 'Switch to top-down view'}
            Icon={isTopDown ? <Icon3dCubeSphere size={20} /> : <IconGrid4x4 size={20} />}
            onClick={uiStateStoreActions.toggleViewMode}
          />
          <Divider orientation="vertical" />
          <IconButton
            name="Animations"
            Icon={<IconMovie size={20} />}
            onClick={uiStateStoreActions.toggleAnimationsPanel}
            isActive={animationsPanel}
          />
          <Divider orientation="vertical" />
          <IconButton
            name="Layers"
            Icon={<IconStack2 size={20} />}
            onClick={uiStateStoreActions.toggleLayersPanel}
            isActive={layersPanel}
          />
        </Stack>
      </UiElement>
      <UiElement>
        <Stack gap={0} align="center" style={{ flexDirection: 'row' }}>
          <IconButton
            name="Zoom out"
            Icon={<IconMinus size={20} />}
            onClick={uiStateStoreActions.decrementZoom}
            disabled={zoom >= MAX_ZOOM}
          />
          <Divider orientation="vertical" />
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: toPx(60)
            }}
          >
            <Text size="sm" c="dimmed">
              {Math.ceil(zoom * 100)}%
            </Text>
          </Box>
          <Divider orientation="vertical" />
          <IconButton
            name="Zoom in"
            Icon={<IconPlus size={20} />}
            onClick={uiStateStoreActions.incrementZoom}
            disabled={zoom <= MIN_ZOOM}
          />
        </Stack>
      </UiElement>
      <UiElement>
        <IconButton
          name="Fit to screen"
          Icon={<IconMaximize size={20} />}
          onClick={fitToView}
        />
      </UiElement>
      <UiElement>
        <IconButton
          name="Help (F1)"
          Icon={<IconHelp size={20} />}
          onClick={() => {
            return uiStateStoreActions.setDialog(DialogTypeEnum.HELP);
          }}
        />
      </UiElement>
    </Stack>
  );
};
