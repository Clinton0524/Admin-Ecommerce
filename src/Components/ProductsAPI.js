import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import { myContext } from "./Context";
import api from "./Api/Api";

// =====================================================
// PRODUCTS ADMIN
// =====================================================

const ProductsAPI = () => {
  const { currentUser, handleLogout } = useContext(myContext);

  const [data, setData] = useState([]);

  const [categories, setCategories] = useState([]);

  const [isEdit, setIsEdit] = useState(false);

  const [editId, setEditId] = useState(null);

  const [sortedData, setSortedData] = useState("");

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [openModel, setOpenModel] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [imageUrl, setImageUrl] = useState("");

  const itemsPerPage = 20;

  // =====================================================
  // PRODUCT FORM
  // =====================================================

  const [addProducts, setAddProducts] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    stock: "",
    imageUrl: "",
    weight: "",
    isExclusive: false,
    category: "",
  });

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products");

      if (response.data.success) {
        setData(response.data.products || []);
      } else {
        setData(response.data.products || []);
      }
    } catch (error) {
      console.error("Fetch products error:", error);

      alert(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      if (response.data.success) {
        setCategories(response.data.categories || []);
      } else {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);

      alert(error.response?.data?.message || "Failed to load categories");
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  // =====================================================
  // DEBOUNCE SEARCH
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredAndSortedData = [...data]
    .filter((product) =>
      product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortedData === "asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortedData === "desc") {
        return b.name.localeCompare(a.name);
      }

      if (sortedData === "h-l") {
        return Number(b.price) - Number(a.price);
      }

      if (sortedData === "l-h") {
        return Number(a.price) - Number(b.price);
      }

      return 0;
    });

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedData.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // =====================================================
  // SORT
  // =====================================================

  const handleSort = (e) => {
    setSortedData(e.target.value);
    setCurrentPage(1);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddProducts((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // CLOUDINARY IMAGE UPLOAD
  // =====================================================

  const uploadImageToCloudinary = async () => {
    if (!imageFile) {
      alert("Please select an image first");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", imageFile);

      formData.append("upload_preset", "clouddata");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dceqkkwlf/image/upload",
        formData,
      );

      const uploadedUrl = response.data.secure_url;

      setImageUrl(uploadedUrl);

      setAddProducts((previous) => ({
        ...previous,
        imageUrl: uploadedUrl,
      }));

      alert("Image uploaded successfully");
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      alert("Image upload failed");
    }
  };

  // =====================================================
  // SAVE / UPDATE PRODUCT
  // =====================================================

  const handleSaveProduct = async () => {
    if (!addProducts.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!addProducts.price) {
      alert("Product price is required");
      return;
    }

    if (!addProducts.stock && addProducts.stock !== 0) {
      alert("Product stock is required");
      return;
    }

    if (!addProducts.category) {
      alert("Please select a category");
      return;
    }

    if (!addProducts.imageUrl) {
      alert("Product image is required");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // UPDATE
      // =================================================

      if (isEdit) {
        const response = await api.put(`/products/${editId}`, addProducts);

        if (response.data.success) {
          setData((previousData) =>
            previousData.map((product) =>
              product._id === editId ? response.data.product : product,
            ),
          );

          alert("Product updated successfully");

          resetForm();
        } else {
          alert(response.data.message || "Failed to update product");
        }

        return;
      }

      // =================================================
      // ADD
      // =================================================

      const response = await api.post("/products", addProducts);

      if (response.data.success) {
        setData((previousData) => [...previousData, response.data.product]);

        alert("Product added successfully");

        resetForm();
      } else {
        alert(response.data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Save product error:", error);

      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  const handleEditClick = (product) => {
    setIsEdit(true);
    setEditId(product._id);
    setOpenModel(true);

    setAddProducts({
      name: product.name || "",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      description: product.description || "",
      stock: product.stock ?? "",
      imageUrl: product.imageUrl || "",
      weight: product.weight || "",
      isExclusive: product.isExclusive || false,
      category: product.category || "",
    });

    setImageUrl(product.imageUrl || "");

    setImageFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(id);

      const response = await api.delete(`/products/${id}`);

      if (response.data.success) {
        setData((previousData) =>
          previousData.filter((product) => product._id !== id),
        );

        alert("Product deleted successfully");
      } else {
        alert(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);

      alert(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setOpenModel(false);
    setIsEdit(false);
    setEditId(null);

    setAddProducts({
      name: "",
      price: "",
      oldPrice: "",
      description: "",
      stock: "",
      imageUrl: "",
      weight: "",
      isExclusive: false,
      category: "",
    });

    setImageFile(null);
    setImageUrl("");
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const goToPreviousPage = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="container mt-4 mb-5">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="mb-0">Products</h2>

          <small className="text-muted">Manage your products</small>
        </div>

        <div className="col-md-6">
          <div className="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
            <div className="me-3 text-end">
              <strong>Welcome {currentUser?.name || "Admin"}</strong>

              <br />

              <small className="text-muted">{currentUser?.email}</small>
            </div>

            <button
              className="btn btn-danger"
              style={{
                fontSize: "12px",
                padding: "6px 10px",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          SEARCH + SORT
      ================================================= */}

      <div className="row mb-3">
        <div className="col-md-3 mb-2 mb-md-0">
          <select
            className="form-select"
            value={sortedData}
            onChange={handleSort}
          >
            <option value="">Sort Products</option>

            <option value="asc">Name A-Z</option>

            <option value="desc">Name Z-A</option>

            <option value="h-l">Price High-Low</option>

            <option value="l-h">Price Low-High</option>
          </select>
        </div>

        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search product..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="col-md-3 mt-2 mt-md-0 text-md-end">
          {!openModel && (
            <button
              className="btn btn-success"
              onClick={() => setOpenModel(true)}
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      {openModel && (
        <div className="card shadow-sm border p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">{isEdit ? "Edit Product" : "Add Product"}</h4>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={resetForm}
            >
              Close
            </button>
          </div>

          {/* PRODUCT NAME */}

          <input
            type="text"
            name="name"
            value={addProducts.name}
            placeholder="Enter Product Name"
            onChange={handleChange}
            className="form-control mt-2"
          />

          {/* PRICE */}

          <input
            type="number"
            name="price"
            value={addProducts.price}
            placeholder="Enter Price"
            onChange={handleChange}
            className="form-control mt-2"
          />

          {/* OLD PRICE */}

          <input
            type="number"
            name="oldPrice"
            value={addProducts.oldPrice}
            placeholder="Enter Old Price"
            onChange={handleChange}
            className="form-control mt-2"
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            value={addProducts.description}
            placeholder="Enter Description"
            onChange={handleChange}
            className="form-control mt-2"
            rows="3"
          />

          {/* STOCK */}

          <input
            type="number"
            name="stock"
            value={addProducts.stock}
            placeholder="Enter Stock"
            onChange={handleChange}
            className="form-control mt-2"
          />

          {/* WEIGHT */}

          <input
            type="text"
            name="weight"
            value={addProducts.weight}
            placeholder="Enter Weight"
            onChange={handleChange}
            className="form-control mt-2"
          />

          {/* CATEGORY */}

          <select
            name="category"
            value={addProducts.category}
            className="form-select mt-2"
            onChange={handleChange}
          >
            <option value="">Select Category</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* EXCLUSIVE */}

          <div className="form-check mt-3">
            <input
              type="checkbox"
              name="isExclusive"
              className="form-check-input"
              id="isExclusive"
              checked={addProducts.isExclusive}
              onChange={handleChange}
            />

            <label className="form-check-label" htmlFor="isExclusive">
              Exclusive Product
            </label>
          </div>

          {/* IMAGE */}

          <div className="mt-3">
            <label className="form-label fw-semibold">Product Image</label>

            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setImageFile(e.target.files[0])}
            />

            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={uploadImageToCloudinary}
            >
              Upload Image
            </button>
          </div>

          {/* IMAGE PREVIEW */}

          {imageUrl && (
            <div className="mt-3">
              <p className="mb-1">Image Preview</p>

              <img
                src={imageUrl}
                alt="Product preview"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}

          {/* FORM BUTTONS */}

          <div className="mt-4">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSaveProduct}
              disabled={saving}
            >
              {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
            </button>

            <button
              type="button"
              className="btn btn-danger mx-2"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          PRODUCT COUNT
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <p className="mb-0 text-muted">
          Showing {currentData.length} of {filteredAndSortedData.length}{" "}
          products
        </p>

        <span className="badge bg-dark">Total: {data.length}</span>
      </div>

      {/* =================================================
          NO PRODUCTS
      ================================================= */}

      {currentData.length === 0 ? (
        <div className="text-center mt-5">
          <h4>No products found</h4>

          <p className="text-muted">
            Try a different search or add a new product.
          </p>
        </div>
      ) : (
        /* =================================================
           PRODUCTS TABLE
        ================================================= */

        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Index</th>

                <th>Image</th>

                <th>Product Name</th>

                <th>Category</th>

                <th>Weight</th>

                <th>Price</th>

                <th>Stock</th>

                <th>Exclusive</th>

                <th>Edit</th>

                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((product, index) => {
                const category = categories.find(
                  (cat) => cat._id === product.category,
                );

                return (
                  <tr key={product._id || index}>
                    {/* INDEX */}

                    <td>{startIndex + index + 1}</td>

                    {/* IMAGE */}

                    <td>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: "55px",
                            height: "55px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>

                    {/* NAME */}

                    <td>
                      <strong>{product.name}</strong>

                      {product.description && (
                        <small className="d-block text-muted">
                          {product.description.slice(0, 50)}
                          {product.description.length > 50 ? "..." : ""}
                        </small>
                      )}
                    </td>

                    {/* CATEGORY */}

                    <td>
                      {typeof product.category === "object"
                        ? product.category?.name
                        : product.category}
                    </td>

                    {/* WEIGHT */}

                    <td>{product.weight || "-"}</td>

                    {/* PRICE */}

                    <td>₹{Number(product.price).toFixed(2)}</td>

                    {/* STOCK */}

                    <td>
                      <span
                        className={`badge ${
                          Number(product.stock) <= 0
                            ? "bg-danger"
                            : Number(product.stock) <= 5
                              ? "bg-warning text-dark"
                              : "bg-success"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* EXCLUSIVE */}

                    <td>
                      {product.isExclusive ? (
                        <span className="badge bg-primary">Yes</span>
                      ) : (
                        <span className="badge bg-secondary">No</span>
                      )}
                    </td>

                    {/* EDIT */}

                    <td>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                    </td>

                    {/* DELETE */}

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(product._id)}
                        disabled={deleting === product._id}
                      >
                        {deleting === product._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {filteredAndSortedData.length > 0 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            className="btn btn-outline-primary mx-1"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            Prev
          </button>

          <span className="mx-3 fw-bold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-outline-primary mx-1"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsAPI;
