import React, { memo, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import type { useScene } from 'src/hooks/useScene';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { Connector } from './Connector';

interface Props {
  connectors: ReturnType<typeof useScene>['connectors'];
}

export const Connectors = memo(({ connectors }: Props) => {
  // Combine UI state selectors with shallow comparison to reduce re-renders
  const { itemControlsType, itemControlsId, modeType, modeId, selectedItems } = useUiStateStore(
    (state) => ({
      itemControlsType: state.itemControls?.type,
      itemControlsId: state.itemControls?.type === 'CONNECTOR' ? state.itemControls.id : null,
      modeType: state.mode.type,
      modeId: state.mode.type === 'CONNECTOR' ? state.mode.id : null,
      selectedItems: state.selectedItems
    }),
    shallow
  );

  // Get selected connector IDs from selectedItems - stable Set creation
  const selectedConnectorIds = useMemo(() => {
    return new Set(
      selectedItems
        .filter(item => item.type === 'CONNECTOR')
        .map(item => item.id)
    );
  }, [selectedItems]);

  const selectedConnectorId = useMemo(() => {
    if (modeType === 'CONNECTOR') {
      return modeId;
    }
    if (itemControlsType === 'CONNECTOR') {
      return itemControlsId;
    }
    return null;
  }, [modeType, modeId, itemControlsType, itemControlsId]);

  // Memoize reversed array
  const reversedConnectors = useMemo(() => {
    return [...connectors].reverse();
  }, [connectors]);

  // Pre-compute isSelected for each connector to ensure stable boolean values
  const connectorSelectionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    reversedConnectors.forEach(connector => {
      map.set(
        connector.id,
        selectedConnectorId === connector.id || selectedConnectorIds.has(connector.id)
      );
    });
    return map;
  }, [reversedConnectors, selectedConnectorId, selectedConnectorIds]);

  return (
    <>
      {reversedConnectors.map((connector) => (
        <Connector
          key={connector.id}
          connector={connector}
          isSelected={connectorSelectionMap.get(connector.id) ?? false}
        />
      ))}
    </>
  );
});
