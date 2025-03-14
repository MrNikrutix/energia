import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'medium', children, ...props }) => {
  const baseStyles = 'rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizeStyles = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;