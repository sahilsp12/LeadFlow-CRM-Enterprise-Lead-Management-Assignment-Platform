import React from 'react';
import { CardSkeleton } from './Loader';

const DashboardStatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconBackground,
  trend,
  status,
  variant = 'primary', // 'primary' | 'info' | 'success' | 'secondary'
  loading 
}) => {
  if (loading) {
    return <CardSkeleton />;
  }

  // Variant color definitions (fallback when iconBackground isn't provided)
  const variantStyles = {
    primary: { text: 'text-primary', iconBg: 'rgba(79, 70, 229, 0.1)' },
    info: { text: 'text-info', iconBg: 'rgba(6, 182, 212, 0.1)' },
    success: { text: 'text-success', iconBg: 'rgba(16, 185, 129, 0.1)' },
    secondary: { text: 'text-secondary', iconBg: 'rgba(100, 116, 139, 0.1)' }
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  // Resolve icon background styling (supports CSS color value or Bootstrap background utility class name)
  const isClass = iconBackground && typeof iconBackground === 'string' && (iconBackground.startsWith('bg-') || iconBackground.includes(' '));
  const appliedStyle = isClass ? {} : { backgroundColor: iconBackground || currentVariant.iconBg };
  const appliedClass = isClass ? iconBackground : `${currentVariant.text}`;

  const renderTrendStatus = () => {
    const val = trend || status;
    if (!val) return null;

    if (typeof val === 'object') {
      const isPositive = val.isPositive !== false;
      const text = val.text || val.value || '';
      const label = val.label || '';
      
      const badgeBg = isPositive 
        ? 'rgba(16, 185, 129, 0.12)' 
        : 'rgba(239, 68, 68, 0.12)';
      const badgeColor = isPositive ? '#10b981' : '#ef4444';
      const iconClass = isPositive ? 'bi-arrow-up-short' : 'bi-arrow-down-short';

      return (
        <div className="d-flex align-items-center gap-1">
          <span 
            className="d-inline-flex align-items-center rounded-pill px-2 py-0.5 fw-semibold animate-fade-in" 
            style={{ 
              fontSize: '10px', 
              backgroundColor: badgeBg, 
              color: badgeColor,
              lineHeight: '1.2'
            }}
          >
            <i className={`bi ${iconClass} me-0.5`} style={{ fontSize: '12px' }}></i>
            {text}
          </span>
          {label && <span className="text-muted small ms-1" style={{ fontSize: '10px' }}>{label}</span>}
        </div>
      );
    }

    const isPositive = !String(val).startsWith('-');
    const badgeBg = isPositive 
      ? 'rgba(16, 185, 129, 0.12)' 
      : 'rgba(239, 68, 68, 0.12)';
    const badgeColor = isPositive ? '#10b981' : '#ef4444';
    const iconClass = isPositive ? 'bi-arrow-up-short' : 'bi-arrow-down-short';

    return (
      <div className="d-flex align-items-center gap-1">
        <span 
          className="d-inline-flex align-items-center rounded-pill px-2 py-0.5 fw-semibold animate-fade-in" 
          style={{ 
            fontSize: '10px', 
            backgroundColor: badgeBg, 
            color: badgeColor,
            lineHeight: '1.2'
          }}
        >
          <i className={`bi ${iconClass} me-0.5`} style={{ fontSize: '12px' }}></i>
          {val}
        </span>
      </div>
    );
  };

  return (
    <div className="card border-0 premium-card p-4 h-100" style={{ transition: 'all 0.25s ease' }}>
      <div className="d-flex align-items-center justify-content-between h-100">
        <div className="d-flex flex-column justify-content-between h-100 gap-1">
          <div>
            <span className="text-muted small fw-semibold text-uppercase tracking-wider d-block mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              {title}
            </span>
            <h3 className="m-0 display-font fw-bold text-dark fs-2" style={{ lineHeight: '1.2' }}>
              {value}
            </h3>
          </div>
          
          {/* Subtitle/Trend block preserving vertical spacing & alignments across all sibling cards */}
          {(subtitle || trend || status) ? (
            <div className="d-flex align-items-center flex-wrap gap-2 mt-2" style={{ minHeight: '18px' }}>
              {renderTrendStatus()}
              {subtitle && (
                <span className="text-muted small" style={{ fontSize: '11px', display: 'block' }}>
                  {subtitle}
                </span>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2 mt-2" style={{ minHeight: '18px', visibility: 'hidden' }}>
              <span className="text-muted small" style={{ fontSize: '11px', display: 'block' }}>
                Placeholder
              </span>
            </div>
          )}
        </div>
        
        {/* Perfectly centered, standardized flexbox icon container */}
        <div 
          className={`d-flex align-items-center justify-content-center rounded-circle ${appliedClass}`}
          style={{ 
            width: '52px', 
            height: '52px', 
            ...appliedStyle,
            fontSize: '22px',
            flexShrink: 0 
          }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatCard;
