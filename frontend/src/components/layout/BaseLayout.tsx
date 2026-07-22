import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const BaseLayout = () => {
  return (
    <div className="base-layout">
      <Navbar />
      <div className="base-layout__body">
        <Sidebar />
        <main className="base-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
