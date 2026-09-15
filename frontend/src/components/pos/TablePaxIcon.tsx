import React from 'react';
import { cn } from '../../lib/utils';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export interface TablePaxIconProps {
  seats?: number;
  status?: TableStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TablePaxIcon: React.FC<TablePaxIconProps> = ({
  seats = 4,
  status = 'AVAILABLE',
  className,
  size = 'md',
}) => {
  // Determine color theme based on status
  const getColors = () => {
    switch (status) {
      case 'OCCUPIED':
        return {
          primary: '#ea580c', // amber-600
          tableTop: '#f97316', // orange-500
          tableFill: '#ffedd5', // orange-100
          chair: '#ea580c',
          chairFill: '#fed7aa', // orange-200
          accent: '#c2410c',
        };
      case 'RESERVED':
        return {
          primary: '#e11d48', // rose-600
          tableTop: '#f43f5e', // rose-500
          tableFill: '#ffe4e6', // rose-100
          chair: '#e11d48',
          chairFill: '#fecdd3', // rose-200
          accent: '#be123c',
        };
      case 'CLEANING':
        return {
          primary: '#0284c7', // sky-600
          tableTop: '#0ea5e9', // sky-500
          tableFill: '#e0f2fe', // sky-100
          chair: '#0284c7',
          chairFill: '#bae6fd', // sky-200
          accent: '#0369a1',
        };
      case 'AVAILABLE':
      default:
        return {
          primary: '#64748b', // slate-500
          tableTop: '#64748b', // slate-500
          tableFill: '#f1f5f9', // slate-100
          chair: '#64748b',
          chairFill: '#e2e8f0', // slate-200
          accent: '#475569',
        };
    }
  };

  const colors = getColors();

  // Size configurations
  const dimensions = {
    sm: { width: 80, height: 48 },
    md: { width: 104, height: 58 },
    lg: { width: 128, height: 70 },
  }[size];

  // Helper to draw a single dining chair facing inward
  // side: 'left' | 'right'
  const renderChair = (x: number, y: number, side: 'left' | 'right', key: string | number) => {
    const isLeft = side === 'left';
    return (
      <g key={key} className="transition-all duration-200">
        {/* Backrest */}
        <rect
          x={isLeft ? x : x + 7}
          y={y - 12}
          width={3.5}
          height={18}
          rx={1.75}
          fill={colors.chair}
        />
        {/* Seat Cushion */}
        <rect
          x={isLeft ? x + 3.5 : x}
          y={y - 1}
          width={7.5}
          height={4.5}
          rx={1.5}
          fill={colors.chairFill}
          stroke={colors.chair}
          strokeWidth={1}
        />
        {/* Chair Legs */}
        <line
          x1={isLeft ? x + 1.5 : x + 8.5}
          y1={y + 5}
          x2={isLeft ? x + 1.5 : x + 8.5}
          y2={y + 14}
          stroke={colors.chair}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <line
          x1={isLeft ? x + 9 : x + 1.5}
          y1={y + 5}
          x2={isLeft ? x + 9 : x + 1.5}
          y2={y + 14}
          stroke={colors.chair}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </g>
    );
  };

  // Render 2 Pax: 1 chair on left, 1 on right
  const render2Pax = () => {
    return (
      <svg
        viewBox="0 0 100 60"
        width={dimensions.width}
        height={dimensions.height}
        className={cn('shrink-0 drop-shadow-2xs select-none', className)}
      >
        {/* Left Chair */}
        {renderChair(15, 26, 'left', 'chair-left-1')}

        {/* Central Dining Table */}
        <rect
          x="33"
          y="20"
          width="34"
          height="8"
          rx="4"
          fill={colors.tableTop}
        />
        {/* Table Under-apron / Bevel */}
        <rect
          x="36"
          y="28"
          width="28"
          height="3"
          rx="1"
          fill={colors.accent}
          opacity="0.6"
        />
        {/* Table Legs */}
        <line
          x1="39"
          y1="31"
          x2="38"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="61"
          y1="31"
          x2="62"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Right Chair */}
        {renderChair(74, 26, 'right', 'chair-right-1')}

        {/* Dining Platter / Accents for Occupied */}
        {status === 'OCCUPIED' && (
          <g>
            <ellipse cx="50" cy="18" rx="6" ry="2.5" fill="#ea580c" />
            <ellipse cx="50" cy="17" rx="4" ry="1.5" fill="#fed7aa" />
          </g>
        )}

        {/* Reservation Tag for Reserved */}
        {status === 'RESERVED' && (
          <g>
            <circle cx="50" cy="16" r="3.5" fill="#f43f5e" />
            <circle cx="50" cy="16" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* Sparkle for Cleaning */}
        {status === 'CLEANING' && (
          <g transform="translate(46, 12)">
            <path
              d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
              fill="#0ea5e9"
            />
          </g>
        )}
      </svg>
    );
  };

  // Render 4 Pax: 2 chairs on left, 2 chairs on right (standard dining)
  const render4Pax = () => {
    return (
      <svg
        viewBox="0 0 110 60"
        width={dimensions.width}
        height={dimensions.height}
        className={cn('shrink-0 drop-shadow-2xs select-none', className)}
      >
        {/* Left Chairs (2 chairs spaced out) */}
        {renderChair(14, 26, 'left', 'chair-l-1')}

        {/* Table Surface */}
        <rect
          x="32"
          y="19"
          width="46"
          height="8.5"
          rx="4"
          fill={colors.tableTop}
        />
        {/* Table Apron */}
        <rect
          x="36"
          y="27.5"
          width="38"
          height="3"
          rx="1"
          fill={colors.accent}
          opacity="0.6"
        />
        {/* Table Legs */}
        <line
          x1="39"
          y1="30.5"
          x2="38"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <line
          x1="71"
          y1="30.5"
          x2="72"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Right Chair */}
        {renderChair(85, 26, 'right', 'chair-r-1')}

        {/* Status Accents */}
        {status === 'OCCUPIED' && (
          <g>
            <ellipse cx="55" cy="17" rx="8" ry="3" fill="#ea580c" />
            <ellipse cx="55" cy="16" rx="5.5" ry="1.8" fill="#fed7aa" />
            <circle cx="43" cy="18" r="2" fill="#c2410c" />
            <circle cx="67" cy="18" r="2" fill="#c2410c" />
          </g>
        )}

        {status === 'RESERVED' && (
          <g>
            <rect x="50" y="12" width="10" height="6.5" rx="1.5" fill="#f43f5e" />
            <line x1="52" y1="14.5" x2="58" y2="14.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            <line x1="52" y1="16.5" x2="56" y2="16.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          </g>
        )}

        {status === 'CLEANING' && (
          <g transform="translate(51, 11)">
            <path
              d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
              fill="#0ea5e9"
            />
          </g>
        )}
      </svg>
    );
  };

  // Render 6 Pax: Longer table with 3 chairs or wider layout
  const render6Pax = () => {
    return (
      <svg
        viewBox="0 0 124 60"
        width={dimensions.width * 1.08}
        height={dimensions.height}
        className={cn('shrink-0 drop-shadow-2xs select-none', className)}
      >
        {/* Left Chair */}
        {renderChair(12, 26, 'left', 'chair-6-l')}

        {/* Long Table Top */}
        <rect
          x="30"
          y="19"
          width="64"
          height="8.5"
          rx="4"
          fill={colors.tableTop}
        />
        {/* Apron */}
        <rect
          x="34"
          y="27.5"
          width="56"
          height="3"
          rx="1"
          fill={colors.accent}
          opacity="0.6"
        />
        {/* 4 Table Legs for longer 6 pax table */}
        <line
          x1="37"
          y1="30.5"
          x2="36"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <line
          x1="57"
          y1="30.5"
          x2="57"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="67"
          y1="30.5"
          x2="67"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="87"
          y1="30.5"
          x2="88"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Right Chair */}
        {renderChair(101, 26, 'right', 'chair-6-r')}

        {/* Multi-dish accents for Occupied */}
        {status === 'OCCUPIED' && (
          <g>
            <ellipse cx="62" cy="17" rx="8" ry="3" fill="#ea580c" />
            <ellipse cx="62" cy="16" rx="5.5" ry="1.8" fill="#fed7aa" />
            <ellipse cx="44" cy="17.5" rx="5" ry="2" fill="#c2410c" />
            <ellipse cx="80" cy="17.5" rx="5" ry="2" fill="#c2410c" />
          </g>
        )}

        {status === 'RESERVED' && (
          <g>
            <rect x="56" y="12" width="12" height="7" rx="2" fill="#f43f5e" />
            <line x1="59" y1="14.5" x2="65" y2="14.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            <line x1="59" y1="16.5" x2="63" y2="16.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          </g>
        )}

        {status === 'CLEANING' && (
          <g transform="translate(58, 11)">
            <path
              d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
              fill="#0ea5e9"
            />
          </g>
        )}
      </svg>
    );
  };

  // Render 8 Pax: Extended Table
  const render8Pax = () => {
    return (
      <svg
        viewBox="0 0 136 60"
        width={dimensions.width * 1.15}
        height={dimensions.height}
        className={cn('shrink-0 drop-shadow-2xs select-none', className)}
      >
        {/* Left Chair */}
        {renderChair(10, 26, 'left', 'chair-8-l')}

        {/* Extended Table Surface */}
        <rect
          x="28"
          y="18.5"
          width="80"
          height="9"
          rx="4.5"
          fill={colors.tableTop}
        />
        {/* Apron */}
        <rect
          x="32"
          y="27.5"
          width="72"
          height="3"
          rx="1"
          fill={colors.accent}
          opacity="0.6"
        />
        {/* Table Legs */}
        <line
          x1="36"
          y1="30.5"
          x2="35"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="68"
          y1="30.5"
          x2="68"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="100"
          y1="30.5"
          x2="101"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Right Chair */}
        {renderChair(115, 26, 'right', 'chair-8-r')}

        {/* Accents */}
        {status === 'OCCUPIED' && (
          <g>
            <ellipse cx="68" cy="16.5" rx="9" ry="3.2" fill="#ea580c" />
            <ellipse cx="68" cy="15.5" rx="6" ry="2" fill="#fed7aa" />
            <ellipse cx="46" cy="17" rx="5" ry="2" fill="#c2410c" />
            <ellipse cx="90" cy="17" rx="5" ry="2" fill="#c2410c" />
          </g>
        )}

        {status === 'RESERVED' && (
          <g>
            <rect x="61" y="11" width="14" height="7.5" rx="2" fill="#f43f5e" />
            <line x1="64" y1="14" x2="72" y2="14" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="64" y1="16.2" x2="69" y2="16.2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {status === 'CLEANING' && (
          <g transform="translate(64, 10)">
            <path
              d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
              fill="#0ea5e9"
            />
          </g>
        )}
      </svg>
    );
  };

  // Render 10+ Pax: Grand Banquet / Conference Table
  const render10PaxPlus = () => {
    return (
      <svg
        viewBox="0 0 148 60"
        width={dimensions.width * 1.25}
        height={dimensions.height}
        className={cn('shrink-0 drop-shadow-2xs select-none', className)}
      >
        {/* Left Chair */}
        {renderChair(8, 26, 'left', 'chair-10-l')}

        {/* Grand Banquet Table Surface */}
        <rect
          x="26"
          y="18"
          width="96"
          height="9.5"
          rx="4.75"
          fill={colors.tableTop}
        />
        {/* Apron */}
        <rect
          x="30"
          y="27.5"
          width="88"
          height="3"
          rx="1"
          fill={colors.accent}
          opacity="0.6"
        />
        {/* Multiple Sturdy Legs */}
        <line
          x1="34"
          y1="30.5"
          x2="33"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="62"
          y1="30.5"
          x2="62"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1="86"
          y1="30.5"
          x2="86"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1="114"
          y1="30.5"
          x2="115"
          y2="44"
          stroke={colors.tableTop}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Right Chair */}
        {renderChair(129, 26, 'right', 'chair-10-r')}

        {/* Accents for Grand Table */}
        {status === 'OCCUPIED' && (
          <g>
            <ellipse cx="74" cy="16" rx="10" ry="3.5" fill="#ea580c" />
            <ellipse cx="74" cy="15" rx="7" ry="2" fill="#fed7aa" />
            <circle cx="48" cy="16.5" r="2.5" fill="#c2410c" />
            <circle cx="100" cy="16.5" r="2.5" fill="#c2410c" />
          </g>
        )}

        {status === 'RESERVED' && (
          <g>
            <rect x="66" y="10.5" width="16" height="8" rx="2" fill="#f43f5e" />
            <line x1="70" y1="13.5" x2="78" y2="13.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="70" y1="16" x2="75" y2="16" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {status === 'CLEANING' && (
          <g transform="translate(70, 9.5)">
            <path
              d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
              fill="#0ea5e9"
            />
          </g>
        )}
      </svg>
    );
  };

  // Dispatch based on seat capacity
  if (seats <= 2) return render2Pax();
  if (seats <= 4) return render4Pax();
  if (seats <= 6) return render6Pax();
  if (seats <= 8) return render8Pax();
  return render10PaxPlus();
};
