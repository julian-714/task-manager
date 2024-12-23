<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user and issue an authentication token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed Response with user data and token or error message.
     */
    public function register(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'email' => 'required|max:320|email:rfc,strict,dns,spoof,filter|unique:users',
                'user_name' => 'required|min:3|max:255|unique:users',
                'password' => 'required|min:8|max:128|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/',
                'confirm_password' => 'same:password',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'user_name' => $request->user_name,
                'password' => Hash::make($request->password),
            ]);
            $token = $user->createToken('auth_token')->plainTextToken;

            $data['user'] = $user;
            $data['token'] = $token;

            return $this->sendResponse($data, __('Login Successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Log in a user and issue an authentication token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed Response with user data and token or error message.
     */
    public function login(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|email',
                'password' => 'required',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            $data['user'] = $user;
            $data['token'] = $token;

            return $this->sendResponse($data, __('Login Successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Get the authenticated user details.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed Response with the authenticated user's data.
     */
    public function user(Request $request)
    {
        return $this->sendResponse($request->user(), '');
    }

    /**
     * Update the authenticated user's profile information (name, email, and username).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'user_name' => 'required|string|min:3|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
            ]
        );

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first(), 400);
        }
        try {
            $user = $request->user();
            $user->update($request->only('name', 'email', 'user_name'));

            return $this->sendResponse(['user' => $user], 'Data found successfully!');
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }

    /**
     * Logout the authenticated user and invalidate their tokens.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            $request->user()->currentAccessToken()->delete();
            return $this->sendResponse([], 'Logout successfully');
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('messages.something_went_wrong'), 200);
        }
    }

    /**
     * Retrieve all users.
     * @return mixed Success response on updated status or error message on failure.
     */
    public function getAllUsers()
    {
        try {
            $users = User::where('id', '!=', Auth::id())->get();

            return $this->sendResponse($users, __('All users get successfully!'));
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return $this->sendError(__('Something went wrong!'), 500);
        }
    }
}
