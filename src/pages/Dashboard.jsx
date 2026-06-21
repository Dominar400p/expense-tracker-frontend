import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../services/api";

import MonthlyChart from "../components/MonthlyChart";
import CategoryChart from "../components/CategoryChart";

import { toast } from "react-toastify";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [balance, setBalance] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchDashboard(), fetchBalance()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDashboard(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load dashboard.");
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get("/overallBalance");
      setBalance(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load balance.");
    }
  };

  const savingsPercentage = () => {
    if (!balance || balance.income === 0) return 0;

    return ((balance.remaining / balance.income) * 100).toFixed(1);
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
        {/* HEADER */}
        <div className="row mb-4">
          <div className="col">
            <h2>Dashboard</h2>
          </div>
        </div>

        {/* CARDS */}
        <div className="row">
          <Card title="Total Income" value={balance?.income} color="success" />

          <Card title="Total Expense" value={balance?.expense} color="danger" />

          <Card title="Remaining" value={balance?.remaining} color="primary" />

          <Card
            title="This Month Expense"
            value={dashboard?.thisMonthExpense}
            color="warning"
          />

          <Card title="Transactions" value={dashboard?.totalTransactions} />

          <Card title="Highest Category" value={dashboard?.highestCategory} />

          <Card title="Savings %" value={savingsPercentage() + "%"} />

          <Card title="Salary" value={balance?.salary} color="info" />

          <Card
            title="Salary Remaining"
            value={balance?.salaryRemaining}
            color="dark"
          />
        </div>

        {/* CHART */}
        <div className="mt-4">
          <MonthlyChart
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
          />
        </div>

        {/* Monthly Drill Down */}

        {selectedMonth && selectedYear && (
          <MonthlyBalanceCard month={selectedMonth} year={selectedYear} />
        )}

        {selectedMonth && selectedYear && (
          <CategoryChart month={selectedMonth} year={selectedYear} />
        )}
      </div>
    </Layout>
  );
}

/* =========================
   REUSABLE CARD
========================= */

function Card({ title, value, color }) {
  return (
    <div className="col-xl-3 col-md-6 mb-3">
      <div className={`card border-${color || "secondary"} shadow h-100`}>
        <div className="card-body">
          <h6>{title}</h6>

          <h3>₹{value?.toLocaleString?.() || value || 0}</h3>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MONTHLY DRILL DOWN CARD
========================= */

function MonthlyBalanceCard({ month, year }) {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await api.get(`/monthlyBalance/${month}/${year}`);

      setData(res.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to load monthly balance.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-4">
      <div className="row">
        {/* Income */}

        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body text-center">
              <h5>Income</h5>
              <h3>₹{data.income}</h3>
            </div>
          </div>
        </div>

        {/* Expense */}

        <div className="col-md-4">
          <div
            className="card border-danger"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/transactions?month=${month}&year=${year}`)
            }
          >
            <div className="card-body text-center">
              <h5>Expense</h5>

              <h3>₹{data.expense}</h3>

              <small>Click to view transactions</small>
            </div>
          </div>
        </div>

        {/* Remaining */}

        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body text-center">
              <h5>Remaining</h5>

              <h3>₹{data.remaining}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}

      <div className="mt-3">
        <h5>Expense Breakdown</h5>

        {data.transactions?.length > 0 ? (
          data.transactions.map((t, i) => (
            <div key={i} className="border p-2 mb-2 rounded">
              <strong>{t.category}</strong>
              {" - "}₹{t.amount}
            </div>
          ))
        ) : (
          <div className="text-muted">No transactions available.</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
