<?php

namespace App\Policies;

use App\Models\TaskList;
use App\Models\User;

class TaskListPolicy
{
    /**
     * Determine whether the user can edit the task list.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\TaskList  $taskList
     * @return bool
     */
    public function edit(User $user, TaskList $taskList)
    {
        return $taskList->user_id === $user->id ||
            $taskList->sharedUsers()
            ->where('user_id', $user->id)
            ->wherePivot('is_edit', true)
            ->exists();
    }

    /**
     * Determine whether the user can view the task list.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\TaskList  $taskList
     * @return bool
     */
    public function view(User $user, TaskList $taskList)
    {
        return $taskList->user_id === $user->id ||
            $taskList->sharedUsers()
            ->where('user_id', $user->id)
            ->exists();
    }
}
