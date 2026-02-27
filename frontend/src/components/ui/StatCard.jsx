import React from 'react';

import Card from './Card.jsx';
import Icon from './Icon.jsx';

const toneStyles = {
  primary: {
    iconBg: 'bg-primary/10 text-primary',
    chipBg: 'bg-primary/10 text-primary',
  },
  success: {
    iconBg: 'bg-success/10 text-success',
    chipBg: 'bg-success/10 text-success',
  },
  danger: {
    iconBg: 'bg-danger/10 text-danger',
    chipBg: 'bg-danger/10 text-danger',
  },
  warning: {
    iconBg: 'bg-warning/10 text-warning',
    chipBg: 'bg-warning/10 text-warning',
  },
  info: {
    iconBg: 'bg-info/10 text-info',
    chipBg: 'bg-info/10 text-info',
  },
};

function StatCard({ icon, label, value, chipLabel, tone = 'primary' }) {
  const styles = toneStyles[tone] ?? toneStyles.primary;

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <Icon name={icon} size={24} />
        </div>
        {chipLabel && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.chipBg}`}
          >
            {chipLabel}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <h3 className="text-3xl font-black mt-1 text-foreground tracking-tight">{value}</h3>
    </Card>
  );
}

export default StatCard;

