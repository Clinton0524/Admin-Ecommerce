
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { myContext } from "./Context";
import api from "./Api/Api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const { currentUser, handleLogout } = useContext(myContext);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersResponse, productsResponse] =
          await Promise.all([
            api.get("/orders"),
            api.get("/products"),
          ]);

        setOrders(ordersResponse.data.orders || []);
        setProducts(productsResponse.data.products || []);
      } catch (error) {
        console.error("Dashboard Error:", error);

        if (error.response?.status === 401) {
          handleLogout();
          return;
        }

        if (error.response?.status === 403) {
          setError("You do not have permission to view the dashboard.");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [handleLogout]);

  // =====================================================
  // SUMMARY STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.status === "Pending"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "Delivered"
    ).length;

    const totalRevenue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce(
        (total, order) =>
          total + Number(order.totalAmount || 0),
        0
      );

    return {
      totalProducts: products.length,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
    };
  }, [orders, products]);

  // =====================================================
  // MONTHLY ORDERS
  // =====================================================

  const monthlyOrdersData = useMemo(() => {
    const months = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        month: date.toLocaleString("en-US", {
          month: "short",
        }),
        year: date.getFullYear(),
        orders: 0,
        revenue: 0,
      });
    }

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const orderDate = new Date(order.createdAt);

      const matchingMonth = months.find(
        (item) =>
          item.month ===
            orderDate.toLocaleString("en-US", {
              month: "short",
            }) &&
          item.year === orderDate.getFullYear()
      );

      if (matchingMonth) {
        matchingMonth.orders += 1;

        if (order.status !== "Cancelled") {
          matchingMonth.revenue += Number(
            order.totalAmount || 0
          );
        }
      }
    });

    return months.map((item) => ({
      month: `${item.month} ${String(item.year).slice(-2)}`,
      orders: item.orders,
      revenue: Number(item.revenue.toFixed(2)),
    }));
  }, [orders]);

  // =====================================================
  // ORDER STATUS DATA
  // =====================================================

  const orderStatusData = useMemo(() => {
    const statuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    return statuses.map((status) => ({
      status,
      orders: orders.filter(
        (order) => order.status === status
      ).length,
    }));
  }, [orders]);

  // =====================================================
  // PAYMENT METHOD DATA
  // =====================================================

  const paymentMethodData = useMemo(() => {
    const methods = ["COD", "UPI", "Card"];

    return methods
      .map((method) => ({
        name: method,
        value: orders.filter(
          (order) => order.paymentMethod === method
        ).length,
      }))
      .filter((item) => item.value > 0);
  }, [orders]);

  // =====================================================
  // RECENT ORDERS
  // =====================================================

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [orders]);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";

      case "Confirmed":
        return "status-confirmed";

      case "Processing":
        return "status-processing";

      case "Packed":
        return "status-packed";

      case "Shipped":
        return "status-shipped";

      case "Out for Delivery":
        return "status-delivery";

      case "Delivered":
        return "status-delivered";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogoutClick = () => {
    handleLogout();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-error-page">
        <div className="dashboard-error-box">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-container">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          ADMIN PANEL
        </div>

        <div className="admin-info">

          <div className="admin-avatar">
            {currentUser?.name
              ?.charAt(0)
              .toUpperCase() || "A"}
          </div>

          <div>
            <h4>{currentUser?.name || "Admin"}</h4>
            <span>
              {currentUser?.email || "Administrator"}
            </span>
          </div>

        </div>

        <nav className="dashboard-menu">

          <button
            className="dashboard-menu-item active"
            onClick={() => navigate("/dashboard")}
          >
            <span>📊</span>
            Dashboard
          </button>

          <button
            className="dashboard-menu-item"
            onClick={() => navigate("/products")}
          >
            <span>📦</span>
            Products
          </button>

          <button
            className="dashboard-menu-item"
            onClick={() => navigate("/orders")}
          >
            <span>🛒</span>
            Orders
          </button>

          <button
            className="dashboard-menu-item"
            onClick={() => navigate("/profile")}
          >
            <span>👤</span>
            Profile
          </button>

        </nav>

        <button
          className="dashboard-logout"
          onClick={handleLogoutClick}
        >
          <span>🚪</span>
          Logout
        </button>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-main">

        {/* Header */}

        <div className="dashboard-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back,{" "}
              <strong>
                {currentUser?.name || "Admin"}
              </strong>
            </p>
          </div>

          <button
            className="dashboard-refresh"
            onClick={() => window.location.reload()}
          >
            ↻ Refresh
          </button>

        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="dashboard-stat-grid">

          <div className="dashboard-stat-card">

            <div className="stat-icon products-icon">
              📦
            </div>

            <div className="stat-content">
              <span>Total Products</span>
              <h2>{statistics.totalProducts}</h2>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon orders-icon">
              🛒
            </div>

            <div className="stat-content">
              <span>Total Orders</span>
              <h2>{statistics.totalOrders}</h2>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon pending-icon">
              ⏳
            </div>

            <div className="stat-content">
              <span>Pending Orders</span>
              <h2>{statistics.pendingOrders}</h2>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon revenue-icon">
              ₹
            </div>

            <div className="stat-content">
              <span>Total Revenue</span>
              <h2>
                {formatCurrency(
                  statistics.totalRevenue
                )}
              </h2>
            </div>

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="dashboard-actions">

          <button
            onClick={() => navigate("/products")}
          >
            <span>📦</span>
            Manage Products
          </button>

          <button
            onClick={() => navigate("/orders")}
          >
            <span>🛒</span>
            Manage Orders
          </button>

        </div>

        {/* =================================================
            CHARTS ROW 1
        ================================================= */}

        <div className="dashboard-chart-grid">

          {/* Monthly Orders */}

          <div className="dashboard-chart-card large-chart">

            <div className="chart-header">
              <div>
                <h3>Monthly Orders</h3>
                <p>
                  Orders received during the last 6 months
                </p>
              </div>
            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart
                  data={monthlyOrdersData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="month" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* Revenue */}

          <div className="dashboard-chart-card large-chart">

            <div className="chart-header">
              <div>
                <h3>Revenue</h3>
                <p>
                  Revenue generated during the last 6 months
                </p>
              </div>
            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart
                  data={monthlyOrdersData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* =================================================
            CHARTS ROW 2
        ================================================= */}

        <div className="dashboard-chart-grid">

          {/* Order Status */}

          <div className="dashboard-chart-card">

            <div className="chart-header">
              <div>
                <h3>Orders by Status</h3>
                <p>
                  Current order distribution
                </p>
              </div>
            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={380}
              >
                <BarChart
                  data={orderStatusData}
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="status"
                    width={110}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* Payment Methods */}

          <div className="dashboard-chart-card">

            <div className="chart-header">
              <div>
                <h3>Payment Methods</h3>
                <p>
                  Orders by payment method
                </p>
              </div>
            </div>

            <div className="chart-container payment-chart">

              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height={380}
                >
                  <PieChart>

                    <Pie
                      data={paymentMethodData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={125}
                      label
                    >
                      {paymentMethodData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-chart-data">
                  <span>📊</span>
                  <p>
                    No payment data available
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <div className="recent-orders-card">

          <div className="recent-orders-header">

            <div>
              <h3>Recent Orders</h3>
              <p>
                Latest orders placed by customers
              </p>
            </div>

            <button
              onClick={() => navigate("/orders")}
            >
              View All Orders →
            </button>

          </div>

          {recentOrders.length === 0 ? (
            <div className="no-orders">
              <span>🛒</span>
              <p>No orders available.</p>
            </div>
          ) : (
            <div className="orders-table-wrapper">

              <table className="dashboard-orders-table">

                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentOrders.map((order) => (

                    <tr key={order._id}>

                      <td>
                        <strong>
                          #{order._id?.slice(-8)}
                        </strong>
                      </td>

                      <td>
                        {order.userId?.name ||
                          "Customer"}
                      </td>

                      <td>
                        {formatDate(order.createdAt)}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            Number(
                              order.totalAmount || 0
                            )
                          )}
                        </strong>
                      </td>

                      <td>
                        {order.paymentMethod || "-"}
                      </td>

                      <td>
                        <span
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default Dashboard;
