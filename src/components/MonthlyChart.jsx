import { useEffect, useState } from "react";
import api from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function MonthlyChart({ setSelectedMonth, setSelectedYear }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlySummary();
  }, []);

  const fetchMonthlySummary = async () => {
    try {
      const res = await api.get("/monthlySummary");
      setData(res.data);
    } catch (err) {
      console.log("Monthly Summary Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // User clicked a bar
  const handleBarClick = (barData) => {
    if (!barData) return;

    setSelectedMonth(barData.month);
    setSelectedYear(barData.year);
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-bar-chart-fill me-2"></i>
          Monthly Expenses
        </h5>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey={(item) =>
                      `${item.month.substring(0, 3)} ${item.year}`
                    }
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Expense"]}
                    labelFormatter={(label) => label}
                  />

                  <Bar
                    dataKey="total"
                    fill="#0d6efd"
                    cursor="pointer"
                    barSize={40}
                    minPointSize={10}
                    radius={[6, 6, 0, 0]}
                    onClick={handleBarClick}
                    activeBar={{
                      fill: "#0b5ed7",
                      stroke: "#084298",
                      strokeWidth: 2,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-muted mt-3">
              💡 Click any month to view its category-wise expenses.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MonthlyChart;
