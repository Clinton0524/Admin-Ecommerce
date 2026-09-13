
import React, { useEffect, useState } from "react";
import api from "./Api/Api";

const PromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrder: "",
    maximumDiscount: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  // =====================================================
  // FETCH PROMO CODES
  // =====================================================

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);

      const response = await api.get("/promo-codes");

      setPromoCodes(response.data.promoCodes || []);
    } catch (error) {
      console.error("Fetch promo codes error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load promo codes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrder: "",
      maximumDiscount: "",
      expiryDate: "",
      usageLimit: "",
      isActive: true,
    });

    setEditingId(null);
  };

  // =====================================================
  // SAVE PROMO CODE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Promo code is required");
      return;
    }

    if (!form.discountValue) {
      alert("Discount value is required");
      return;
    }

    if (!form.expiryDate) {
      alert("Expiry date is required");
      return;
    }

    try {
      setSaving(true);

      const data = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minimumOrder:
          form.minimumOrder === ""
            ? 0
            : Number(form.minimumOrder),
        maximumDiscount:
          form.maximumDiscount === ""
            ? null
            : Number(form.maximumDiscount),
        usageLimit:
          form.usageLimit === ""
            ? null
            : Number(form.usageLimit),
      };

      let response;

      // UPDATE
      if (editingId) {
        response = await api.put(
          `/promo-codes/${editingId}`,
          data
        );

        if (response.data.success) {
          setPromoCodes((previous) =>
            previous.map((promo) =>
              promo._id === editingId
                ? response.data.promoCode
                : promo
            )
          );

          alert("Promo code updated successfully");
        }
      }

      // CREATE
      else {
        response = await api.post(
          "/promo-codes",
          data
        );

        if (response.data.success) {
          setPromoCodes((previous) => [
            response.data.promoCode,
            ...previous,
          ]);

          alert("Promo code created successfully");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Save promo code error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save promo code"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (promo) => {
    setEditingId(promo._id);

    setForm({
      code: promo.code || "",
      discountType:
        promo.discountType || "percentage",
      discountValue:
        promo.discountValue ?? "",
      minimumOrder:
        promo.minimumOrder ?? "",
      maximumDiscount:
        promo.maximumDiscount ?? "",
      expiryDate: promo.expiryDate
        ? new Date(promo.expiryDate)
            .toISOString()
            .split("T")[0]
        : "",
      usageLimit:
        promo.usageLimit ?? "",
      isActive:
        promo.isActive ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this promo code?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await api.delete(
        `/promo-codes/${id}`
      );

      if (response.data.success) {
        setPromoCodes((previous) =>
          previous.filter(
            (promo) => promo._id !== id
          )
        );

        alert("Promo code deleted successfully");
      }
    } catch (error) {
      console.error("Delete promo code error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete promo code"
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div
          className="spinner-border"
          role="status"
        />

        <p className="mt-2">
          Loading promo codes...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="container mt-4 mb-5">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="mb-0">
            Promo Codes
          </h2>

          <small className="text-muted">
            Create and manage discount codes
          </small>
        </div>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="card shadow-sm border p-4 mb-4">

        <h4 className="mb-3">
          {editingId
            ? "Edit Promo Code"
            : "Add Promo Code"}
        </h4>

        <form onSubmit={handleSubmit}>

          <div className="row">

            {/* CODE */}

            <div className="col-md-6 mb-3">

              <label className="form-label fw-semibold">
                Promo Code
              </label>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Example: WELCOME10"
                className="form-control"
              />

            </div>

            {/* DISCOUNT TYPE */}

            <div className="col-md-3 mb-3">

              <label className="form-label fw-semibold">
                Discount Type
              </label>

              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed Amount
                </option>
              </select>

            </div>

            {/* DISCOUNT VALUE */}

            <div className="col-md-3 mb-3">

              <label className="form-label fw-semibold">
                Discount Value
              </label>

              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={
                  form.discountType ===
                  "percentage"
                    ? "10"
                    : "50"
                }
                className="form-control"
                min="0"
              />

            </div>

            {/* MINIMUM ORDER */}

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold">
                Minimum Order
              </label>

              <input
                type="number"
                name="minimumOrder"
                value={form.minimumOrder}
                onChange={handleChange}
                placeholder="Example: 500"
                className="form-control"
                min="0"
              />

            </div>

            {/* MAXIMUM DISCOUNT */}

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold">
                Maximum Discount
              </label>

              <input
                type="number"
                name="maximumDiscount"
                value={form.maximumDiscount}
                onChange={handleChange}
                placeholder="Optional"
                className="form-control"
                min="0"
              />

            </div>

            {/* USAGE LIMIT */}

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold">
                Usage Limit
              </label>

              <input
                type="number"
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="Optional"
                className="form-control"
                min="1"
              />

            </div>

            {/* EXPIRY */}

            <div className="col-md-6 mb-3">

              <label className="form-label fw-semibold">
                Expiry Date
              </label>

              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="form-control"
              />

            </div>

            {/* ACTIVE */}

            <div className="col-md-6 mb-3 d-flex align-items-end">

              <div className="form-check mb-2">

                <input
                  type="checkbox"
                  name="isActive"
                  id="promoActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="form-check-input"
                />

                <label
                  htmlFor="promoActive"
                  className="form-check-label"
                >
                  Active Promo Code
                </label>

              </div>

            </div>

          </div>

          {/* BUTTONS */}

          <button
            type="submit"
            className="btn btn-success"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Promo Code"
                : "Create Promo Code"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          )}

        </form>

      </div>

      {/* =================================================
          PROMO CODE COUNT
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-2">

        <p className="text-muted mb-0">
          Showing {promoCodes.length} promo codes
        </p>

        <span className="badge bg-dark">
          Total: {promoCodes.length}
        </span>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      {promoCodes.length === 0 ? (

        <div className="text-center mt-5">

          <h4>
            No promo codes found
          </h4>

          <p className="text-muted">
            Create your first promo code above.
          </p>

        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-bordered table-striped table-hover align-middle">

            <thead className="table-dark">

              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Max Discount</th>
                <th>Expiry</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>

            </thead>

            <tbody>

              {promoCodes.map((promo) => (

                <tr key={promo._id}>

                  {/* CODE */}

                  <td>
                    <strong>
                      {promo.code}
                    </strong>
                  </td>

                  {/* DISCOUNT */}

                  <td>
                    {promo.discountType ===
                    "percentage"
                      ? `${promo.discountValue}%`
                      : `₹${promo.discountValue}`}
                  </td>

                  {/* MINIMUM */}

                  <td>
                    ₹
                    {Number(
                      promo.minimumOrder || 0
                    ).toFixed(2)}
                  </td>

                  {/* MAXIMUM */}

                  <td>
                    {promo.maximumDiscount !==
                    null
                      ? `₹${Number(
                          promo.maximumDiscount
                        ).toFixed(2)}`
                      : "No limit"}
                  </td>

                  {/* EXPIRY */}

                  <td>
                    {promo.expiryDate
                      ? new Date(
                          promo.expiryDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </td>

                  {/* USAGE */}

                  <td>
                    {promo.usedCount || 0}

                    {" / "}

                    {promo.usageLimit ??
                      "Unlimited"}
                  </td>

                  {/* STATUS */}

                  <td>
                    {promo.isActive ? (
                      <span className="badge bg-success">
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-secondary">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* EDIT */}

                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleEdit(promo)
                      }
                    >
                      Edit
                    </button>
                  </td>

                  {/* DELETE */}

                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(
                          promo._id
                        )
                      }
                    >
                      Delete
                    </button>
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

export default PromoCodes;
