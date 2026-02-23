import React, { useState } from 'react';
import { Box, ActionIcon, Switch } from '@mantine/core';
import { useRectangle } from 'src/hooks/useRectangle';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { ColorPicker } from 'src/components/ColorSelector/ColorPicker';
import { CustomColorInput } from 'src/components/ColorSelector/CustomColorInput';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/stores/localeStore';
import { IconX } from '@tabler/icons-react';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';

interface Props {
  id: string;
}

export const RectangleControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const rectangle = useRectangle(id);
  const { updateRectangle, deleteRectangle } = useScene();
  const [useCustomColor, setUseCustomColor] = useState(!!rectangle?.customColor);

  // If rectangle doesn't exist, return null
  if (!rectangle) {
    return null;
  }

  return (
    <ControlsContainer>
      <Box style={{ position: 'relative' }}>
        {/* Close button */}
        <ActionIcon
          aria-label={t('common.close')}
          onClick={() => {
            return uiStateActions.setItemControls(null);
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2
          }}
          size="sm"
          variant="subtle"
        >
          <IconX size={18} />
        </ActionIcon>
        <Section title={t('rectangleControls.color')}>
          <Switch
            checked={useCustomColor}
            onChange={(e) => {
              setUseCustomColor(e.currentTarget.checked);
              if (!e.currentTarget.checked) {
                updateRectangle(rectangle.id, { customColor: '' });
              }
            }}
            label={t('rectangleControls.useCustomColor')}
            style={{ marginBottom: 'var(--mantine-spacing-md)' }}
          />
          {useCustomColor ? (
            <CustomColorInput
              value={rectangle.customColor || '#000000'}
              onChange={(color) => {
                updateRectangle(rectangle.id, { customColor: color });
              }}
            />
          ) : (
            <ColorSelector
              onChange={(color) => {
                updateRectangle(rectangle.id, { color, customColor: '' });
              }}
              activeColor={rectangle.color}
            />
          )}
        </Section>
        <Section>
          <Box>
            <DeleteButton
              onClick={() => {
                uiStateActions.setItemControls(null);
                deleteRectangle(rectangle.id);
              }}
            />
          </Box>
        </Section>
      </Box>
    </ControlsContainer>
  );
};
