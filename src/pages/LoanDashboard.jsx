import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function LoanDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchDashboard(), fetchLoans()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/loanDashboard");
      setDashboard(res.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to load loan dashboard."
      );
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await api.get("/getLoans");

      const loansWithLatestStatus = await Promise.all(
        res.data.map(async (loan) => {
          try {
            const detailsRes = await api.get(`/loanDetails/${loan._id}`);

            return {
              ...loan,
              status: detailsRes.data.status,
              totalRepaid: detailsRes.data.totalRepaid,
              remaining: detailsRes.data.remaining,
            };
          } catch {
            return loan;
          }
        })
      );

      setLoans(loansWithLatestStatus);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to load loans.");
    }
  };

  const filteredLoans = loans
    .filter((loan) => {
      const matchesSearch = loan.personName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = statusFilter ? loan.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.loanDate) - new Date(a.loanDate);
      }

      if (sortBy === "oldest") {
        return new Date(a.loanDate) - new Date(b.loanDate);
      }

      if (sortBy === "nameAsc") {
        return a.personName.localeCompare(b.personName);
      }

      if (sortBy === "nameDesc") {
        return b.personName.localeCompare(a.personName);
      }

      if (sortBy === "highestLoan") {
        return Number(b.loanAmount) - Number(a.loanAmount);
      }

      if (sortBy === "lowestLoan") {
        return Number(a.loanAmount) - Number(b.loanAmount);
      }

      return 0;
    });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSortBy("newest");
  };

  if (loading) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h2 className="mb-0">Loan Dashboard</h2>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-loan")}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Loan
          </button>
        </div>

        <div className="row">
          <Card
            title="Total Given"
            value={dashboard?.totalGiven}
            color="primary"
          />

          <Card
            title="Total Repaid"
            value={dashboard?.totalRepaid}
            color="success"
          />

          <Card title="Remaining" value={dashboard?.remaining} color="danger" />

          <Card
            title="Pending Loans"
            value={dashboard?.pendingLoans}
            color="warning"
          />

          <Card
            title="Completed Loans"
            value={dashboard?.completedLoans}
            color="info"
          />

          <Card
            title="Total Persons"
            value={dashboard?.totalPersons}
            color="dark"
          />
        </div>

        <div className="card shadow-sm mt-4 mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-funnel-fill me-2"></i>
              Search, Filter & Sort
            </h5>
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-lg-4 col-md-6">
                <label className="form-label">Search Person</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Thaneesh, Sreenu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-lg-3 col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6">
                <label className="form-label">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="nameAsc">Name A-Z</option>
                  <option value="nameDesc">Name Z-A</option>
                  <option value="highestLoan">Highest Loan</option>
                  <option value="lowestLoan">Lowest Loan</option>
                </select>
              </div>

              <div className="col-lg-2 col-md-6 d-flex align-items-end">
                <button
                  className="btn btn-secondary w-100"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4>People You've Given Money</h4>

          <div className="mb-3 text-muted">
            Showing <strong>{filteredLoans.length}</strong> of{" "}
            <strong>{loans.length}</strong> loan record(s)
          </div>

          {filteredLoans.length === 0 ? (
            <div className="alert alert-info mt-3">No loans found.</div>
          ) : (
            filteredLoans.map((loan) => (
              <div
                key={loan._id}
                className="card shadow-sm mb-3"
                style={{
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onClick={() => navigate(`/loan/${loan._id}`)}
              >
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <h5>{loan.personName}</h5>

                      <p className="mb-1">
                        <strong>Loan Amount:</strong> ₹
                        {Number(loan.loanAmount || 0).toLocaleString()}
                      </p>

                      <p className="mb-1">
                        <strong>Repaid:</strong> ₹
                        {Number(loan.totalRepaid || 0).toLocaleString()}
                      </p>

                      <p className="mb-1">
                        <strong>Remaining:</strong> ₹
                        {Number(loan.remaining || 0).toLocaleString()}
                      </p>

                      <p className="mb-1">
                        <strong>Mobile:</strong> {loan.mobile}
                      </p>

                      <p className="mb-1">
                        <strong>Date:</strong> {loan.loanDate}
                      </p>
                    </div>

                    <div className="text-md-end">
                      <span
                        className={`badge ${
                          loan.status === "Completed"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {loan.status}
                      </span>

                      <div className="mt-3 text-primary fw-bold">
                        View Details →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

function Card({ title, value, color }) {
  const isMoney = ![
    "Pending Loans",
    "Completed Loans",
    "Total Persons",
  ].includes(title);

  return (
    <div className="col-xl-4 col-md-6 mb-3">
      <div className={`card border-${color} shadow h-100`}>
        <div className="card-body">
          <h6>{title}</h6>

          <h3>
            {isMoney ? `₹${Number(value || 0).toLocaleString()}` : value || 0}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default LoanDashboard;