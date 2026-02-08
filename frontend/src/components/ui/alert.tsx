import React from 'react';
import clsx from 'clsx';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert: React.FC<AlertProps> = ({ children, className, variant = 'default', ...props }) => {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div
      className={clsx(
        'relative p-4 border rounded-lg',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className, ...props }) => {
  return (
    <div className={clsx('text-sm', className)} {...props}>
      {children}
    </div>
  );
};

Alert.Description = AlertDescription;

export { Alert, AlertDescription };