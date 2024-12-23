import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaRegShareSquare,
} from "react-icons/fa";
import SubTaskList from "./SubTaskList";
import apiClient from "../Services/ApiClients";
import { toast } from "react-toastify";

interface User {
  id: number;
  name: string;
  user_name: string;
}
interface SubTask {
  id?: number;
  name: string;
  completed?: boolean;
}

interface Task {
  id?: number;
  name: string;
  is_completed?: boolean; // This line should be added to the Task interface
  subTasks?: SubTask[];
  title: string;
}
interface TaskList {
  id: number;
  name: string;
  tasks?: Task[];
  is_edit: boolean;
}

const TaskManagement: React.FC = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [sharedTask, setSharedTask] = useState<TaskList[]>([]);
  const [openPanels, setOpenPanels] = useState<Record<number, boolean>>({});
  const [newTaskListName, setNewTaskListName] = useState("");
  const [editTaskListId, setEditTaskListId] = useState<number | null>(null);
  const [editTaskListName, setEditTaskListName] = useState("");
  const [shareTaskWithEdit, setshareTaskWithEdit] = useState<
    Record<number, boolean>
  >({});

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedTaskListId, setSelectedTaskListId] = useState<number | null>(
    null
  );

  const fetchTaskLists = useCallback(async () => {
    try {
      const response = await apiClient.get("/task-lists");
      if (response.data.success) {
        setTaskLists(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching task lists:", error);
    }
  }, []);

  const fetchSharedTask = useCallback(async () => {
    const response = await apiClient.get("/shared-task-lists");
    if (response.data.success) {
      setSharedTask(response.data.data);
    } else {
      toast.error("Failed to fetch shared tasks.");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiClient.get("/all-users");
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
  }, []);

  useEffect(() => {
    fetchTaskLists();
    fetchUsers();
    fetchSharedTask();
  }, [fetchSharedTask, fetchTaskLists, fetchUsers]);

  const togglePanel = useCallback((listId: number) => {
    setOpenPanels((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  }, []);

  const addTaskList = useCallback(async () => {
    if (!newTaskListName.trim()) return;

    try {
      const response = await apiClient.post("/task-lists", {
        name: newTaskListName,
      });
      if (response.data.success) {
        setTaskLists((prev) => [...prev, response.data.data]);
        setNewTaskListName("");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error adding task list:", error);
      toast.error("Failed to add Task List.");
    }
  }, [newTaskListName]);

  const editTaskList = useCallback(
    async (listId: number) => {
      if (!editTaskListName.trim()) return;

      try {
        const response = await apiClient.put(`/task-lists/${listId}`, {
          name: editTaskListName,
        });
        if (response.data.success) {
          setTaskLists((prev) =>
            prev.map((list) =>
              list.id === listId ? { ...list, name: editTaskListName } : list
            )
          );
          setEditTaskListId(null);
          setEditTaskListName("");
          toast.success(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to edit Task List.");
      }
    },
    [editTaskListName]
  );

  const deleteTaskList = useCallback(async () => {
    if (taskToDelete === null) return;

    try {
      const response = await apiClient.delete(`/task-lists/${taskToDelete}`);
      if (response.data.success) {
        setTaskLists((prev) => prev.filter((list) => list.id !== taskToDelete));
        toast.success(response.data.message);
        setIsConfirmDeleteOpen(false);
      }
    } catch (error) {
      console.error("Error deleting task list:", error);
      toast.error("Failed to delete Task List.");
      setIsConfirmDeleteOpen(false);
    }
  }, [taskToDelete]);

  const confirmDelete = (listId: number) => {
    setTaskToDelete(listId);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
    setTaskToDelete(null);
  };

  const handleShareClick = (listId: number) => {
    setSelectedTaskListId(listId);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
  };

  const shareTaskWithUser = async (userId: number) => {
    const taskId = selectedTaskListId;

    try {
      const data: { user_id: string; is_edit: string } = {
        user_id: String(userId),
        is_edit: String(shareTaskWithEdit[userId] ?? false),
      };

      const response = await apiClient.post(
        `http://127.0.0.1:8000/api/v1/task-list/share/${taskId}`,
        data
      );

      if (response.data.success) {
        toast.success(response.data.message);
        closeUserModal();
      } else {
        toast.error("Failed to share the task.");
      }
    } catch (error) {
      console.error("Error sharing task:", error);
      toast.error("An error occurred while sharing the task.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
        Task Management
      </h1>

      {/* Add New Task List */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New Task List Name..."
          value={newTaskListName}
          onChange={(e) => setNewTaskListName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={addTaskList}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Task List
        </button>
      </div>

      {/* Task Lists */}
      {taskLists.map((list) => (
        <div
          key={list.id}
          className="border rounded-lg overflow-hidden shadow-md"
        >
          <div className="flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200">
            {editTaskListId === list.id ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editTaskListName}
                  onChange={(e) => setEditTaskListName(e.target.value)}
                  className="border rounded px-3 py-2 flex-grow"
                />
                <button
                  onClick={() => editTaskList(list.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditTaskListId(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                className="flex justify-between items-center w-full cursor-pointer"
                onClick={() => togglePanel(list.id)}
              >
                <h2 className="text-lg font-bold">{list.name}</h2>
                <div className="flex gap-3">
                  <FaRegShareSquare
                    className="text-green-500 cursor-pointer hover:text-yellow-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareClick(list.id);
                    }}
                  />
                  <FaEdit
                    className="text-yellow-500 cursor-pointer hover:text-yellow-600"
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTaskListId(list.id);
                      setEditTaskListName(list.name);
                    }}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-600"
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(list.id);
                    }}
                  />
                  {openPanels[list.id] ? (
                    <FaChevronUp size={18} />
                  ) : (
                    <FaChevronDown size={18} />
                  )}
                </div>
              </div>
            )}
          </div>

          {openPanels[list.id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="p-4 bg-white space-y-4"
            >
              <SubTaskList taskListId={list.id} />
            </motion.div>
          )}
        </div>
      ))}

      {/* Shared Task Section */}
      {/* Shared Task Section */}
      {sharedTask.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Shared Tasks
          </h2>
          {sharedTask.map((list) => (
            <div
              key={list.id}
              className="border rounded-lg overflow-hidden shadow-md mb-4"
            >
              <div className="p-4 bg-gray-100">
                <h3 className="text-lg font-bold">{list.name}</h3>

                {/* Render subtasks under each shared task */}
                <SubTaskList taskListId={list.id} isEdit={list?.is_edit} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl mb-4">
              Are you sure you want to delete this task list?
            </h2>
            <div className="flex gap-4 justify-end">
              <button
                onClick={closeConfirmDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={deleteTaskList}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                User List
              </h2>
              <button
                onClick={closeUserModal}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {user.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <div>
                      <input
                        type="checkbox"
                        checked={shareTaskWithEdit[user.id] || false}
                        onChange={(e) =>
                          setshareTaskWithEdit({
                            ...shareTaskWithEdit,
                            [user.id]: e.target.checked,
                          })
                        }
                      />
                      Edit
                    </div>
                    <button
                      onClick={() => shareTaskWithUser(user.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right">
              <button
                onClick={closeUserModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
