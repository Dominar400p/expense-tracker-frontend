import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { toast } from "react-toastify";

function AddExpense() {
  const today = new Date().toISOString().split("T")[0];

  const now = new Date();
  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  const defaultCategories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Medical",
    "Entertainment",
    "Education",
    "Fuel",
  ];

  const paymentMethods = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
  ];

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    merchant: "",
    payment_method: "",
    date: today,
    time: currentTime,
  });

  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("expenseCategories")) || [];
    setCategories([...defaultCategories, ...saved]);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.amount || form.amount <= 0)
      return "Enter valid amount";

    if (!form.category)
      return "Select category";

    if (!form.payment_method)
      return "Select payment method";

    if (!form.date)
      return "Select date";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errMsg = validate();

    if (errMsg) {
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    let finalCategory = form.category;

    if (form.category === "Other") {
      finalCategory = customCategory.trim();

      if (!finalCategory) {
        toast.error("Enter custom category");
        setLoading(false);
        return;
      }

      const saved =
        JSON.parse(localStorage.getItem("expenseCategories")) || [];

      const exists = saved.some(
        (c) => c.toLowerCase() === finalCategory.toLowerCase()
      );

      if (!exists) {
        saved.push(finalCategory);
        localStorage.setItem(
          "expenseCategories",
          JSON.stringify(saved)
        );
        setCategories([...defaultCategories, ...saved]);
      }
    }

    try {
      await api.post("/addExpense", {
        amount: Number(form.amount),
        category: finalCategory,
        date: form.date,
        description: form.description,
        merchant: form.merchant,
        payment_method: form.payment_method,
        time: form.time,
      });

      toast.success("Expense added successfully!");

      setForm({
        amount: "",
        category: "",
        description: "",
        merchant: "",
        payment_method: "",
        date: today,
        time: currentTime,
      });

      setCustomCategory("");

    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to add expense"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-12">

            <h2 className="fw-bold mb-4">
              <i className="bi bi-plus-circle me-2"></i>
              Add Expense
            </h2>

            <div className="card shadow-sm">
              <div className="card-body">

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label className="form-label">
                      Amount
                    </label>

                    <input
                      type="number"
                      name="amount"
                      className="form-control"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Category
                    </label>

                    <select
                      name="category"
                      className="form-select"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map((cat, i) => (
                        <option key={i}>{cat}</option>
                      ))}

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {form.category === "Other" && (
                    <div className="mb-3">
                      <input
                        className="form-control"
                        placeholder="Custom category"
                        value={customCategory}
                        onChange={(e) =>
                          setCustomCategory(e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <input
                      name="description"
                      className="form-control"
                      placeholder="Description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      name="merchant"
                      className="form-control"
                      placeholder="Merchant"
                      value={form.merchant}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <select
                      name="payment_method"
                      className="form-select"
                      value={form.payment_method}
                      onChange={handleChange}
                    >
                      <option value="">
                        Payment Method
                      </option>

                      {paymentMethods.map((p, i) => (
                        <option key={i}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">

                    <div className="col-md-6 mb-3">
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={form.date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <input
                        type="time"
                        name="time"
                        className="form-control"
                        value={form.time}
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  <button
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      "Add Expense"
                    )}
                  </button>

                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AddExpense;