import React from 'react';
import Card from './Card';
import './StatCard.css';

export default function StatCard({ title, value, icon: Icon, colorClass = 'text-primary' }) {
  return (
    <Card className="stat-card">
      <div className="stat-card-content">
        <div>
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className={`stat-icon-wrapper ${colorClass}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
    </Card>
  );
}
