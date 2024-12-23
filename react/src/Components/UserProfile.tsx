import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../Services/ApiClients";

interface User {
  name: string;
  email: string;
  user_name: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    user_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/user");
        setUser(response.data.data);
        setFormData({
          name: response.data.data.name,
          email: response.data.data.email,
          user_name: response.data.data.user_name,
        });
      } catch {
        setError("Failed to fetch user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        user_name: user.user_name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    try {
      const response = await apiClient.post(
        "/user", // Use the API client for the request
        {
          name: formData.name,
          email: formData.email,
          user_name: formData.user_name,
        }
      );
      setUser(response.data.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="text-center text-xl mt-10">Loading user data...</div>
    );

  return (
    <div className="p-6 max-w-lg mx-auto bg-gradient-to-r from-indigo-50 to-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
        User Profile
      </h1>
      {user && !isEditing && (
        <div className="mb-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-lg font-medium text-gray-800">
              <span className="font-semibold">Name:</span> {user.name}
            </p>
            <p className="text-lg font-medium text-gray-800">
              <span className="font-semibold">Username:</span> {user.user_name}
            </p>
            <p className="text-lg font-medium text-gray-800">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
          </div>
          <button
            onClick={handleUpdateClick}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 w-full"
          >
            Update Profile
          </button>
        </div>
      )}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-300 focus:border-indigo-500"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelClick}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
