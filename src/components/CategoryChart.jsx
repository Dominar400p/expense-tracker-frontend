import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

function CategoryChart({ month, year }) {
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (month && year) {
      fetchCategories();
    }
  }, [month, year]);

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categorySummary/${month}/${year}`);

      setData(res.data);
    } catch (err) {
      console.log("Category Summary Error:", err);
    }
  };

  const COLORS = [
    "#0d6efd",
    "#198754",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#fd7e14",
    "#20c997",
    "#6610f2",
    "#6c757d",
  ];

  // User clicked a category
  const handlePieClick = (entry) => {
    if (!entry) return;

    navigate(
      `/transactions?month=${month}&year=${year}&category=${entry.category}`,
    );
  };

  return (
    <div className="card shadow mt-4">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="bi bi-pie-chart-fill me-2"></i>
          {month} {year} Category Wise Expenses
        </h5>
      </div>

      <div className="card-body">
        {data.length === 0 ? (
          <div className="text-center py-5">
            <p>No expenses found for this month.</p>
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                    onClick={handlePieClick}
                  >
                    {data.map((item, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-muted mt-3">
              💡 Click any category to view its transactions.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CategoryChart;
