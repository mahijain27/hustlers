import React from 'react';
import Icon from './Icon.jsx';

function Input({ label, icon, className = '', error, ...props }) {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-bold text-foreground mb-1.5 tracking-tight">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted flex items-center justify-center pointer-events-none">
                        <Icon name={icon} size={18} />
                    </span>
                )}
                <input
                    className={`w-full bg-surface-muted border ${error ? 'border-danger focus:ring-danger/50' : 'border-border focus:ring-primary/50'
                        } rounded-xl ${icon ? 'pl-10' : 'pl-4'
                        } pr-4 py-2.5 text-sm text-foreground focus:ring-2 focus:outline-none transition-shadow`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
        </div>
    );
}

export default Input;
