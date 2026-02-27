import React from 'react';

function Table({ children, className = '' }) {
    return (
        <div className={`bg-surface rounded-xl border border-border overflow-hidden shadow-sm ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    {children}
                </table>
            </div>
        </div>
    );
}

export function TableHead({ children }) {
    return (
        <thead>
            <tr className="bg-surface-muted text-muted font-bold border-b border-border text-xs uppercase tracking-wider">
                {children}
            </tr>
        </thead>
    );
}

export function TableBody({ children }) {
    return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
    return (
        <tr className={`hover:bg-surface-muted/50 transition-colors ${className}`}>
            {children}
        </tr>
    );
}

export function TableCell({ children, className = '' }) {
    return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}

export function TableHeaderCell({ children, className = '' }) {
    return <th className={`px-6 py-4 font-semibold ${className}`}>{children}</th>;
}

export default Table;
