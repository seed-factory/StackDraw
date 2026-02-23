import React from 'react';
import { Menu } from '@mantine/core';

interface MenuItemI {
  label: string;
  onClick: () => void;
}

interface Props {
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  menuItems: MenuItemI[];
}

export const ContextMenu = ({
  onClose,
  anchorEl,
  menuItems
}: Props) => {
  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <Menu
      opened={!!anchorEl}
      onClose={onClose}
      position="bottom-start"
      offset={0}
      shadow="md"
    >
      <Menu.Target>
        <div
          style={{
            position: 'fixed',
            left: rect.left,
            top: rect.top,
            width: 0,
            height: 0,
            pointerEvents: 'none'
          }}
        />
      </Menu.Target>
      <Menu.Dropdown>
        {menuItems.map((item, index) => {
          return (
            <Menu.Item key={index} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};
