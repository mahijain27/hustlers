import React from 'react';

function Card({ children, className = '', noPadding = false, ...props }) {
    return (
        <div
            className={`bg-surface rounded-xl border border-border overflow-hidden shadow-sm ${noPadding ? '' : 'p-6'
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
