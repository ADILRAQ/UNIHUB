import useTabIndicator from '../../hooks/useTabIndicator';

export interface TabItem<K extends string> {
  key: K;
  label: string;
  /** Optional count shown after the label. */
  count?: number;
}

interface TabsProps<K extends string> {
  tabs: TabItem<K>[];
  active: K;
  onSelect: (key: K) => void;
  /** Accessible name for the tab list, e.g. "People sections". */
  label: string;
}

/**
 * Shared tab bar — selected tab uses the active-nav treatment (orange-100 fill,
 * orange-700 text). The fill is one indicator that slides between tabs.
 */
const Tabs = <K extends string>({ tabs, active, onSelect, label }: TabsProps<K>) => {
  const { listRef, indicator } = useTabIndicator(active);
  return (
  <div ref={listRef} className={`tabs${indicator ? ' tabs--sliding' : ''}`} role="tablist" aria-label={label}>
    {indicator && <span className="tabs__indicator" style={indicator} aria-hidden="true" />}
    {tabs.map((tab) => {
      const selected = tab.key === active;
      return (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={selected}
          className={`tab${selected ? ' tab--active' : ''}`}
          onClick={() => onSelect(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && <span className="tab__count">{tab.count}</span>}
        </button>
      );
    })}
  </div>
  );
};

export default Tabs;
