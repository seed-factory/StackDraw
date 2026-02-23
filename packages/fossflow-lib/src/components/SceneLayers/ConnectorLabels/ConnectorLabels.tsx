import React, { memo, useMemo } from 'react';
import { useScene } from 'src/hooks/useScene';
import { ConnectorLabel } from './ConnectorLabel';

interface Props {
  connectors: ReturnType<typeof useScene>['connectors'];
}

export const ConnectorLabels = memo(({ connectors }: Props) => {
  // Memoize filtered connectors
  const connectorsWithLabels = useMemo(() => {
    return connectors.filter((connector) =>
      Boolean(
        connector.description ||
        connector.startLabel ||
        connector.endLabel ||
        (connector.labels && connector.labels.length > 0)
      )
    );
  }, [connectors]);

  return (
    <>
      {connectorsWithLabels.map((connector) => (
        <ConnectorLabel key={connector.id} connector={connector} />
      ))}
    </>
  );
});
