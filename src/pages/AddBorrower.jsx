import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../services/api";

import { toast } from "react-toastify";

function AddBorrower() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    personName: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.personName.trim()) {
      toast.error("Enter person name");
      return;
    }

    try {
      setLoading(true);

      await api.post("/addBorrower", {
        personName: form.personName.trim(),
        mobile: form.mobile.trim(),
      });

      toast.success("Borrower Added Successfully");

      navigate("/ledger");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to add borrower.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Add Borrower</h3>
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

                  <div className="mb-4">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-control"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Borrower"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/ledger")}
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

export default AddBorrower;
