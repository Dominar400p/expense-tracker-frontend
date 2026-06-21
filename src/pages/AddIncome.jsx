import { useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { toast } from "react-toastify";

function AddIncome() {
  const today = new Date().toISOString().split("T")[0];

  const incomeSources = [
    "Salary",
    "Business",
    "Freelancing",
    "Bonus",
    "Interest",
    "Cash Deposit",
    "Gift",
    "Other",
  ];

  const [form, setForm] = useState({
    amount: "",
    source: "",
    description: "",
    date: today,
  });

  const [customSource, setCustomSource] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter valid amount.");
      return false;
    }

    if (!form.source) {
      toast.error("Select income source.");
      return false;
    }

    if (!form.date) {
      toast.error("Select date.");
      return false;
    }

    if (form.source === "Other" && !customSource.trim()) {
      toast.error("Enter custom income source.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        ...form,
        source:
          form.source === "Other"
            ? customSource.trim()
            : form.source,
      };

      await api.post("/addIncome", payload);

      toast.success("Income added successfully!");

      setForm({
        amount: "",
        source: "",
        description: "",
        date: today,
      });

      setCustomSource("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Unable to add income."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card shadow">
              <div className="card-header bg-success text-white">
                <h3 className="mb-0">
                  <i className="bi bi-cash-stack me-2"></i>
                  Add Income
                </h3>
              </div>

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
                      Income Source
                    </label>

                    <select
                      name="source"
                      className="form-select"
                      value={form.source}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Source
                      </option>

                      {incomeSources.map((source) => (
                        <option
                          key={source}
                          value={source}
                        >
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.source === "Other" && (
                    <div className="mb-3">
                      <label className="form-label">
                        Custom Source
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={customSource}
                        onChange={(e) =>
                          setCustomSource(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      Description
                    </label>

                    <textarea
                      rows="3"
                      name="description"
                      className="form-control"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Date
                    </label>

                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    className="btn btn-success w-100"
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
                      "Add Income"
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

export default AddIncome;