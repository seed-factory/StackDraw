import React from 'react';
import { ProjectionOrientationEnum } from 'src/types';
import {
  Box,
  TextInput,
  SegmentedControl,
  Slider,
  ActionIcon
} from '@mantine/core';
import { IconX, IconTextCaption } from '@tabler/icons-react';
import { useTextBox } from 'src/hooks/useTextBox';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { getIsoProjectionCss } from 'src/utils';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/stores/localeStore';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';

interface Props {
  id: string;
}

export const TextBoxControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const textBox = useTextBox(id);
  const { updateTextBox, deleteTextBox } = useScene();

  // If textBox doesn't exist, return null
  if (!textBox) {
    return null;
  }

  return (
    <ControlsContainer>
      <Box style={{ position: 'relative', paddingTop: 24 }}>
        {/* Close button */}
        <ActionIcon
          aria-label={t('common.close')}
          onClick={() => {
            return uiStateActions.setItemControls(null);
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2
          }}
          size="sm"
          variant="subtle"
        >
          <IconX size={18} />
        </ActionIcon>
        <Section title={t('textBoxControls.enterText')}>
          <TextInput
            value={textBox.content}
            onChange={(e) => {
              updateTextBox(textBox.id, { content: e.target.value as string });
            }}
          />
        </Section>
        <Section title={t('textBoxControls.textSize')}>
          <Slider
            marks={[
              { value: 0.3 },
              { value: 0.5 },
              { value: 0.7 },
              { value: 0.9 }
            ]}
            step={0.3}
            min={0.3}
            max={0.9}
            value={textBox.fontSize}
            onChange={(newSize) => {
              updateTextBox(textBox.id, { fontSize: newSize as number });
            }}
          />
        </Section>
        <Section title={t('textBoxControls.alignment')}>
          <SegmentedControl
            value={textBox.orientation}
            onChange={(orientation) => {
              if (textBox.orientation === orientation || orientation === null)
                return;

              updateTextBox(textBox.id, { orientation: orientation as typeof ProjectionOrientationEnum.X | typeof ProjectionOrientationEnum.Y });
            }}
            data={[
              {
                value: ProjectionOrientationEnum.X,
                label: (
                  <IconTextCaption
                    size={20}
                    style={{ transform: getIsoProjectionCss() }}
                  />
                )
              },
              {
                value: ProjectionOrientationEnum.Y,
                label: (
                  <IconTextCaption
                    size={20}
                    style={{
                      transform: `scale(-1, 1) ${getIsoProjectionCss()} scale(-1, 1)`
                    }}
                  />
                )
              }
            ]}
          />
        </Section>
        <Section>
          <Box>
            <DeleteButton
              onClick={() => {
                uiStateActions.setItemControls(null);
                deleteTextBox(textBox.id);
              }}
            />
          </Box>
        </Section>
      </Box>
    </ControlsContainer>
  );
};
