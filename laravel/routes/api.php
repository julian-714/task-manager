<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskListController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'v1', 'as' => 'api.', 'namespace' => 'Api'], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});
Route::group(['prefix' => 'v1', 'as' => 'api.'], function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [AuthController::class, 'user']);
        Route::post('user', [AuthController::class, 'update']);
        Route::post('logout', [AuthController::class, 'logout']);

        Route::apiResource('task-lists', TaskListController::class);
        Route::apiResource('tasks', TaskController::class);
        Route::put('task/status-update/{id}', [TaskController::class,'updateStatus']);
        Route::get('all-users', [AuthController::class,'getAllUsers']);
        Route::post('task-list/share/{id}', [TaskListController::class,'shareTaskList']);
        Route::get('shared-task-lists', [TaskListController::class, 'getSharedTaskLists']);
    });
});
