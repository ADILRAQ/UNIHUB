import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  breadcrumbTo?: string;
  actions?: ReactNode;
}

/**
 * Shared page header bar — 72px high, white bg, border-bottom.
 * Used by pages that need a top bar with title and optional actions.
 */
const PageHeader = ({ title, breadcrumb, breadcrumbTo, actions }: PageHeaderProps) => (
  <header
    style={{
      height: 72,
      flexShrink: 0,
      boxSizing: 'border-box',
      background: '#FFFFFF',
      borderBottom: '1px solid #E8E6F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      gap: 16,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      {breadcrumb && breadcrumbTo && (
        <Link
          to={breadcrumbTo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: '#4A41C9',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          {breadcrumb}
        </Link>
      )}
      <h1
        style={{
          margin: 0,
          fontSize: breadcrumb ? 18 : 20,
          fontWeight: 700,
          color: '#1F1B33',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </h1>
    </div>
    {actions && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {actions}
      </div>
    )}
  </header>
);

export default PageHeader;
