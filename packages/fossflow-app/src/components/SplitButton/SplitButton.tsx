import { Button, Menu } from '@mantine/core';
import { IconChevronDown } from './icons';

interface SplitButtonOption {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface SplitButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  options: SplitButtonOption[];
}

const SplitButton = ({ label, icon, onClick, disabled, options }: SplitButtonProps) => {
  return (
    <Button.Group>
      <Button
        onClick={onClick}
        disabled={disabled}
        size="sm"
        variant="filled"
        leftSection={icon ? <span>{icon}</span> : undefined}
      >
        {label}
      </Button>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button
            size="sm"
            variant="filled"
            px={8}
            aria-label="More options"
          >
            <IconChevronDown size={14} />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {options.map((option, index) => (
            <Menu.Item
              key={index}
              onClick={option.onClick}
              disabled={option.disabled}
              leftSection={option.icon ? <span>{option.icon}</span> : undefined}
            >
              {option.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Button.Group>
  );
};

export default SplitButton;
