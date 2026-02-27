import React from 'react';
import Button from '../ui/Button.jsx';

function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="max-w-md w-full rounded-xl bg-surface border border-border p-6 shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger">
            <Icon name="warning" size={24} />
          </div>
        </div>
        <h2 className="text-base font-bold text-foreground mb-1 tracking-tight">{title}</h2>
        {message && <p className="text-sm text-muted mb-6">{message}</p>}
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            icon="refresh"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;

