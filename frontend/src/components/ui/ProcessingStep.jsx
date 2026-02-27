import React from 'react';
import Icon from './Icon.jsx';

function ProcessingStep({ icon, label, active, completed }) {
  const base =
    'flex flex-col items-center justify-center text-center p-3 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all';

  if (completed) {
    return (
      <div className={`${base} bg-primary/10 gap-1`}>
        <Icon name={icon} size={20} className="text-primary" />
        <p className="text-primary mt-1">{label}</p>
        <Icon name="check_circle" size={14} className="text-primary" />
      </div>
    );
  }

  if (active) {
    return (
      <div className={`${base} bg-primary/5 animate-pulse gap-1`}>
        <Icon name={icon} size={20} className="text-primary" />
        <p className="text-foreground mt-1">{label}</p>
        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
      </div>
    );
  }

  return (
    <div className={`${base} opacity-40 gap-1`}>
      <Icon name={icon} size={20} className="text-muted" />
      <p className="text-foreground mt-1">{label}</p>
      <div className="w-1.5 h-1.5 rounded-full bg-border mt-0.5" />
    </div>
  );
}

export default ProcessingStep;

