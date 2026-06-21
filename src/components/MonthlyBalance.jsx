import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Layout from "../components/Layout";
import ExpenseCard from "../components/ExpenseCard";
import IncomeTable from "../components/IncomeTable";
import api from "../services/api";

function MonthlyBalance() {
  const [searchParams] = useSearchParams();

  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const [balance, setBalance] = useState(null);

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [showIncome, setShowIncome] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const balanceRes = await api.get(`/monthlyBalance/${month}/${year}`);

      setBalance(balanceRes.data);

      const incomeRes = await api.get("/getIncome");

      const filteredIncome = incomeRes.data.filter(
        (item) => item.month === month && Number(item.year) === Number(year),
      );

      setIncome(filteredIncome);

      const expenseRes = await api.get("/getExpenses");

      const filteredExpenses = expenseRes.data.filter(
        (item) => item.month === month && Number(item.year) === Number(year),
      );

      setExpenses(filteredExpenses);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Delete this income?")) return;

    try {
      await api.delete(`/deleteIncome/${id}`);

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await api.delete(`/deleteExpense/${id}`);

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2>
            <i className="bi bi-wallet2 me-2"></i>
            {month} {year} Balance
          </h2>
        </div>

        {/* Summary Cards */}

        <div className="row">
          {/* Income */}

          <div className="col-lg-4 mb-3">
            <div
              className="card shadow h-100"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowIncome(!showIncome);
                setShowExpenses(false);
              }}
            >
              <div className="card-body text-center">
                <h5>Income</h5>

                <h2 className="text-success">
                  ₹{balance.income.toLocaleString()}
                </h2>

                <small className="text-muted">
                  Click to view income records
                </small>
              </div>
            </div>
          </div>

          {/* Expense */}

          <div className="col-lg-4 mb-3">
            <div
              className="card shadow h-100"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowExpenses(!showExpenses);
                setShowIncome(false);
              }}
            >
              <div className="card-body text-center">
                <h5>Expenses</h5>

                <h2 className="text-danger">
                  ₹{balance.expense.toLocaleString()}
                </h2>

                <small className="text-muted">
                  Click to view expense transactions
                </small>
              </div>
            </div>
          </div>

          {/* Remaining */}

          <div className="col-lg-4 mb-3">
            <div className="card shadow h-100">
              <div className="card-body text-center">
                <h5>Remaining Balance</h5>

                <h2
                  className={
                    balance.remaining >= 0 ? "text-primary" : "text-danger"
                  }
                >
                  ₹{balance.remaining.toLocaleString()}
                </h2>

                <small className="text-muted">Income − Expenses</small>
              </div>
            </div>
          </div>
        </div>

        {/* Income Table */}

        {showIncome && (
          <>
            <div className="mt-4 mb-3">
              <h4>
                <i className="bi bi-bank me-2"></i>
                Income Records
              </h4>
            </div>

            <IncomeTable
              income={income}
              handleDelete={handleDeleteIncome}
              formatDate={formatDate}
            />
          </>
        )}

        {/* Expense Table */}

        {showExpenses && (
          <>
            <div className="mt-4 mb-3">
              <h4>
                <i className="bi bi-receipt me-2"></i>
                Expense Transactions
              </h4>
            </div>

            <ExpenseCard
              expenses={expenses}
              handleDelete={handleDeleteExpense}
              formatDate={formatDate}
            />
          </>
        )}
      </div>
    </Layout>
  );
}

export default MonthlyBalance;
