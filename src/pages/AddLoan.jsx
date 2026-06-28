import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../services/api";

import { toast } from "react-toastify";

function AddLoan() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    personName: "",
    mobile: "",
    loanAmount: "",
    loanDate: today,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.personName.trim()) return "Enter person name";
    if (!form.mobile.trim()) return "Enter mobile number";
    if (!form.loanAmount || Number(form.loanAmount) <= 0)
      return "Enter valid loan amount";
    if (!form.loanDate) return "Select loan date";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      await api.post("/addLoan", {
        personName: form.personName.trim(),
        mobile: form.mobile.trim(),
        loanAmount: Number(form.loanAmount),
        loanDate: form.loanDate,
      });

      toast.success("Loan Added Successfully");

      navigate("/loans");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to add loan.");
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
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">
                  <i className="bi bi-cash-stack me-2"></i>
                  Add Loan
                </h3>
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Person Name</label>
                    <input
                      type="text"
                      name="personName"
                      className="form-control"
                      value={form.personName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-control"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Loan Amount</label>
                    <input
                      type="number"
                      name="loanAmount"
                      className="form-control"
                      value={form.loanAmount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Loan Date</label>
                    <input
                      type="date"
                      name="loanDate"
                      className="form-control"
                      value={form.loanDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Add Loan"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/loans")}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AddLoan;