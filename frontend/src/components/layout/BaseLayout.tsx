import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const BaseLayout = () => (
  <div className="app-shell">
    <Navbar />
    <div className="app-body">
      <Sidebar />
      <main className="main-content page-enter">
        <Outlet />
      </main>
    </div>
  </div>
);

export default BaseLayout;
