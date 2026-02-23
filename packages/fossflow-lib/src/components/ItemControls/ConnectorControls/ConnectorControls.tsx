import React, { useState, useMemo } from 'react';
import {
  Connector,
  ConnectorLabel,
  connectorStyleOptions,
  connectorLineTypeOptions,
  arrowDirectionOptions,
  ArrowDirection
} from 'src/types';
import {
  Box,
  Slider,
  Select,
  TextInput,
  ActionIcon,
  Switch,
  Text,
  Button,
  Paper
} from '@mantine/core';
import { useConnector } from 'src/hooks/useConnector';
import { ColorSelector } from 'src/components/ColorSelector/ColorSelector';
import { ColorPicker } from 'src/components/ColorSelector/ColorPicker';
import { CustomColorInput } from 'src/components/ColorSelector/CustomColorInput';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { useTranslation } from 'src/stores/localeStore';
import { IconX, IconPlus, IconTrash } from '@tabler/icons-react';
import { getConnectorLabels, generateId } from 'src/utils';
import { ControlsContainer } from '../components/ControlsContainer';
import { Section } from '../components/Section';
import { DeleteButton } from '../components/DeleteButton';

interface Props {
  id: string;
}

export const ConnectorControls = ({ id }: Props) => {
  const { t } = useTranslation();
  const uiStateActions = useUiStateStore((state) => {
    return state.actions;
  });
  const connector = useConnector(id);
  const { updateConnector, deleteConnector } = useScene();
  const [useCustomColor, setUseCustomColor] = useState(
    !!connector?.customColor
  );

  // Get all labels (including migrated legacy labels)
  const labels = useMemo(() => {
    if (!connector) return [];
    return getConnectorLabels(connector);
  }, [connector]);

  // If connector doesn't exist, return null
  if (!connector) {
    return null;
  }

  const isDoubleLineType =
    connector.lineType === 'DOUBLE' ||
    connector.lineType === 'DOUBLE_WITH_CIRCLE';

  const handleAddLabel = () => {
    if (labels.length >= 256) return;

    const newLabel: ConnectorLabel = {
      id: generateId(),
      text: '',
      position: 50,
      height: 0,
      line: '1'
    };

    // Migrate legacy labels if needed and add new label
    const updatedLabels = [...labels, newLabel];
    updateConnector(connector.id, {
      labels: updatedLabels,
      // Clear legacy fields on first new label addition
      description: undefined,
      startLabel: undefined,
      endLabel: undefined,
      startLabelHeight: undefined,
      centerLabelHeight: undefined,
      endLabelHeight: undefined
    });
  };

  const handleUpdateLabel = (
    labelId: string,
    updates: Partial<ConnectorLabel>
  ) => {
    const updatedLabels = labels.map((label) => {
      return label.id === labelId ? { ...label, ...updates } : label;
    });

    updateConnector(connector.id, {
      labels: updatedLabels,
      // Clear legacy fields
      description: undefined,
      startLabel: undefined,
      endLabel: undefined,
      startLabelHeight: undefined,
      centerLabelHeight: undefined,
      endLabelHeight: undefined
    });
  };

  const handleDeleteLabel = (labelId: string) => {
    const updatedLabels = labels.filter((label) => {
      return label.id !== labelId;
    });
    updateConnector(connector.id, {
      labels: updatedLabels,
      // Clear legacy fields
      description: undefined,
      startLabel: undefined,
      endLabel: undefined,
      startLabelHeight: undefined,
      centerLabelHeight: undefined,
      endLabelHeight: undefined
    });
  };

  return (
    <ControlsContainer>
      <Box
        style={{ position: 'relative', paddingTop: 24, paddingBottom: 24 }}
      >
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
        <Section title={t('connectorControls.labels')}>
          <Box style={{ marginBottom: 'var(--mantine-spacing-md)' }}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--mantine-spacing-md)'
              }}
            >
              <Text size="sm" c="dimmed">
                {t('connectorControls.labelCount').replace('{count}', String(labels.length))}
              </Text>
              <Button
                leftSection={<IconPlus size={14} />}
                onClick={handleAddLabel}
                disabled={labels.length >= 256}
                size="xs"
                variant="outline"
              >
                {t('connectorControls.addLabel')}
              </Button>
            </Box>

            {labels.length === 0 && (
              <Text
                size="sm"
                c="dimmed"
                style={{ textAlign: 'center', paddingTop: 'var(--mantine-spacing-md)', paddingBottom: 'var(--mantine-spacing-md)' }}
              >
                {t('connectorControls.noLabels')}
              </Text>
            )}

            {labels.map((label, index) => {
              return (
                <Paper key={label.id} withBorder p="md" style={{ marginBottom: 'var(--mantine-spacing-md)' }}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--mantine-spacing-xs)'
                    }}
                  >
                    <Text size="xs" c="dimmed">
                      {t('connectorControls.labelN').replace('{n}', String(index + 1))}
                    </Text>
                    <ActionIcon
                      size="sm"
                      onClick={() => {
                        return handleDeleteLabel(label.id);
                      }}
                      color="red"
                      variant="subtle"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Box>

                  <TextInput
                    label={t('connectorControls.text')}
                    value={label.text}
                    onChange={(e) => {
                      return handleUpdateLabel(label.id, {
                        text: e.target.value
                      });
                    }}
                    style={{ marginBottom: 'var(--mantine-spacing-md)' }}
                  />

                  <Box style={{ display: 'flex', gap: 'var(--mantine-spacing-md)', marginBottom: 'var(--mantine-spacing-md)' }}>
                    <TextInput
                      label={t('connectorControls.positionPercent')}
                      type="number"
                      value={label.position}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        // Allow empty input
                        if (inputValue === '') {
                          handleUpdateLabel(label.id, { position: 0 });
                          return;
                        }

                        const value = parseInt(inputValue, 10);
                        if (!Number.isNaN(value)) {
                          handleUpdateLabel(label.id, {
                            position: Math.max(0, Math.min(100, value))
                          });
                        }
                      }}
                      onBlur={(e) => {
                        // On blur, ensure we have a valid value
                        if (e.target.value === '') {
                          handleUpdateLabel(label.id, { position: 0 });
                        }
                      }}
                      min={0}
                      max={100}
                      style={{ flex: 1 }}
                    />

                    {isDoubleLineType && (
                      <Select
                        value={label.line || '1'}
                        onChange={(value) => {
                          return handleUpdateLabel(label.id, {
                            line: value as '1' | '2'
                          });
                        }}
                        data={[
                          { value: '1', label: t('connectorControls.line1') },
                          { value: '2', label: t('connectorControls.line2') }
                        ]}
                        style={{ flex: 1 }}
                        comboboxProps={{ withinPortal: true }}
                      />
                    )}
                  </Box>

                  <Box>
                    <Text size="xs" c="dimmed">
                      {t('connectorControls.heightOffset')}
                    </Text>
                    <Slider
                      marks={[
                        { value: -100 },
                        { value: -50 },
                        { value: 0 },
                        { value: 50 },
                        { value: 100 }
                      ]}
                      step={10}
                      min={-100}
                      max={100}
                      value={label.height || 0}
                      onChange={(value) => {
                        return handleUpdateLabel(label.id, {
                          height: value as number
                        });
                      }}
                    />
                  </Box>

                  <Box style={{ marginTop: 'var(--mantine-spacing-sm)' }}>
                    <Switch
                      checked={label.showLine !== false}
                      onChange={(e) => {
                        return handleUpdateLabel(label.id, {
                          showLine: e.currentTarget.checked
                        });
                      }}
                      label={t('connectorControls.showDottedLine')}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Section>
        <Section title={t('connectorControls.color')}>
          <Switch
            checked={useCustomColor}
            onChange={(e) => {
              setUseCustomColor(e.currentTarget.checked);
              if (!e.currentTarget.checked) {
                updateConnector(connector.id, { customColor: '' });
              }
            }}
            label={t('connectorControls.useCustomColor')}
            style={{ marginBottom: 'var(--mantine-spacing-md)' }}
          />
          {useCustomColor ? (
            <CustomColorInput
              value={connector.customColor || '#000000'}
              onChange={(color) => {
                updateConnector(connector.id, { customColor: color });
              }}
            />
          ) : (
            <ColorSelector
              onChange={(color) => {
                return updateConnector(connector.id, {
                  color,
                  customColor: ''
                });
              }}
              activeColor={connector.color}
            />
          )}
        </Section>
        <Section title={t('connectorControls.width')}>
          <Slider
            marks={[
              { value: 10 },
              { value: 15 },
              { value: 20 },
              { value: 25 },
              { value: 30 }
            ]}
            step={10}
            min={10}
            max={30}
            value={connector.width}
            onChange={(newWidth) => {
              updateConnector(connector.id, { width: newWidth as number });
            }}
          />
        </Section>
        <Section title={t('connectorControls.lineStyle')}>
          <Select
            value={connector.style || 'SOLID'}
            onChange={(value) => {
              updateConnector(connector.id, {
                style: value as Connector['style']
              });
            }}
            data={Object.values(connectorStyleOptions).map((style) => ({
              value: style,
              label: style
            }))}
            style={{ marginBottom: 'var(--mantine-spacing-md)' }}
            comboboxProps={{ withinPortal: true }}
          />
        </Section>
        <Section title={t('connectorControls.lineType')}>
          <Select
            value={connector.lineType || 'SINGLE'}
            onChange={(value) => {
              updateConnector(connector.id, {
                lineType: value as Connector['lineType']
              });
            }}
            data={Object.values(connectorLineTypeOptions).map((type) => {
              let displayName = t('connectorControls.doubleLineCircle');
              if (type === 'SINGLE') {
                displayName = t('connectorControls.singleLine');
              } else if (type === 'DOUBLE') {
                displayName = t('connectorControls.doubleLine');
              }
              return { value: type, label: displayName };
            })}
            comboboxProps={{ withinPortal: true }}
          />
        </Section>
        <Section title={t('connectorControls.arrow')}>
          <Select
            value={
              connector.arrowDirection !== undefined
                ? connector.arrowDirection
                : connector.showArrow !== undefined
                  ? (connector.showArrow ? 'FORWARD' : 'NONE')
                  : 'FORWARD'
            }
            onChange={(value) => {
              updateConnector(connector.id, {
                arrowDirection: value as ArrowDirection,
                // Clear legacy field when using new format
                showArrow: undefined
              });
            }}
            data={Object.values(arrowDirectionOptions).map((direction) => {
              let displayName: string = direction;
              if (direction === 'NONE') {
                displayName = t('connectorControls.arrowNone');
              } else if (direction === 'FORWARD') {
                displayName = t('connectorControls.arrowForward');
              } else if (direction === 'BACKWARD') {
                displayName = t('connectorControls.arrowBackward');
              } else if (direction === 'BOTH') {
                displayName = t('connectorControls.arrowBoth');
              }
              return { value: direction, label: displayName };
            })}
            comboboxProps={{ withinPortal: true }}
          />
        </Section>
        <Section>
          <Box>
            <DeleteButton
              onClick={() => {
                uiStateActions.setItemControls(null);
                deleteConnector(connector.id);
              }}
            />
          </Box>
        </Section>
      </Box>
    </ControlsContainer>
  );
};
