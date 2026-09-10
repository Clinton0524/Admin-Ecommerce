
import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import MyProvider from "./Components/Context";

import Register from "./Components/Register";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import ProductsAPI from "./Components/ProductsAPI";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import Profile from "./Components/Profile";
import OrdersAdmin from "./Components/OrdersAdmin";

function App() {
  return (
    <MyProvider>
      <Router>
        <Routes>

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoutes>
                <ProductsAPI />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoutes>
                <OrdersAdmin />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <Profile />
              </ProtectedRoutes>
            }
          />

          <Route
            path="*"
            element={<Login />}
          />

        </Routes>
      </Router>
    </MyProvider>
  );
}

export default App;
