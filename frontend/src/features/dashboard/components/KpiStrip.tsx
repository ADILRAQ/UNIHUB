import { Link } from 'react-router-dom';
import type { KpiDef, KpiIcon } from '../types';

const ICON_PATHS: Record<KpiIcon, string[]> = {
  calendar: ['M3 5.5h18v15.5H3z', 'M3 10h18M8 3v4M16 3v4'],
  assignment: ['M9 4h6v3H9z', 'M8 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-2', 'M9 13l2 2 4-4'],
  megaphone: ['M3.5 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2h2.1L13 19V5l-6.2 4H4.7a1.2 1.2 0 0 0-1.2 1.2Z', 'M17.5 8.6a4.6 4.6 0 0 1 0 6.8'],
  alert: ['M12 3 2.5 20h19z', 'M12 10v4M12 17v.5'],
  people: ['M16 19.5V18a4 4 0 0 0-4-4H6.5a4 4 0 0 0-4 4v1.5', 'M9.2 3.6a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z', 'M17.5 13.6a4 4 0 0 1 3 3.9v2'],
};

/** Design-system StatStrip: key numbers in a cream strip, each a link to where you act on it. */
const KpiStrip = ({ kpis }: { kpis: KpiDef[] }) => (
  <nav className="kpi-strip" aria-label="Key numbers">
    {kpis.map((kpi) => (
      <Link key={kpi.key} to={kpi.to} className={`kpi${kpi.alert ? ' kpi--alert' : ''}`}>
        <span className="kpi__value">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICON_PATHS[kpi.icon].map((d) => <path key={d} d={d} />)}
          </svg>
          {kpi.value === null ? (
            <span className="kpi__placeholder skeleton" aria-label="Loading" />
          ) : kpi.value === 'error' ? (
            <span title="Couldn't load this number" aria-label="Unavailable">—</span>
          ) : (
            kpi.value
          )}
        </span>
        <span className="kpi__label">{kpi.label}</span>
      </Link>
    ))}
  </nav>
);

export default KpiStrip;
