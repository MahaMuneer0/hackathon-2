import React from 'react';
import clsx from 'clsx';

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const Dialog: React.FC<DialogProps> & {
  Content: React.FC<DialogContentProps>;
  Header: React.FC<DialogHeaderProps>;
  Title: React.FC<DialogTitleProps>;
} = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type as any).name === 'DialogContent') {
          return React.cloneElement(child, {
            ...child.props,
            onClose: handleClose
          });
        }
        return child;
      })}
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps & { onClose?: () => void }> = ({
  children,
  className,
  onClose,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'relative bg-white rounded-lg shadow-xl z-50 w-full max-w-md',
        className
      )}
      {...props}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div className={clsx('flex flex-col space-y-2 text-center sm:text-left', className)} {...props}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => {
  return (
    <h3 className={clsx('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};

Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;

export { Dialog, DialogContent, DialogHeader, DialogTitle };