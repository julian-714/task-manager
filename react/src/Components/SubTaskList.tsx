import React, { useCallback, useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../Services/ApiClients";
import { toast } from "react-toastify";

interface Task {
  id: number;
  title: string;
  is_completed: boolean;
}

const SubTaskList: React.FC<{ taskListId: number; isEdit?: boolean }> = ({
  taskListId,
  isEdit = true,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newSubTaskName, setNewSubTaskName] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
    useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/tasks`, {
        params: { task_list_id: taskListId },
      });
      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch tasks.");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [taskListId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleApiError = (message: string) => {
    console.error(message);
    toast.error("Something went wrong. Please try again.");
  };

  const handleApiSuccess = (successMessage: string) => {
    toast.success(successMessage);
    fetchTasks();
  };

  const addSubTask = async () => {
    if (!newSubTaskName.trim()) {
      return toast.warn("Subtask name cannot be empty.");
    }

    try {
      const response = await apiClient.post("/tasks", {
        task_list_id: taskListId,
        title: newSubTaskName,
      });
      if (response.data.success) {
        setTasks((prev) => [...prev, response.data.data]);
        setNewSubTaskName("");
        handleApiSuccess(response.data.message);
      } else {
        toast.warn(response.data.message);
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
      handleApiError("Error adding subtask");
    }
  };

  const handleEdit = async (taskId: number, updatedTitle: string) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, {
        title: updatedTitle,
      });
      if (response.data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, title: updatedTitle } : task
          )
        );
        setEditingTaskId(null); // Exit editing mode
        setEditingTaskTitle("");
        handleApiSuccess(response.data.message);
      } else {
        toast.warn(response.data.message || "Failed to edit subtask.");
      }
    } catch (error) {
      console.error("Error editing subtask:", error);
      handleApiError("Error editing subtask");
    }
  };

  const handleDelete = async () => {
    if (taskToDelete === null) return;

    try {
      const response = await apiClient.delete(`/tasks/${taskToDelete}`);
      if (response.data.success) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== taskToDelete)
        );
        handleApiSuccess(response.data.message);
      } else {
        toast.warn(response.data.message || "Failed to delete subtask.");
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
      handleApiError("Error deleting subtask");
    } finally {
      setIsConfirmDeleteOpen(false); // Close modal after deletion
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (taskId: number, currentStatus: boolean) => {
    try {
      const response = await apiClient.put(`/task/status-update/${taskId}`, {
        is_completed: currentStatus,
      });

      if (response.data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, is_completed: !currentStatus }
              : task
          )
        );
        handleApiSuccess("Task status updated!");
      } else {
        toast.warn(response.data.message || "Failed to update task status.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      handleApiError("Error updating task status");
    }
  };

  const confirmDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
    setTaskToDelete(null);
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <ul className="list-disc list-inside mb-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex items-center gap-2 ${
              task.is_completed ? "line-through text-gray-500" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={task.is_completed}
              onChange={(e) => handleStatusChange(task.id, e.target.checked)}
              className={`cursor-pointer ${isEdit ? "" : "hidden"}`}
            />
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  className="border rounded px-3 py-1 flex-grow"
                />
                <button
                  onClick={() => handleEdit(task.id, editingTaskTitle)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTaskId(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {task.title}
                <FaEdit
                  onClick={() => {
                    setEditingTaskId(task.id);
                    setEditingTaskTitle(task.title);
                  }}
                  size={18}
                  className={`text-yellow-500 cursor-pointer hover:text-yellow-600 mb-1 ${
                    isEdit ? "" : "hidden"
                  }`}
                />
                <FaTrash
                  onClick={() => confirmDelete(task.id)}
                  size={18}
                  className={`text-red-500 cursor-pointer hover:text-red-600 mb-1 ${
                    isEdit ? "" : "hidden"
                  }`}
                />
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Add new subtask */}
      <div
        className={`flex flex-col sm:flex-row items-center gap-2 ${
          isEdit ? "" : "hidden"
        }`}
      >
        <input
          type="text"
          placeholder="New Subtask Name..."
          value={newSubTaskName}
          onChange={(e) => setNewSubTaskName(e.target.value)}
          className="border rounded px-3 py-5 w-full sm:flex-grow"
        />
        <button
          onClick={addSubTask}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Subtask
        </button>
      </div>

      {/* Confirmation Modal for Deletion */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl mb-4">
              Are you sure you want to delete this subtask?
            </h2>
            <div className="flex gap-4 justify-end">
              <button
                onClick={closeConfirmDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubTaskList;
