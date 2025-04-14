import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="stat-card">
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
