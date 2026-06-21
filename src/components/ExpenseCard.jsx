import { Link } from "react-router-dom";

function ExpenseCard({ expenses, handleDelete, formatDate }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center mt-5">
        <i className="bi bi-wallet2 display-1 text-secondary"></i>

        <h4 className="mt-3">No Expenses Found</h4>

        <p className="text-muted">No transactions available.</p>
      </div>
    );
  }

  return (
    <div className="card shadow border-0">
      <div
        className="card-body p-0 table-responsive"
        style={{ overflowX: "auto" }}
      >
        <table
          className="table table-hover align-middle mb-0"
          style={{ minWidth: "1100px" }}
        >
          <thead className="table-primary">
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Merchant</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Time</th>
              <th>Description</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>₹{expense.amount}</td>

                <td>{expense.category}</td>

                <td>{expense.merchant}</td>

                <td>{expense.payment_method}</td>

                <td>{formatDate(expense.date)}</td>

                <td>{expense.time}</td>

                <td>{expense.description}</td>

                <td className="text-center">
                  <div className="d-flex justify-content-center">
                    {/* View */}

                    <button className="btn btn-info btn-sm mx-1" disabled>
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* Edit */}

                    <Link
                      to={`/edit-expense/${expense._id}`}
                      className="btn btn-warning btn-sm mx-1"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Link>

                    {/* Delete */}

                    <button
                      className="btn btn-danger btn-sm mx-1"
                      onClick={() => handleDelete(expense._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-white">
        <small className="text-muted">
          Showing {expenses.length} transaction(s)
        </small>
      </div>
    </div>
  );
}

export default ExpenseCard;
