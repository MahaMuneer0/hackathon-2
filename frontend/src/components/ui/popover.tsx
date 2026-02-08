import React from 'react';
import clsx from 'clsx';

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

const Popover: React.FC<PopoverProps> & {
  Trigger: React.FC<PopoverTriggerProps>;
  Content: React.FC<PopoverContentProps>;
} = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  // return (
  //   <div ref={popoverRef} className="relative">
  //     {React.Children.map(children, (child) => {
  //       if (React.isValidElement(child) && (child.type as any).name === 'PopoverTrigger') {
  //         return React.cloneElement(child, {
  //           ...child.props,
  //           onClick: () => {
  //             const newOpenState = !isOpen;
  //             setIsOpen(newOpenState);
  //             if (onOpenChange) onOpenChange(newOpenState);
  //           }
  //         });
  //       }
  //       if (React.isValidElement(child) && (child.type as any).name === 'PopoverContent') {
  //         return React.cloneElement(child, {
  //           ...child.props,
  //           isOpen: isOpen
  //         });
  //       }
  //       return child;
  //     })}
  //   </div>
  // );
  return (
  <div ref={popoverRef} className="relative">
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      const childType = child.type as any;

      // Trigger
      if (childType === PopoverTrigger || childType.displayName === 'PopoverTrigger') {
        return React.cloneElement(child as React.ReactElement<any>, {
          onClick: () => {
            const newOpenState = !isOpen;
            setIsOpen(newOpenState);
            onOpenChange?.(newOpenState);
          }
        });
      }

      // Content
      if (childType === PopoverContent || childType.displayName === 'PopoverContent') {
        return React.cloneElement(child as React.ReactElement<any>, {
          isOpen
        });
      }

      return child;
    })}
  </div>
);

};

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, asChild = false }) => {
  const cloneElement = (child: React.ReactElement) => {
    return React.cloneElement(child, {
      ...child.props,
      className: clsx(child.props.className, 'cursor-pointer')
    });
  };

  if (asChild && React.isValidElement(children)) {
    return cloneElement(children);
  }

  return (
    <div className="cursor-pointer">
      {children}
    </div>
  );
};

const PopoverContent: React.FC<PopoverContentProps & { isOpen?: boolean }> = ({
  children,
  className,
  isOpen = false
}) => {
  if (!isOpen) return null;

  return (
    <div className={clsx(
      "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
      className
    )}>
      {children}
    </div>
  );
};

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;

export { Popover, PopoverTrigger, PopoverContent };