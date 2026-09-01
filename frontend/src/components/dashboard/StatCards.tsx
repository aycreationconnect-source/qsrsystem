import React from 'react';

interface StatCardsProps {
  ordersTodayCount: number;
  ordersTrend: number;
  revenueToday: number;
  revenueTrend: number;
  activeTablesCount: number;
  totalTables: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  ordersTodayCount,
  ordersTrend,
  revenueToday,
  revenueTrend,
  activeTablesCount,
  totalTables,
}) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-title">Total Orders Today</div>
        <div className="stat-value">{ordersTodayCount}</div>
        <div className={`stat-trend ${ordersTrend >= 0 ? 'positive' : 'neutral'}`}>
          {ordersTrend >= 0 ? '↑' : '↓'} {Math.abs(ordersTrend)}% vs yesterday
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-title">Total Revenue</div>
        <div className="stat-value">₹{revenueToday.toFixed(2)}</div>
        <div className={`stat-trend ${revenueTrend >= 0 ? 'positive' : 'neutral'}`}>
          {revenueTrend >= 0 ? '↑' : '↓'} {Math.abs(revenueTrend)}% vs yesterday
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🍽️</div>
        <div className="stat-title">Active Tables</div>
        <div className="stat-value">
          {activeTablesCount} / {totalTables}
        </div>
        <div className="stat-trend neutral">Live</div>
      </div>
    </div>
  );
};
