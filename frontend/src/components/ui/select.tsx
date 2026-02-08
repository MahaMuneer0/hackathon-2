import React from 'react';
import clsx from 'clsx';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface SelectValueProps {
  placeholder?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const Select: React.FC<SelectProps> = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // return (

  //   <div className="relative" ref={triggerRef}>
  //     {React.Children.map(children, (child) => {
  //       if (React.isValidElement(child) && (child.type as any).name === 'SelectTrigger') {
  //         return React.cloneElement(child, {
  //           ...child.props,
  //           onClick: () => setOpen(!open),
  //         });
  //       }
  //       if (React.isValidElement(child) && (child.type as any).name === 'SelectContent') {
  //         return React.cloneElement(child, {
  //           ...child.props,
  //           open,
  //           selectedValue,
  //           onValueChange: handleValueChange,
  //         });
  //       }
  //       return child;
  //     })}
  //   </div>
  // );
  return (
  <div className="relative" ref={triggerRef}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Check by displayName instead of .name
        const childType = child.type as any;
        
        if (childType === SelectTrigger || childType.displayName === 'SelectTrigger') {
          return React.cloneElement(child, {
            ...child.props,
            onClick: () => setOpen(!open),
          });
        }
        if (childType === SelectContent || childType.displayName === 'SelectContent') {
          return React.cloneElement(child, {
            ...child.props,
            open,
            selectedValue,
            onValueChange: handleValueChange,
          });
        }
      }
      return child;
    })}
  </div>
);
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={clsx(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={onClick}
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-50"
      >
        <path
          d="M3.13523 6.15803C3.3241 5.95651 3.64052 5.94639 3.84197 6.13529L7.5 9.56503L11.158 6.13529C11.3595 5.94639 11.6759 5.95651 11.8647 6.15803C12.0536 6.35955 12.0435 6.67597 11.842 6.86487L7.84197 10.6149C7.64964 10.7966 7.35036 10.7966 7.15803 10.6149L3.15803 6.86487C2.95651 6.67597 2.94639 6.35955 3.13523 6.15803Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
  open,
  selectedValue,
  onValueChange
}) => {
  if (!open) return null;

  return (
    <div className={clsx(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1 w-full',
      className
    )}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type as any).name === 'SelectItem') {
          const isSelected = (child.props as any).value === selectedValue;
          return React.cloneElement(child, {
            ...child.props,
            isSelected,
            onClick: () => onValueChange && onValueChange((child.props as any).value),
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  className,
  isSelected,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
          >
            <path
              d="M11.4669 3.72684C11.7558 3.91594 11.8369 4.30306 11.6478 4.59194L7.39779 11.0919C7.29796 11.2455 7.138 11.3385 6.96373 11.3473C6.78947 11.3562 6.6294 11.2791 6.5299 11.1264L3.36454 6.27354C3.17544 5.98466 3.2565 5.59754 3.54538 5.40843C3.83427 5.21933 4.22139 5.29995 4.41082 5.58963L6.86154 9.30011L10.6521 3.40884C10.8412 3.11996 11.2283 3.03926 11.4669 3.72684Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </span>
      )}
      {children}
    </div>
  );
};

// Select.Trigger = SelectTrigger;
// Select.Value = SelectValue;
// Select.Content = SelectContent;
// Select.Item = SelectItem;
SelectTrigger.displayName = 'SelectTrigger';
SelectValue.displayName = 'SelectValue';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';


export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };