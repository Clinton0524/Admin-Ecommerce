import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { myContext } from "./Context";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth"; // Keep only if you use Firebase Auth
import { auth } from "./firebase"; // Keep only if you use Firebase Auth

const ProductsAPI = () => {
  const { currentUser } = useContext(myContext);
  const [data, setData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [sortedData, setSortedData] = useState("");
  const [search, setSearch] = useState("");
  const [addProducts, setAddProducts] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    stock: "",
    imageUrl: "",
    weight: "",
    isExclusive: "",
    category: "",
  });
  const [openModel, setOpenModel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [avatar, setAvatar] = useState("");

  const navigate = useNavigate();

  // ---------------- FILTER & SORT ----------------
  const filteredandSort = [...data]
    .filter((arr) =>
      arr.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (sortedData === "asc") return a.name.localeCompare(b.name);
      if (sortedData === "desc") return b.name.localeCompare(a.name);
      if (sortedData === "h-l") return b.price - a.price;
      if (sortedData === "l-h") return a.price - b.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredandSort.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredandSort.slice(startIndex, endIndex);
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setAvatar(user.photoURL);
  }, []);
  // ---------------- DEBOUNCING ----------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);
  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch("https://newback-aold.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.log(err));
  };

  const fetchData = () => {
    axios
      .get("https://newback-aold.onrender.com/api/products")
      .then((res) => setData(res.data.products))
      .catch((err) => console.log(err));
  };

  // ---------------- DELETE ----------------
  const handleDelete = (id) => {
    axios
      .delete(`https://newback-aold.onrender.com/api/products/${id}`)
      .then(() => {
        setData(data.filter((arr) => arr._id !== id));
        alert("Product deleted successfully");
      })
      .catch((err) => console.log(err));
  };

  // ---------------- CLOUDINARY UPLOAD ----------------
  const uploadImageToCloudinary = async () => {
  if (!imageFile) {
    alert("Select a new image to replace");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "clouddata");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dceqkkwlf/image/upload",
      formData
    );

    setImageUrl(res.data.secure_url);
    setAddProducts((prev) => ({
      ...prev,
      imageUrl: res.data.secure_url,
    }));

    alert("Image updated successfully");
  } catch (err) {
    console.error(err);
  }
};


  // ---------------- ADD PRODUCT ----------------
 const handleSaveProduct = () => {
  if (!addProducts.imageUrl) {
    alert("Image is required");
    return;
  }

  if (isEdit) {
    axios
      .put(
        `https://newback-aold.onrender.com/api/products/${editId}`,
        addProducts
      )
      .then((res) => {
        setData(
          data.map((item) =>
            item._id === editId ? res.data.product : item
          )
        );
        resetForm();
      });
  } else {
    axios
      .post("https://newback-aold.onrender.com/api/products", addProducts)
      .then((res) => {
        setData([...data, res.data.product]);
        resetForm();
      });
  }
};

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
      isExclusive: "",
      category: "",
    });
    setImageFile(null);
    setImageUrl("");
  };

  // ---------------- CHANGE HANDLER ----------------
  const handleChange = (e) => {
    setAddProducts({ ...addProducts, [e.target.name]: e.target.value });
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Firebase handles everything
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleEditClick = (product) => {
    setIsEdit(true);
    setEditId(product._id);
    setOpenModel(true);

    setAddProducts({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      description: product.description,
      stock: product.stock,
      imageUrl: product.imageUrl,
      weight: product.weight,
      isExclusive: product.isExclusive,
      category: product.category,
    });

    setImageUrl(product.imageUrl);
  };

  return (
    <div className="container mt-4 mb-5">
      {/* HEADER */}
      <div className="row align-items-center">
        <div className="col-3">
          <h2 className="mb-3 text-start">Products</h2>
        </div>
        <div className="col-9 justify-content-end d-flex align-items-center">
          {avatar && (
            <img
              src={avatar}
              alt="User Avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                marginRight: 10,
              }}
            />
          )}
          <h6>Welcome {currentUser?.displayName}</h6>
          <button
            className="btn btn-danger ms-2"
            style={{ fontSize: "12px", padding: "4px" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* SORT & SEARCH */}
      <div className="row mb-3">
        <div className="col-3">
          <select
            className="form-select w-50"
            value={sortedData}
            onChange={(e) => setSortedData(e.target.value)}
          >
            <option value="">Select</option>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
            <option value="h-l">High-Low</option>
            <option value="l-h">Low-High</option>
          </select>
        </div>
        <div className="col-6">
          <input
            type="text"
            className="form-control w-100"
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search here..."
            value={search}
          />
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {openModel && (
        <div className="container border p-3 mb-3">
          <input
            type="text"
            name="name"
            value={addProducts.name}
            placeholder="Enter Name"
            onChange={handleChange}
            className="form-control mt-2"
          />

          <input
            type="text"
            name="price"
            value={addProducts.price}
            placeholder="Enter Price"
            onChange={handleChange}
            className="form-control mt-2"
          />

          <input
            type="text"
            name="oldPrice"
            value={addProducts.oldPrice}
            placeholder="Enter OldPrice"
            onChange={handleChange}
            className="form-control mt-2"
          />

          <input
            type="text"
            name="description"
            value={addProducts.description}
            placeholder="Enter Description"
            onChange={handleChange}
            className="form-control mt-2"
          />
          <input
            type="text"
            name="stock"
            value={addProducts.stock}
            placeholder="Enter Stock Number"
            onChange={handleChange}
            className="form-control mt-2"
          />

          <input
            type="text"
            name="weight"
            value={addProducts.weight}
            placeholder="Enter Weight"
            onChange={handleChange}
            className="form-control mt-2"
          />

          <input
            type="text"
            name="isExclusive"
            value={addProducts.isExclusive}
            placeholder="Is Exclusive"
            onChange={handleChange}
            className="form-control mt-2"
          />

          <select
            name="category"
            value={addProducts.category}
            className="form-control mt-2"
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* CLOUDINARY UPLOAD */}
          <input
            type="file"
            accept="image/*"
            className="form-control mt-2"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={uploadImageToCloudinary}
          >
            Upload Image
          </button>

          {imageUrl && (
            <img src={imageUrl} alt="preview" width="120" className="mt-2" />
          )}

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSaveProduct}
            >
              {isEdit ? "Update Product" : "Add Product"}
            </button>

            <button className="btn btn-danger mx-2" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADD BUTTON */}
      {!openModel && (
        <button
          className="btn btn-success mb-2"
          style={{ fontSize: "15px" }}
          onClick={() => setOpenModel(true)}
        >
          Add Product
        </button>
      )}

      {/* PRODUCTS TABLE */}
      <table className="table table-bordered table-striped table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>Index</th>
            <th>Product Name</th>
            <th>Weight</th>
            <th>Product Price</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((arr, index) => (
            <tr key={arr._id || index}>
              <td>{startIndex + index + 1}</td>
              <td>{arr.name}</td>
              <td>{arr.weight}</td>
              <td>{arr.price}/-</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEditClick(arr)}
                >
                  Edit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(arr._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-3">
        <button
          className="btn btn-outline-primary mx-1"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
        <span className="mx-3 fw-bold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-outline-primary mx-1"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductsAPI;
