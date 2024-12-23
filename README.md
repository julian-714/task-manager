## About Project

This is a Task Management API built with Laravel, providing various endpoints to manage task lists, tasks, user authentication, and sharing of task lists among users.

## Features

- User Authentication (Register, Login, Logout)
- Task List Management (Create, Read, Update, Delete)
- Task Management (Create, Read, Update, Delete, Status update)
- Share Task List with Users
- Get Shared Task Lists
- User Profile Update

## Project Requirement

- PHP Version - v8.2.0
- Laravel Version - v11
- Database - Postgresql v17
- React Version - 18.3.1
- Typescript Version - 5.6.2
- Node Version - 23.3.0


## Project setup with docker
docker-compose up --build -d

## React App Without Docker

This is a React application created using TypeScript.

- To install the required packages, run the following command in your terminal: npm i

- Start the frontend server : npm run dev


## Laravel Setup Project In Local Without Docker

- git clone <repository-url>

- cd `repository`

- composer install

- Run `cp .env.example .env`

- Change below **.env** variable

    `DB_DATABASE=your_database_name`

    `DB_USERNAME=your_database_user_name`

    `DB_PASSWORD=your_database_password`

- Run chmod -R 777 bootstrap/cache/

- chmod -R 777 storage/

- php artisan key:generate

- php artisan migrate

- php artisan storage:link

- php artisan optimize:clear

- Run `php artisan serve`

## API End Points

1. User Registration
- Endpoint: POST /api/v1/register
- Description: Register a new user with email,username, name, and password.

2. User Login
- Endpoint: POST /api/v1/login
- Description: Login an existing user using email and password.

3. User Profile
- Endpoint: GET /api/v1/user
- Description: Get the authenticated user's profile.

4. Update User Profile
- Endpoint: POST /api/v1/user
- Description: Update the authenticated user's profile (name, username and email).

5. Get all users
- Endpoint: GET /api/v1/all-users
- Description: Get all users except authenticated user.

6. Logout User
- Endpoint: POST /api/v1/logout
- Description: Logout the authenticated user and invalidate their tokens.

7. Get All Task List
- Endpoint: GET /api/v1/task-lists
- Description: Get a all task list for the authenticated user.

8. Create Task List
- Endpoint: POST /api/v1/task-lists
- Description: Create a new task list for the authenticated user.

9. Show Task List
- Endpoint: GET /api/v1/task-lists/{id}
- Description: Retrieve a specific task list owned by the authenticated and authorized user.

10. Update Task List
- Endpoint: PUT /api/v1/task-lists/{id}
- Description: Update the task list name for the authenticated and authorized user.

11. Delete Task List
- Endpoint: DELETE /api/v1/task-lists/{id}
- Description: Delete a task list owned by the authenticated and authorized user.

12. Share Task List
- Endpoint: POST /api/v1/task-list/share/{id}
- Description: Share a task list with another user.

13. Get Shared Task Lists
- Endpoint: GET /api/v1/shared-task-lists
- Description: Get all task lists shared with the authenticated user.

14. Get tasks by task list
- Endpoint: GET /api/v1/tasks/?task_list_id={id}
- Description: Get all tasks of particular task list.

15. Create Task
- Endpoint: POST /api/v1/tasks
- Description: Create a new task of particular task list.

16. Show Task
- Endpoint: GET /api/v1/tasks/{id}
- Description: Retrieve a specific task of particular task list.

17. Update Task
- Endpoint: PUT /api/v1/tasks/{id}
- Description: Update the task name,status of particular task list.

18. Delete Task
- Endpoint: DELETE /api/v1/tasks/{id}
- Description: Delete a task of particular task list.

19. Update Task Status
- Endpoint: PUT /api/v1/task/status-update/{id}
- Description: Update task status of task.
