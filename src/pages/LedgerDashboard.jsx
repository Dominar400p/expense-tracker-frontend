import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../services/api";

import { toast } from "react-toastify";

function LedgerDashboard() {
  const navigate = useNavigate();

  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/getBorrowers");

      setBorrowers(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to load borrowers.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrowers = borrowers.filter((borrower) =>
    borrower.personName?.toLowerCase().includes(search.toLowerCase()),
  );

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
          <h2 className="mb-0">Ledger Dashboard</h2>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-borrower")}
          >
            <i className="bi bi-person-plus me-2"></i>
            Add Borrower
          </button>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-search me-2"></i>
              Search Borrower
            </h5>
          </div>

          <div className="card-body">
            <input
              type="text"
              className="form-control"
              placeholder="Search Thaneesh, Sreenu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3 text-muted">
          Showing <strong>{filteredBorrowers.length}</strong> of{" "}
          <strong>{borrowers.length}</strong> borrower(s)
        </div>

        {filteredBorrowers.length === 0 ? (
          <div className="alert alert-info">No borrowers found.</div>
        ) : (
          filteredBorrowers.map((borrower) => (
            <div
              key={borrower._id}
              className="card shadow-sm mb-3"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/ledger/${borrower._id}`)}
            >
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <h5>{borrower.personName}</h5>

                    <p className="mb-1">
                      <strong>Mobile:</strong> {borrower.mobile || "-"}
                    </p>

                    <p className="mb-1">
                      <strong>Total Given:</strong> ₹
                      {Number(borrower.totalGiven || 0).toLocaleString()}
                    </p>

                    <p className="mb-1">
                      <strong>Total Received:</strong> ₹
                      {Number(borrower.totalReceived || 0).toLocaleString()}
                    </p>

                    <p className="mb-1">
                      <strong>Balance:</strong> ₹
                      {Number(borrower.balance || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-md-end">
                    <span
                      className={`badge ${
                        borrower.status === "Completed"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {borrower.status}
                    </span>

                    <div className="mt-3 text-primary fw-bold">
                      View Ledger →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default LedgerDashboard;
