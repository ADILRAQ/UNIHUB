import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const BaseLayout = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content page-enter">
        <Outlet />
      </main>
    </div>
  );
};

export default BaseLayout;
