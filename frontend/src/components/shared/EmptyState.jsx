import React from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

function EmptyState({ title = 'No data yet', description, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-muted">
            <Icon name="info" size={32} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted mb-6 leading-relaxed">{description}</p>}
        {onAction && actionLabel && (
          <Button
            variant="primary"
            onClick={onAction}
            className="mt-2"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;

