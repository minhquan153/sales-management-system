import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Sales system</p>
          <h1>SaleFlow</h1>
        </div>

        <nav>
          <NavLink to="/">Dashboard</NavLink>
        </nav>

        <div className="sidebar-user">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
