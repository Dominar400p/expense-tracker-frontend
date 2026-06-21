import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "../components/Layout";
import IncomeTable from "../components/IncomeTable";
import api from "../services/api";

function IncomeHistory() {
  const [income, setIncome] = useState([]);
  const [allIncome, setAllIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchIncome();
  }, []);

  // Fetch Income
  const fetchIncome = async () => {
    try {
      setLoading(true);

      const res = await api.get("/getIncome");

      setIncome(res.data);
      setAllIncome(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Apply Filters
  useEffect(() => {
    let filtered = [...allIncome];

    // Search
    if (search.trim()) {
      const keyword = search.toLowerCase();

      filtered = filtered.filter(
        (item) =>
          item.source?.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword),
      );
    }

    // Source Filter
    if (sourceFilter) {
      filtered = filtered.filter((item) => item.source === sourceFilter);
    }

    // From Date
    if (fromDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(fromDate),
      );
    }

    // To Date
    if (toDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(toDate),
      );
    }

    setIncome(filtered);
  }, [search, sourceFilter, fromDate, toDate, allIncome]);

  // Reset Filters
  const resetFilters = () => {
    setSearch("");
    setSourceFilter("");
    setFromDate("");
    setToDate("");
  };

  // Delete Income
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income?")) return;

    try {
      await api.delete(`/deleteIncome/${id}`);

      const updated = allIncome.filter((item) => item._id !== id);

      setAllIncome(updated);
      setIncome(updated);
    } catch (err) {
      console.log(err);
    }
  };

  // Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <div className="spinner-border text-success"></div>
        </div>
      </Layout>
    );
  }

  // Unique Sources
  const sources = [...new Set(allIncome.map((item) => item.source))];

  return (
    <Layout>
      <div className="container-fluid">
        {/* Header */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h2 className="mb-0">
            <i className="bi bi-bank me-2"></i>
            Income History
          </h2>

          <Link to="/add-income" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>
            Add Income
          </Link>
        </div>

        {/* Filters */}

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-funnel-fill me-2"></i>
              Search & Filters
            </h5>
          </div>

          <div className="card-body">
            <div className="row g-3">
              {/* Search */}

              <div className="col-lg-5">
                <label className="form-label">Search</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Source or Description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Source */}

              <div className="col-lg-3">
                <label className="form-label">Source</label>

                <select
                  className="form-select"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="">All</option>

                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Date */}

              <div className="col-lg-2">
                <label className="form-label">From</label>

                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              {/* To Date */}

              <div className="col-lg-2">
                <label className="form-label">To</label>

                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3">
              <button className="btn btn-secondary" onClick={resetFilters}>
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Income Count */}

        <div className="mb-3 text-muted">
          Showing <strong>{income.length}</strong> of{" "}
          <strong>{allIncome.length}</strong> income record(s)
        </div>

        {/* Income Table */}

        <IncomeTable
          income={income}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />
      </div>
    </Layout>
  );
}

export default IncomeHistory;
