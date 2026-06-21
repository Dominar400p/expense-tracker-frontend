function IncomeTable({ income, handleDelete, formatDate }) {
  return (
    <div className="card shadow">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-success">
            <tr>
              <th>Amount</th>
              <th>Source</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {income.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  No Income Found
                </td>
              </tr>
            ) : (
              income.map((item) => (
                <tr key={item._id}>
                  <td>₹{Number(item.amount).toLocaleString()}</td>

                  <td>{item.source}</td>

                  <td>{item.description}</td>

                  <td>{formatDate(item.date)}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncomeTable;
