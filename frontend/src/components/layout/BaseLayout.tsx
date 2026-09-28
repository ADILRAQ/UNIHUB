import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import Sidebar from './Sidebar';

/** True when the navigation should read as "going back" (browser back, or a back-link). */
const isBackNavigation = (state: unknown, navType: string) =>
  navType === 'POP' || Boolean((state as { back?: boolean } | null)?.back);

const BaseLayout = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const back = isBackNavigation(location.state, navType);

  return (
    <div className="app-shell">
      <div className="app-body">
        <Sidebar />
        {/* Keyed by path so every route change replays the enter motion (slides in from the side you came from). */}
        <main key={location.pathname} className={`main-content ${back ? 'page-enter--back' : 'page-enter'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
