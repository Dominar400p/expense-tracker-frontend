import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Transactions from "./pages/Transactions";
import ExpenseDetails from "./pages/ExpenseDetails";
import EditExpense from "./pages/EditExpense";

import LedgerDashboard from "./pages/LedgerDashboard";
import AddBorrower from "./pages/AddBorrower";
import LedgerDetails from "./pages/LedgerDetails";

import AddIncome from "./pages/AddIncome";
import IncomeHistory from "./pages/IncomeHistory";
import MonthlyBalance from "./components/MonthlyBalance";

import MonthlyChart from "./components/MonthlyChart";
import CategoryChart from "./components/CategoryChart";
import Login from "./components/Login";
import Register from "./components/Register";

import PrivateRoute from "./components/PrivateRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Expense */}
        <Route
          path="/add-expense"
          element={
            <PrivateRoute>
              <AddExpense />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />

        <Route
          path="/expense/:id"
          element={
            <PrivateRoute>
              <ExpenseDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-expense/:id"
          element={
            <PrivateRoute>
              <EditExpense />
            </PrivateRoute>
          }
        />

        {/* Income */}
        <Route
          path="/add-income"
          element={
            <PrivateRoute>
              <AddIncome />
            </PrivateRoute>
          }
        />

        <Route
          path="/income-history"
          element={
            <PrivateRoute>
              <IncomeHistory />
            </PrivateRoute>
          }
        />

        {/* Monthly Balance */}
        <Route
          path="/monthly-balance"
          element={
            <PrivateRoute>
              <MonthlyBalance />
            </PrivateRoute>
          }
        />

        {/* Charts */}
        <Route
          path="/monthly-chart"
          element={
            <PrivateRoute>
              <MonthlyChart />
            </PrivateRoute>
          }
        />

        <Route
          path="/category-chart"
          element={
            <PrivateRoute>
              <CategoryChart />
            </PrivateRoute>
          }
        />

        {/* Ledger */}

        <Route
          path="/ledger"
          element={
            <PrivateRoute>
              <LedgerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-borrower"
          element={
            <PrivateRoute>
              <AddBorrower />
            </PrivateRoute>
          }
        />

        <Route
          path="/ledger/:borrowerId"
          element={
            <PrivateRoute>
              <LedgerDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
