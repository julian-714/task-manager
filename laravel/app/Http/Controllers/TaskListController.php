<?php

namespace App\Http\Controllers;

use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TaskListController extends Controller
{
    /**
     * Retrieve task lists belonging to the authenticated user.
     *
     * @return mixed Success response with the list of task lists or error message on failure.
     */
    public function index()
    {
        try {
            $taskLists = TaskList::where('user_id', Auth::id())->get();
            return $this->sendResponse($taskLists, __('Task lists found successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Store a new task list for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed Success response with the created task list or error message on failure.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $taskList = TaskList::create([
                'name' => $request->name,
                'user_id' => Auth::id(),
            ]);
            return $this->sendResponse($taskList, __('Task list added successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Display the specified task list for the authenticated user.
     *
     * @param  \App\Models\TaskList  $taskList
     * @return mixed Success response with the task list data or error message on failure.
     */
    public function show(TaskList $taskList)
    {
        try {
            $authUserId = Auth::id();
            $isAuthorized = $taskList->user_id === $authUserId ||
                $taskList->sharedUsers()
                ->where('user_id', $authUserId)
                ->wherePivot('is_edit', true)
                ->exists();

            if (!$isAuthorized) {
                return $this->sendError(__('Unauthorized!'), 403);
            }
            $taskList->load('user');
            return $this->sendResponse($taskList, __('Task list found successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Update the specified task list for the authenticated user or authorized shared user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\TaskList  $taskList
     * @return mixed Success response with the updated task list data or error message on failure.
     */
    public function update(Request $request, TaskList $taskList)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            if (Gate::denies('edit', $taskList)) {
                return response()->json(['message' => 'You do not have permission to edit this task list'], 403);
            }

            $taskList->update([
                'name' => $request->name,
            ]);
            return $this->sendResponse($taskList, __('Task list updated successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Delete the specified task list if the authenticated user or authorized shared user has permission.
     *
     * @param  \App\Models\TaskList  $taskList
     * @return mixed Success response if the task list is deleted, or error message on failure.
     */
    public function destroy(TaskList $taskList)
    {
        try {
            if (Gate::denies('edit', $taskList)) {
                return response()->json(['message' => 'You do not have permission to edit this task list'], 403);
            }
            $taskList->delete();
            return $this->sendResponse([], __('Task list deleted successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Share the specified task list with another user with the specified permissions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return mixed Success response if the task list is shared, or error message on failure.
     */
    public function shareTaskList(Request $request, $id)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'user_id' => 'required|exists:users,id|not_in:' . Auth::id()
            ],
            [
                'user_id.not_in' => __('You cannot share the task list with yourself.'),
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $taskList = TaskList::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$taskList) {
                return $this->sendError(__('Task list not found or unauthorized access!'), 404);
            }

            //  Attach the user to the task list with specified permissions
            $taskList->sharedUsers()->syncWithoutDetaching([
                $request->user_id => ['is_edit' => $request->is_edit],
            ]);

            return $this->sendResponse($taskList, __('Task list shared successfully!'));
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Retrieve the task lists shared with the authenticated user.
     *
     * @return mixed Response with shared task lists or error message if no shared task lists exist.
     */
    public function getSharedTaskLists()
    {
        try {
            // Get the authenticated user
            $user = Auth::user();

            // Fetch shared task lists for the authenticated user
            $sharedTaskLists = $user->sharedTaskLists()->get()->each(function ($taskList) {
                // Add is_edit flag from the pivot table to each task list
                $taskList->is_edit = $taskList->pivot->is_edit;
                $taskList->makeHidden('pivot'); // Hide pivot data from the response
            });
            $sharedTaskLists->each(function ($taskList) {
                $taskList->makeHidden('pivot');
            });
            // Check if there are any shared task lists
            if ($sharedTaskLists->isEmpty()) {
                return $this->sendError(__('No shared task lists found.'), 404);
            }

            // Return the shared task lists
            return $this->sendResponse($sharedTaskLists, __('Shared task lists retrieved successfully.'));
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }
}
