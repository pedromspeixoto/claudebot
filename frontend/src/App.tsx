import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Users from "./pages/Users";

export default function App() {
  const { user, loading, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login user={user} onLogin={login} />} />
        <Route
          path="/"
          element={
            <PrivateRoute user={user} loading={loading}>
              <Layout user={user!} onLogout={logout}>
                <Dashboard user={user!} />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute user={user} loading={loading}>
              <Layout user={user!} onLogout={logout}>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
