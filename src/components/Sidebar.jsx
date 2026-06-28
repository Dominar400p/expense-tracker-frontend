import { Link, useLocation } from "react-router-dom";

function Sidebar({ showSidebar, closeSidebar, isDesktop }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {showSidebar && !isDesktop && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 998 }}
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className="bg-light border-end p-3"
        style={{
          width: "250px",
          position: "fixed",
          top: "56px",
          left: showSidebar ? "0" : "-250px",
          height: "calc(100vh - 56px)",
          transition: "left .3s ease",
          zIndex: 999,
          overflowY: "auto",
          backgroundColor: "white",
        }}
      >
        <h4 className="mb-4">Menu</h4>

        <div className="list-group">
          {/* Dashboard */}
          <Link
            to="/"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            <i className="bi bi-house me-2"></i>
            Dashboard
          </Link>

          {/* Add Expense */}
          <Link
            to="/add-expense"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/add-expense" ? "active" : ""
            }`}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Expense
          </Link>

          {/* Transactions */}
          <Link
            to="/transactions"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/transactions" ? "active" : ""
            }`}
          >
            <i className="bi bi-wallet2 me-2"></i>
            Transactions
          </Link>

          {/* Add Income */}
          <Link
            to="/add-income"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/add-income" ? "active" : ""
            }`}
          >
            <i className="bi bi-cash-coin me-2"></i>
            Add Income
          </Link>

          {/* Income History */}
          <Link
            to="/income-history"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/income-history" ? "active" : ""
            }`}
          >
            <i className="bi bi-bank me-2"></i>
            Income History
          </Link>

          {/* Loan Tracker
          <Link
            to="/loans"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/loans" ? "active" : ""
            }`}
          >
            <i className="bi bi-cash-stack me-2"></i>
            Loan Tracker
          </Link> */}

          {/* Ledger */}

          <Link
            to="/ledger"
            onClick={closeSidebar}
            className={`list-group-item list-group-item-action ${
              location.pathname === "/ledger" ? "active" : ""
            }`}
          >
            <i className="bi bi-journal-bookmark me-2"></i>
            Ledger
          </Link>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
