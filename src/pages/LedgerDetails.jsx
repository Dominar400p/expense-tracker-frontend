import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Layout from "../components/Layout";
import api from "../services/api";
import { toast } from "react-toastify";

function LedgerDetails() {
  const { borrowerId } = useParams();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: "GIVEN",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "Loan Given",
  });

  const [saving, setSaving] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);

  const [editForm, setEditForm] = useState({
    type: "GIVEN",
    amount: "",
    date: "",
    description: "",
  });

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ledgerDetails/${borrowerId}`);
      setLedger(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to load ledger.");
    } finally {
      setLoading(false);
    }
  };

  const getFirstGivenDate = () => {
    const firstGiven = ledger?.entries?.find((entry) => entry.type === "GIVEN");
    return firstGiven?.date || "";
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;

    setForm({
      ...form,
      type,
      description: type === "GIVEN" ? "Loan Given" : "Repayment Received",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditTypeChange = (e) => {
    const type = e.target.value;

    setEditForm({
      ...editForm,
      type,
      description: type === "GIVEN" ? "Loan Given" : "Repayment Received",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const addLedgerEntry = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (!form.date) {
      toast.error("Select date");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/addLedgerEntry/${borrowerId}`, {
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
      });

      toast.success("Ledger Entry Added Successfully");

      setForm({
        type: "GIVEN",
        amount: "",
        date: getFirstGivenDate() || new Date().toISOString().split("T")[0],
        description: "Loan Given",
      });

      fetchLedger();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to add ledger entry."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (entry) => {
    setShowEdit(true);
    setEditingEntryId(entry._id);

    setEditForm({
      type: entry.type,
      amount: entry.given > 0 ? entry.given : entry.received,
      date: entry.date,
      description: entry.description,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setShowEdit(false);
    setEditingEntryId(null);

    setEditForm({
      type: "GIVEN",
      amount: "",
      date: "",
      description: "",
    });
  };

  const updateLedgerEntry = async (e) => {
    e.preventDefault();

    if (!editingEntryId) {
      toast.error("No entry selected");
      return;
    }

    if (!editForm.amount || Number(editForm.amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (!editForm.date) {
      toast.error("Select date");
      return;
    }

    try {
      setUpdating(true);

      await api.put(`/updateLedgerEntry/${editingEntryId}`, {
        type: editForm.type,
        amount: Number(editForm.amount),
        date: editForm.date,
        description: editForm.description,
      });

      toast.success("Ledger Entry Updated Successfully");

      cancelEdit();
      fetchLedger();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to update ledger entry."
      );
    } finally {
      setUpdating(false);
    }
  };

  const deleteLedgerEntry = async (entryId) => {
    const confirmDelete = window.confirm("Delete this ledger entry?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/deleteLedgerEntry/${entryId}`);
      toast.success("Ledger Entry Deleted Successfully");
      fetchLedger();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to delete ledger entry."
      );
    }
  };

  const deleteBorrower = async () => {
    const confirmDelete = window.confirm(
      "Delete this borrower? All ledger entries will also be deleted."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/deleteBorrower/${borrowerId}`);
      toast.success("Borrower Deleted Successfully");
      navigate("/ledger");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete borrower.");
    }
  };

  const downloadLedgerPDF = async () => {
    try {
      const reportElement = document.getElementById("ledger-pdf-report");

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: 1100,
        windowWidth: 1100,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${ledger.personName}-ledger.pdf`);

      toast.success("Ledger PDF downloaded successfully");
    } catch (err) {
      toast.error("Unable to generate Ledger PDF");
    }
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

  if (!ledger) {
    return (
      <Layout>
        <div className="container-fluid">
          <div className="alert alert-danger">Ledger not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="mb-1">{ledger.personName} Ledger</h2>
            <p className="mb-0 text-muted">Mobile: {ledger.mobile || "-"}</p>
          </div>

          <div className="d-flex flex-column flex-md-row gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/ledger")}
            >
              Back
            </button>

            <button
              className="btn btn-info text-white"
              onClick={downloadLedgerPDF}
            >
              Download PDF
            </button>

            <button className="btn btn-danger" onClick={deleteBorrower}>
              Delete Borrower
            </button>
          </div>
        </div>

        <div className="row">
          <SummaryCard
            title="Total Given"
            value={ledger.totalGiven}
            color="primary"
          />

          <SummaryCard
            title="Total Received"
            value={ledger.totalReceived}
            color="success"
          />

          <SummaryCard
            title="Outstanding"
            value={ledger.balance}
            color="danger"
          />

          <div className="col-xl-3 col-md-6 mb-3">
            <div
              className={`card shadow h-100 border-${
                ledger.status === "Completed" ? "success" : "warning"
              }`}
            >
              <div className="card-body">
                <h6>Status</h6>
                <h3>
                  <span
                    className={`badge ${
                      ledger.status === "Completed"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {ledger.status}
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {showEdit && (
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-warning">
              <h4 className="mb-0">Edit Ledger Entry</h4>
            </div>

            <div className="card-body">
              <form onSubmit={updateLedgerEntry}>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={editForm.type}
                      onChange={handleEditTypeChange}
                    >
                      <option value="GIVEN">Loan Given</option>
                      <option value="RECEIVED">Repayment Received</option>
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={editForm.amount}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={editForm.date}
                      min={
                        editForm.type === "RECEIVED" ? getFirstGivenDate() : ""
                      }
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Entry"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm mt-4">
          <div className="card-header">
            <h4 className="mb-0">Add Ledger Entry</h4>
          </div>

          <div className="card-body">
            <form onSubmit={addLedgerEntry}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={form.type}
                    onChange={handleTypeChange}
                  >
                    <option value="GIVEN">Loan Given</option>
                    <option value="RECEIVED">Repayment Received</option>
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={form.date}
                    min={form.type === "RECEIVED" ? getFirstGivenDate() : ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`btn ${
                  form.type === "GIVEN" ? "btn-primary" : "btn-success"
                }`}
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Entry"}
              </button>
            </form>
          </div>
        </div>

        <div className="card shadow-sm mt-4">
          <div className="card-header">
            <h4 className="mb-0">Ledger History</h4>
          </div>

          <div className="card-body">
            {ledger.entries.length === 0 ? (
              <div className="alert alert-info">No ledger entries found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Given</th>
                      <th>Received</th>
                      <th>Balance</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ledger.entries.map((entry, index) => (
                      <tr key={entry._id}>
                        <td>{index + 1}</td>
                        <td>{entry.date}</td>
                        <td>{entry.description}</td>

                        <td>
                          {entry.given > 0
                            ? `₹${Number(entry.given).toLocaleString()}`
                            : "-"}
                        </td>

                        <td>
                          {entry.received > 0
                            ? `₹${Number(entry.received).toLocaleString()}`
                            : "-"}
                        </td>

                        <td>₹{Number(entry.balance).toLocaleString()}</td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => startEdit(entry)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteLedgerEntry(entry._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="alert alert-warning mt-3 mb-0">
              <strong>Current Outstanding:</strong> ₹
              {Number(ledger.balance || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Hidden fixed-width PDF report */}
        <div
          id="ledger-pdf-report"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            width: "1100px",
            backgroundColor: "white",
            padding: "30px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#0d6efd",
              color: "white",
              padding: "20px",
              fontSize: "30px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            LEDGER STATEMENT
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              marginTop: "20px",
            }}
          >
            <h2>{ledger.personName}</h2>
            <p>
              <strong>Mobile:</strong> {ledger.mobile || "-"}
            </p>
            <p>
              <strong>Status:</strong> {ledger.status}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            <PdfBox title="Total Given" value={ledger.totalGiven} />
            <PdfBox title="Total Received" value={ledger.totalReceived} />
            <PdfBox title="Outstanding" value={ledger.balance} />
          </div>

          <div style={{ marginTop: "30px" }}>
            <h2>Ledger History</h2>

            {ledger.entries.length === 0 ? (
              <p>No ledger entries found.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "17px",
                }}
              >
                <thead>
                  <tr>
                    <th style={pdfTh}>#</th>
                    <th style={pdfTh}>Date</th>
                    <th style={pdfTh}>Description</th>
                    <th style={pdfTh}>Given</th>
                    <th style={pdfTh}>Received</th>
                    <th style={pdfTh}>Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {ledger.entries.map((entry, index) => (
                    <tr key={entry._id}>
                      <td style={pdfTd}>{index + 1}</td>
                      <td style={pdfTd}>{entry.date}</td>
                      <td style={pdfTd}>{entry.description}</td>
                      <td style={pdfTd}>
                        {entry.given > 0
                          ? `₹${Number(entry.given).toLocaleString()}`
                          : "-"}
                      </td>
                      <td style={pdfTd}>
                        {entry.received > 0
                          ? `₹${Number(entry.received).toLocaleString()}`
                          : "-"}
                      </td>
                      <td style={pdfTd}>
                        ₹{Number(entry.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "18px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeeba",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            Current Outstanding: ₹{Number(ledger.balance || 0).toLocaleString()}
          </div>

          <div
            style={{
              marginTop: "30px",
              fontSize: "14px",
              color: "#555",
              borderTop: "1px solid #ddd",
              paddingTop: "15px",
            }}
          >
            Generated by Expense Tracker on {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="col-xl-3 col-md-6 mb-3">
      <div className={`card border-${color} shadow h-100`}>
        <div className="card-body">
          <h6>{title}</h6>
          <h3>₹{Number(value || 0).toLocaleString()}</h3>
        </div>
      </div>
    </div>
  );
}

const pdfTh = {
  border: "1px solid #999",
  padding: "12px",
  backgroundColor: "#f1f1f1",
  textAlign: "left",
};

const pdfTd = {
  border: "1px solid #999",
  padding: "12px",
};

function PdfBox({ title, value }) {
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      <h3>{title}</h3>
      <h2>₹{Number(value || 0).toLocaleString()}</h2>
    </div>
  );
}

export default LedgerDetails;