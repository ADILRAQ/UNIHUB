import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * Measures the selected tab inside `listRef` so a single indicator can slide
 * between tabs. Re-measures when the active key changes or the list resizes
 * (wrapping, counts loading in). Returns null until the first measurement.
 */
const useTabIndicator = (activeKey: string) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return setIndicator(null);
      setIndicator({
        width: tab.offsetWidth,
        height: tab.offsetHeight,
        transform: `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeKey]);

  return { listRef, indicator };
};

export default useTabIndicator;
