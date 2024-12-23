import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Auth/Login";
import Register from "./Auth/Registration";
import Layout from "./Components/Layout/Layout";
import TaskManagement from "./Components/TaskList";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Routes/ProtectedRoutes";
import UserProfile from "./Components/UserProfile";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <div className="mt-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route
                path="/task-list"
                element={
                  <ProtectedRoute>
                    <TaskManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path="/user-profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            ></Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
