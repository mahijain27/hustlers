import React from 'react';
import Icon from './Icon.jsx';

// Common base styles
const variants = {
    primary: 'bg-primary text-surface hover:brightness-110 shadow-lg shadow-primary/20',
    secondary: 'bg-surface-muted text-foreground hover:bg-surface border border-border',
    ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface-muted',
    danger: 'bg-danger text-surface hover:brightness-110 shadow-lg shadow-danger/20',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
};

function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    disabled,
    ...props
}) {
    const baseClasses =
        'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:shadow-none';
    const variantClasses = variants[variant];
    const sizeClasses = sizes[size];

    // Auto-scale icon based on button size
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 18;

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
            disabled={disabled}
            {...props}
        >
            {icon && <Icon name={icon} size={iconSize} className="shrink-0" />}
            {children}
        </button>
    );
}

export default Button;
