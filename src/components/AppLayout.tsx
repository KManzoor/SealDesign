import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getVisibleMenuItems } from '../services/accessService';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, accessMap, logout } = useAuth();
  const navigate = useNavigate();
  const menuItems = getVisibleMenuItems(user, accessMap);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Seal Design</h2>
        <div className="sub">Role-based configuration system</div>
        <div className="sub">
          <strong>{user?.first_name} {user?.last_name}</strong>
          <br />
          {user?.role?.name}
        </div>
        <nav className="nav-list">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: '18px' }}>
          <button
            className="secondary-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="main-area">
        <div className="topbar">
          <div>
            <h1 style={{ margin: 0 }}>Future Seal Design Portal</h1>
            <div className="muted">Supabase auth, role access, and seal code generation</div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
