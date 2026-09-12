import React, { useEffect, useState } from "react";

import api from "./Api/Api";

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

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

  // ==========================================
  // FETCH ALL ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);

      alert(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================
  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);

      const response = await api.put(`/orders/update/${orderId}`, {
        status,
      });

      if (response.data.success) {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id === orderId ? response.data.order : order,
          ),
        );
      }
    } catch (error) {
      console.error("Update status error:", error);

      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading orders...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Manage Orders</h2>

          <p className="text-muted mb-0">View and manage customer orders</p>
        </div>

        <span className="badge bg-dark fs-6">{orders.length} Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center mt-5">
          <h4>No orders found</h4>

          <p className="text-muted">Customers haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Payment Status</th>
                <th>Order Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  {/* ORDER ID */}

                  <td>
                    <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  </td>

                  {/* DATE */}

                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* CUSTOMER */}

                  <td>
                    <strong>{order.userId?.name || "Unknown"}</strong>

                    <br />

                    <small className="text-muted">
                      {order.userId?.email || "No email"}
                    </small>
                  </td>

                  {/* PRODUCTS */}

                  <td>
                    {order.items.map((item, index) => {
                      const product = item.productId;

                      return (
                        <div key={product?._id || index} className="mb-2">
                          <strong>
                            {product?.name || "Product unavailable"}
                          </strong>

                          <br />

                          <small>
                            Qty: {item.quantity}
                            {" × "}₹{Number(item.price).toFixed(2)}
                          </small>
                        </div>
                      );
                    })}
                  </td>

                  {/* TOTAL */}

                  <td>
                    <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
                  </td>

                  {/* PAYMENT */}

                  <td>
                    {order.paymentMethod}

                    {order.paymentId && (
                      <small className="d-block text-muted">
                        {order.paymentId}
                      </small>
                    )}
                  </td>

                  {/* PAYMENT STATUS */}

                  <td>
                    <span
                      className={`badge ${
                        order.paymentStatus === "Paid"
                          ? "bg-success"
                          : order.paymentStatus === "Failed"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  {/* ORDER STATUS */}

                  <td>
                    <select
                      className="form-select"
                      value={order.status}
                      disabled={updating === order._id}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      {statuses.map((status, index) => {
                        const currentIndex = statuses.indexOf(order.status);

                        const statusIndex = index;

                        // Only allow the NEXT status
                        const isNextStatus = statusIndex === currentIndex + 1;

                        // Current and previous statuses
                        // should be disabled
                        const isPreviousOrCurrent = statusIndex <= currentIndex;

                        // Cancelled should always be available
                        const isCancelled = status === "Cancelled";

                        const disabled = !isNextStatus && !isCancelled;

                        return (
                          <option
                            key={status}
                            value={status}
                            disabled={disabled}
                          >
                            {status}
                            {status === order.status ? " (Current)" : ""}
                          </option>
                        );
                      })}
                    </select>

                    {updating === order._id && (
                      <small className="text-muted">Updating...</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;
