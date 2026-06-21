import { Link, useNavigate } from "react-router-dom";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-primary fixed-top">
      <div className="container-fluid">

        {/* Left: Menu button + Brand */}
        <div className="d-flex align-items-center gap-2">

          <button
            className="btn btn-primary d-md-none"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list fs-3"></i>
          </button>

          <Link className="navbar-brand fw-bold" to="/">
            Expense Tracker
          </Link>

        </div>

        {/* Right: User + Logout */}
        <div className="d-flex align-items-center gap-3">

          {user && (
            <span className="text-white fw-semibold">
              👤 {user.name}
            </span>
          )}

          <button
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;