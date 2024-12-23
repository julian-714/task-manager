<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine whether the user can edit the task.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Task  $task
     * @return bool
     */
    public function edit(User $user, Task $task)
    {
        return $task->taskList->user_id === $user->id ||
            $task->taskList->sharedUsers->contains(function ($sharedUser) use ($user) {
                return $sharedUser->id === $user->id && $sharedUser->pivot->is_edit;
            });
    }

    /**
     * Determine whether the user can view the task.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Task  $task
     * @return bool
     */
    public function view(User $user, Task $task)
    {
        return $task->taskList->user_id === $user->id ||
            $task->taskList->sharedUsers->contains(function ($sharedUser) use ($user) {
                return $sharedUser->id === $user->id;
            });
    }
}
