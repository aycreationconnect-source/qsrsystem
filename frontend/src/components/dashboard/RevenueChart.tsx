import React from 'react';

interface RevenueChartProps {
  last7Days: Date[];
  revenueByDay: number[];
  maxRev: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ last7Days, revenueByDay, maxRev }) => {
  return (
    <div className="admin-card">
      <h3>Revenue Overview</h3>
      <div className="chart-placeholder">
        {revenueByDay.map((val, i) => (
          <div
            key={i}
            className="chart-bar"
            style={{ height: `${(val / maxRev) * 100}%`, minHeight: '5%' }}
            data-val={`₹${val.toFixed(0)}`}
          ></div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {last7Days.map((d, i) => (
          <span key={i}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
        ))}
      </div>
    </div>
  );
};
