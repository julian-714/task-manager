<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * Retrieve tasks for the specified task list.
     *
     * @param \Illuminate\Http\Request $request The incoming request containing the task list ID as a query parameter.
     * @return mixed Success response with the list of tasks or error message on failure.
     */
    public function index(Request $request)
    {
        try {
            $taskListId = $request->query('task_list_id');

            if (!$taskListId) {
                return $this->sendError(__('task_list_id is required!'), 400);
            }

            $taskList = TaskList::find($taskListId);
            $authUserId = Auth::id();
            $isAuthorized = $taskList->user_id === $authUserId ||
                $taskList->sharedUsers()
                ->where('user_id', $authUserId)
                ->exists();

            if (!$isAuthorized) {
                return $this->sendError(__('Unauthorized! You do not have access to this task.'), 403);
            }

            $taskLists = Task::where('task_list_id', $taskListId)->get();
            return $this->sendResponse($taskLists, __('Tasks found successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Store a new task in the specified task list if the authenticated user has access.
     *
     * @param \Illuminate\Http\Request $request The incoming request containing task details.
     * @return mixed Success response with the created task or error message on failure.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'task_list_id' => [
                    'required',
                    'exists:task_lists,id',
                    function ($attribute, $value, $fail) {
                        // Custom validation to check if the task_list belongs to the authenticated user
                        $taskList = TaskList::find($value);
                        if (!$taskList) {
                            $fail(__('Task list not found.'));
                        }

                        // Check if the task list belongs to the authenticated user
                        if ($taskList->user_id !== Auth::id()) {
                            // Check if the task list is shared with the authenticated user
                            $isShared = $taskList->sharedUsers()->where('user_id', Auth::id())->wherePivot('is_edit', true)
                            ->exists();
                            if (!$isShared) {
                                $fail(__('This task list does not belong to the authenticated user, and it is not shared.'));
                            }
                        }
                    },
                ],
                'title' => 'required|string|max:255',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $taskList = Task::create([
                'title' => $request->title,
                'task_list_id' => $request->task_list_id,
            ]);
            return $this->sendResponse($taskList, __('Task added successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Display the details of a task if the authenticated user has access.
     *
     * @param \App\Models\Task $task The task to be displayed.
     * @return mixed Success response with the task details or error message on failure.
     */
    public function show(Task $task)
    {
        try {
            $taskListId = $task->task_list_id;

            $taskList = TaskList::find($taskListId);
            if (!$taskList) {
                return $this->sendError(__('Task list not found.'), 404);
            }

            if (Gate::denies('view', $task)) {
                return $this->sendError(['message' => 'You do not have permission to view this task'], 403);
            }
            return $this->sendResponse($task, __('Task found successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Update a task if the authenticated user has access.
     *
     * @param \Illuminate\Http\Request $request The incoming request containing task data.
     * @param \App\Models\Task $task The task to be updated.
     * @return mixed Success response with the updated task or error message on failure.
     */
    public function update(Request $request, Task $task)
    {
        $taskListId = $task->task_list_id;

        $taskList = TaskList::find($taskListId);
        if (!$taskList) {
            return $this->sendError(__('Task list not found.'), 404);
        }

        if (Gate::denies('edit', $task)) {
            return $this->sendError(['message' => 'You do not have permission to edit this task'], 403);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'title' => 'required|string|max:255',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $updateData = [
                'title' => $request->title,  // Always update title
            ];

            // Only update `is_completed` if it's provided in the request
            if ($request->has('is_completed')) {
                $updateData['is_completed'] = $request->is_completed;
            }

            $task->update($updateData);

            return $this->sendResponse($task, __('Task updated successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Delete a task if the authenticated user has access.
     *
     * @param \App\Models\Task $task The task to be deleted.
     * @return mixed Success response on deletion or error message on failure.
     */
    public function destroy(Task $task)
    {
        $taskListId = $task->task_list_id;

        $taskList = TaskList::find($taskListId);
        if (!$taskList) {
            return $this->sendError(__('Task list not found.'), 404);
        }

        if (Gate::denies('edit', $task)) {
            return $this->sendError(['message' => 'You do not have permission to edit this task'], 403);
        }

        try {
            $task->delete();

            return $this->sendResponse([], __('Task deleted successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Update the completion status of a task.
     *
     * @param \Illuminate\Http\Request $request The request containing `is_completed`.
     * @param int $id The ID of the task to update.
     * @return mixed Success response on updated status or error message on failure.
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'is_completed' => 'required|boolean',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $task = Task::find($id);

            if (!$task) {
                return $this->sendError(__('Task not found!'), 404);
            }

            if (Gate::denies('edit', $task)) {
                return $this->sendError(['message' => 'You do not have permission to edit this task'], 403);
            }

            $task->update([
                'is_completed' => $request->is_completed
            ]);

            return $this->sendResponse([], __('Task status updated successfully!'));
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }
}
