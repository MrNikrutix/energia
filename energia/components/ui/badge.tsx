import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'outline' | 'destructive';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const baseStyles = "inline-flex items-center px-2 py-1 rounded text-sm font-medium";
  const variantStyles = {
    default: "bg-blue-500 text-white",
    outline: "border border-blue-500 text-blue-500",
    destructive: "bg-red-500 text-white",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;