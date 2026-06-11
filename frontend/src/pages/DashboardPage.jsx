import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getDashboard();
        setDashboard(response.data);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadDashboard();
  }, []);

  if (error) {
    return <p className="page-message error-message">{error}</p>;
  }

  if (!dashboard) {
    return <p className="page-message">Loading dashboard...</p>;
  }

  const { summary, lowStockProducts, recentOrders } = dashboard;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total revenue</span>
          <strong>{formatCurrency(summary.totalRevenue)}</strong>
        </article>
        <article className="stat-card">
          <span>Total orders</span>
          <strong>{summary.totalOrders}</strong>
        </article>
        <article className="stat-card">
          <span>Total products</span>
          <strong>{summary.totalProducts}</strong>
        </article>
        <article className="stat-card">
          <span>Low stock</span>
          <strong>{summary.lowStockCount}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <h3>Low-stock products</h3>
          {lowStockProducts.length === 0 ? (
            <p className="muted">No low-stock products.</p>
          ) : (
            <ul className="data-list">
              {lowStockProducts.map((product) => (
                <li key={product._id}>
                  <span>{product.name}</span>
                  <strong>{product.stock} left</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <h3>Recent orders</h3>
          {recentOrders.length === 0 ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <ul className="data-list">
              {recentOrders.map((order) => (
                <li key={order._id}>
                  <span>{order.customer?.name || "Unknown customer"}</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </>
  );
}

export default DashboardPage;
