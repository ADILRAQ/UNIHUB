import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumb?: string;
  breadcrumbTo?: string;
  actions?: ReactNode;
}

/** Shared cream header bar: optional back-link, the page title, and the page's actions. */
const PageHeader = ({ title, subtitle, breadcrumb, breadcrumbTo, actions }: PageHeaderProps) => (
  <header className="page-bar">
    <div className="page-bar__titles">
      {breadcrumb && breadcrumbTo && (
        <Link to={breadcrumbTo} state={{ back: true }} className="page-bar__crumb">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {breadcrumb}
        </Link>
      )}
      <h1 className="page-bar__title">{title}</h1>
      {subtitle && <p className="page-bar__subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="page-bar__actions">{actions}</div>}
  </header>
);

export default PageHeader;
