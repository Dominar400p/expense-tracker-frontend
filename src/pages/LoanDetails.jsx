import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Layout from "../components/Layout";
import api from "../services/api";
import { toast } from "react-toastify";

function LoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const summaryRef = useRef(null);

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [personName, setPersonName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDate, setLoanDate] = useState("");

  useEffect(() => {
    fetchLoan();
  }, []);

  const fetchLoan = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/loanDetails/${loanId}`);

      setLoan(res.data);
      setPersonName(res.data.personName || "");
      setMobile(res.data.mobile || "");
      setLoanAmount(res.data.loanAmount || "");
      setLoanDate(res.data.loanDate || "");

      if (new Date(date) < new Date(res.data.loanDate)) {
        setDate(res.data.loanDate);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to load loan details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const addRepayment = async () => {
    if (!amount) {
      toast.error("Enter repayment amount");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Enter valid repayment amount");
      return;
    }

    if (new Date(date) < new Date(loan.loanDate)) {
      toast.error("Repayment date cannot be before loan date.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/addRepayment/${loanId}`, {
        amount,
        date,
      });

      toast.success("Repayment Added Successfully");

      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);

      fetchLoan();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to add repayment.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRepayment = async (repaymentId) => {
    const confirmDelete = window.confirm("Delete this repayment?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/deleteRepayment/${repaymentId}`);

      toast.success("Repayment Deleted Successfully");

      fetchLoan();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to delete repayment.",
      );
    }
  };

  const deleteLoan = async () => {
    const confirmDelete = window.confirm(
      "Delete this loan? All repayments will also be deleted.",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/deleteLoan/${loanId}`);

      toast.success("Loan Deleted Successfully");

      navigate("/loans");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete loan.");
    }
  };

  const updateLoan = async () => {
    if (!personName || !mobile || !loanAmount || !loanDate) {
      toast.error("All fields are required");
      return;
    }

    try {
      await api.put(`/updateLoan/${loanId}`, {
        personName,
        mobile,
        loanAmount,
        loanDate,
      });

      toast.success("Loan Updated Successfully");

      setShowEdit(false);

      fetchLoan();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to update loan.");
    }
  };

//   const shareLoanSummary = async () => {
//     try {
//       const canvas = await html2canvas(summaryRef.current, {
//         scale: 2,
//         backgroundColor: "#ffffff",
//       });

//       canvas.toBlob(async (blob) => {
//         const file = new File([blob], "loan-summary.png", {
//           type: "image/png",
//         });

//         if (navigator.canShare && navigator.canShare({ files: [file] })) {
//           await navigator.share({
//             title: "Loan Summary",
//             text: `Loan summary for ${loan.personName}`,
//             files: [file],
//           });
//         } else {
//           const imageUrl = URL.createObjectURL(blob);
//           const link = document.createElement("a");
//           link.href = imageUrl;
//           link.download = "loan-summary.png";
//           link.click();

//           toast.success("Loan summary image downloaded.");
//         }
//       });
//     } catch (err) {
//       toast.error("Unable to share loan summary.");
//     }
//   };

  const downloadLoanPDF = async () => {
    try {
      const reportElement = document.getElementById("loan-pdf-report");

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: 1000,
        windowWidth: 1000,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`${loan.personName}-loan-summary.pdf`);

      toast.success("Loan PDF downloaded successfully");
    } catch (err) {
      toast.error("Unable to generate PDF");
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

  if (!loan) {
    return (
      <Layout>
        <div className="container mt-5">
          <div className="alert alert-danger">Loan not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <h2 className="mb-4">Loan Details</h2>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h3>{loan.personName}</h3>

                <p className="mb-1">
                  <strong>Mobile :</strong> {loan.mobile}
                </p>

                <p className="mb-1">
                  <strong>Loan Date :</strong> {loan.loanDate}
                </p>
              </div>

              <div className="d-flex flex-column flex-md-row gap-2">
                {/* <button className="btn btn-info" onClick={shareLoanSummary}>
                  Share Snapshot
                </button> */}

                <button className="btn btn-info" onClick={downloadLoanPDF}>
                  Download PDF
                </button>

                <button
                  className="btn btn-warning"
                  onClick={() => setShowEdit(true)}
                >
                  Edit Loan
                </button>

                <button className="btn btn-danger" onClick={deleteLoan}>
                  Delete Loan
                </button>
              </div>
            </div>
          </div>
        </div>

        {showEdit && (
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h4>Edit Loan</h4>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Person Name</label>

                  <input
                    type="text"
                    className="form-control"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile</label>

                  <input
                    type="text"
                    className="form-control"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Loan Amount</label>

                  <input
                    type="number"
                    className="form-control"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Loan Date</label>

                  <input
                    type="date"
                    className="form-control"
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={updateLoan}>
                  Update Loan
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snapshot area starts here */}
        <div ref={summaryRef} className="bg-white p-3">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Loan Summary</h4>
            </div>

            <div className="card-body">
              <h3>{loan.personName}</h3>

              <p className="mb-1">
                <strong>Mobile :</strong> {loan.mobile}
              </p>

              <p className="mb-1">
                <strong>Loan Given Date :</strong> {loan.loanDate}
              </p>

              <p className="mb-1">
                <strong>Status :</strong> {loan.status}
              </p>
            </div>
          </div>

          <div className="row">
            <Card title="Loan Amount" value={loan.loanAmount} color="primary" />
            <Card
              title="Total Repaid"
              value={loan.totalRepaid}
              color="success"
            />
            <Card title="Remaining" value={loan.remaining} color="danger" />

            <div className="col-xl-3 col-md-6 mb-3">
              <div
                className={`card shadow h-100 border-${
                  loan.status === "Completed" ? "success" : "warning"
                }`}
              >
                <div className="card-body">
                  <h6>Status</h6>

                  <h3>
                    <span
                      className={`badge ${
                        loan.status === "Completed"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h4 className="mb-0">Repayment History</h4>
            </div>

            <div className="card-body">
              {loan.repayments.length === 0 ? (
                <div className="alert alert-info">No repayments found.</div>
              ) : (
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loan.repayments.map((repayment, index) => (
                      <tr key={repayment._id}>
                        <td>{index + 1}</td>
                        <td>{repayment.date}</td>
                        <td>₹{Number(repayment.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        {/* Snapshot area ends here */}

        <div className="card shadow-sm mt-4">
          <div className="card-header">
            <h4>Add Repayment</h4>
          </div>

          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label>Amount</label>

                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label>Date</label>

                <input
                  type="date"
                  className="form-control"
                  value={date}
                  min={loan.loanDate}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-success w-100"
                  onClick={addRepayment}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Repayment"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mt-4">
          <div className="card-header">
            <h4 className="mb-0">Manage Repayments</h4>
          </div>

          <div className="card-body">
            {loan.repayments.length === 0 ? (
              <div className="alert alert-info">No repayments found.</div>
            ) : (
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loan.repayments.map((repayment, index) => (
                    <tr key={repayment._id}>
                      <td>{index + 1}</td>
                      <td>{repayment.date}</td>
                      <td>₹{Number(repayment.amount).toLocaleString()}</td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteRepayment(repayment._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Fixed desktop-style hidden PDF report */}
        <div
          id="loan-pdf-report"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            width: "1000px",
            backgroundColor: "white",
            padding: "30px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#0d6efd",
              color: "white",
              padding: "18px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Loan Summary
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
            }}
          >
            <h2>{loan.personName}</h2>

            <p>
              <strong>Mobile:</strong> {loan.mobile}
            </p>

            <p>
              <strong>Loan Given Date:</strong> {loan.loanDate}
            </p>

            <p>
              <strong>Status:</strong> {loan.status}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            <PdfBox title="Loan Amount" value={loan.loanAmount} />
            <PdfBox title="Total Repaid" value={loan.totalRepaid} />
            <PdfBox title="Remaining" value={loan.remaining} />
          </div>

          <div style={{ marginTop: "30px" }}>
            <h2>Repayment History</h2>

            {loan.repayments.length === 0 ? (
              <p>No repayments found.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "18px",
                }}
              >
                <thead>
                  <tr>
                    <th style={pdfTh}>#</th>
                    <th style={pdfTh}>Date</th>
                    <th style={pdfTh}>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {loan.repayments.map((repayment, index) => (
                    <tr key={repayment._id}>
                      <td style={pdfTd}>{index + 1}</td>

                      <td style={pdfTd}>{repayment.date}</td>

                      <td style={pdfTd}>
                        ₹{Number(repayment.amount).toLocaleString()}
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

function Card({ title, value, color }) {
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

export default LoanDetails;