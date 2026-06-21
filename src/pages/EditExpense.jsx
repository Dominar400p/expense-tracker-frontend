import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

function EditExpense() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [expense, setExpense] = useState({
    amount: "",

    category: "",

    customCategory: "",

    merchant: "",

    payment_method: "",

    description: "",

    date: "",

    time: "",
  });

  useEffect(() => {
    fetchExpense();
  }, []);

  const fetchExpense = async () => {
    try {
      const res = await api.get(`/getSingleExpense/${id}`);

      const data = res.data;

      setExpense({
        amount: data.amount,

        category: data.category,

        customCategory: "",

        merchant: data.merchant,

        payment_method: data.payment_method,

        description: data.description,

        date: data.date,

        time: data.time,
      });
    } catch (err) {
      console.log(err);

      alert("Unable to fetch expense.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>

          <p className="mt-3">Loading Expense...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">
              <i className="bi bi-pencil-square me-2"></i>
              Edit Expense
            </h3>
          </div>

          <div className="card-body">
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (
                  !expense.amount ||
                  !expense.category ||
                  !expense.merchant ||
                  !expense.payment_method ||
                  !expense.date ||
                  !expense.time
                ) {
                  alert("Please fill all required fields.");
                  return;
                }

                setSaving(true);

                try {
                  await api.put(`/updateExpense/${id}`, {
                    amount: Number(expense.amount),

                    category:
                      expense.category === "Other"
                        ? expense.customCategory
                        : expense.category,

                    merchant: expense.merchant,

                    payment_method: expense.payment_method,

                    description: expense.description,

                    date: expense.date,

                    time: expense.time,
                  });

                  alert("Expense Updated Successfully");

                  navigate("/transactions");
                } catch (err) {
                  console.log(err);

                  alert("Unable to update expense.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="row">
                {/* Amount */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Amount</label>

                  <input
                    type="number"
                    className="form-control"
                    value={expense.amount}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Category */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>

                  <select
                    className="form-select"
                    value={expense.category}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="">Select</option>

                    <option>Food</option>

                    <option>Travel</option>

                    <option>Shopping</option>

                    <option>Medical</option>

                    <option>Bills</option>

                    <option>Entertainment</option>

                    <option>Education</option>

                    <option>Fuel</option>

                    <option>Other</option>
                  </select>
                </div>

                {expense.category === "Other" && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Enter Category</label>

                    <input
                      className="form-control"
                      value={expense.customCategory}
                      onChange={(e) =>
                        setExpense({
                          ...expense,
                          customCategory: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {/* Merchant */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Merchant</label>

                  <input
                    className="form-control"
                    value={expense.merchant}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        merchant: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Payment */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Payment Method</label>

                  <select
                    className="form-select"
                    value={expense.payment_method}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="">Select</option>

                    <option>Cash</option>

                    <option>UPI</option>

                    <option>Credit Card</option>

                    <option>Debit Card</option>

                    <option>Net Banking</option>
                  </select>
                </div>

                {/* Date */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Date</label>

                  <input
                    type="date"
                    className="form-control"
                    value={expense.date}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Time */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Time</label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="08:45 AM"
                    value={expense.time}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        time: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Description */}

                <div className="col-12 mb-4">
                  <label className="form-label">Description</label>

                  <textarea
                    rows="3"
                    className="form-control"
                    value={expense.description}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="text-center">
                <button className="btn btn-success px-5" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Update Expense
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EditExpense;
