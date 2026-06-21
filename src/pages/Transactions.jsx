import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import Layout from "../components/Layout";
import ExpenseCard from "../components/ExpenseCard";
import CategoryChart from "../components/CategoryChart";
import api from "../services/api";

function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchParams] = useSearchParams();

  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const category = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState(category || "");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(category || "");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, [month, year, category]);

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const res = await api.get("/getExpenses");

      let data = res.data;

      // Month & Year Filter
      if (month && year) {
        data = data.filter(
          (item) => item.month === month && Number(item.year) === Number(year),
        );
      }

      // Category from Dashboard
      if (category) {
        data = data.filter((item) => item.category === category);
      }

      setAllExpenses(data);
      setExpenses(data);

      setSelectedCategory(category || "");
      setCategoryFilter(category || "");
    } catch (err) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Unable to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  // Apply Filters
  const applyFilters = () => {
    let filtered = [...allExpenses];

    // Search
    if (search.trim()) {
      const keyword = search.toLowerCase();

      filtered = filtered.filter(
        (expense) =>
          expense.merchant?.toLowerCase().includes(keyword) ||
          expense.description?.toLowerCase().includes(keyword),
      );
    }

    // Category
    if (categoryFilter) {
      filtered = filtered.filter(
        (expense) => expense.category === categoryFilter,
      );
    }

    // Payment
    if (paymentFilter) {
      filtered = filtered.filter(
        (expense) => expense.payment_method === paymentFilter,
      );
    }

    // From Date
    if (fromDate) {
      filtered = filtered.filter(
        (expense) => new Date(expense.date) >= new Date(fromDate),
      );
    }

    // To Date
    if (toDate) {
      filtered = filtered.filter(
        (expense) => new Date(expense.date) <= new Date(toDate),
      );
    }

    setExpenses(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [search, categoryFilter, paymentFilter, fromDate, toDate, allExpenses]);

  // Category Chart Click
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setCategoryFilter(categoryName);
  };

  // Reset Filters
  const resetFilters = () => {
    setSearch("");
    setPaymentFilter("");
    setFromDate("");
    setToDate("");

    if (category) {
      setCategoryFilter(category);
      setSelectedCategory(category);
    } else {
      setCategoryFilter("");
      setSelectedCategory("");
    }
  };

  // Delete Expense
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    setDeleting(true);
    setDeletingId(id);

    try {
      await api.delete(`/deleteExpense/${id}`);

      const updatedExpenses = expenses.filter((item) => item._id !== id);

      const updatedAllExpenses = allExpenses.filter((item) => item._id !== id);

      setExpenses(updatedExpenses);
      setAllExpenses(updatedAllExpenses);

      toast.success("Expense deleted successfully");
    } catch (err) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Unable to delete expense");
    } finally {
      setDeleting(false);
      setDeletingId(null);
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
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Unique Categories
  const categories = [...new Set(allExpenses.map((e) => e.category))];

  // Unique Payment Methods
  const paymentMethods = [...new Set(allExpenses.map((e) => e.payment_method))];

  // Total Amount
  const totalAmount = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  return (
    <Layout>
      <div className="container-fluid">
        {/* Header */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h2 className="mb-0">
            <i className="bi bi-wallet2 me-2"></i>
            Transactions
          </h2>

          <Link to="/add-expense" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add Expense
          </Link>
        </div>

        {/* Category Chart */}

        {month && year && (
          <div className="mb-4">
            <CategoryChart month={month} year={year} />
          </div>
        )}

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

              <div className="col-lg-4 col-md-6">
                <label className="form-label">Search</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Merchant or Description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category */}

              <div className="col-lg-2 col-md-6">
                <label className="form-label">Category</label>

                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All</option>

                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment */}

              <div className="col-lg-2 col-md-6">
                <label className="form-label">Payment</label>

                <select
                  className="form-select"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="">All</option>

                  {paymentMethods.map((payment) => (
                    <option key={payment} value={payment}>
                      {payment}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Date */}

              <div className="col-lg-2 col-md-6">
                <label className="form-label">From</label>

                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              {/* To Date */}

              <div className="col-lg-2 col-md-6">
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

        {/* Selected Category */}

        {selectedCategory && (
          <div className="alert alert-primary">
            Showing transactions for
            <strong> {selectedCategory}</strong>
          </div>
        )}

        {/* Summary */}

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="text-muted">
              Showing <strong>{expenses.length}</strong> of{" "}
              <strong>{allExpenses.length}</strong> transaction(s)
            </div>
          </div>

          <div className="col-md-6 text-md-end mt-2 mt-md-0">
            <h5 className="mb-0">
              Total Spent :
              <span className="text-danger ms-2">
                ₹{totalAmount.toLocaleString()}
              </span>
            </h5>
          </div>
        </div>

        {/* Expense Table */}

        <ExpenseCard
          expenses={expenses}
          handleDelete={handleDelete}
          formatDate={formatDate}
          deleting={deleting}
          deletingId={deletingId}
        />

        {/* Empty State */}

        {expenses.length === 0 && (
          <div className="alert alert-warning text-center mt-4">
            <i className="bi bi-search me-2"></i>
            No transactions found matching your filters.
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Transactions;
