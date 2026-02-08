# Todo App Phase 2 - REST API Endpoints Specification

## API Base URL
`https://api.todoapp.com/v1` or `http://localhost:8000/v1` for development

## Authentication
All protected endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token_here>
```

## Response Format
Standard JSON responses with consistent structure:

Success response:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional error details */ }
  }
}
```

## Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account
- **Description**: Creates a new user account with hashed password
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2023-01-01T00:00:00Z"
  },
  "message": "User registered successfully"
}
```
- **Validation**:
  - Email must be valid format
  - Username 3-50 characters, alphanumeric + underscore/hyphen
  - Password minimum 8 characters with uppercase, lowercase, number, special char
  - First/last name max 50 characters

#### POST /auth/login
Authenticate user and return JWT tokens
- **Description**: Validates credentials and returns access/refresh tokens
- **Authentication**: None
- **Request Body**:
```json
{
  "email_or_username": "johndoe",
  "password": "SecurePassword123!"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "message": "Login successful"
}
```

#### POST /auth/logout
Invalidate refresh token
- **Description**: Logs out user by invalidating refresh token
- **Authentication**: Bearer token
- **Request Body**: None
- **Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/refresh
Refresh access token using refresh token
- **Description**: Generate new access token using valid refresh token
- **Authentication**: None (uses refresh token in body)
- **Request Body**:
```json
{
  "refresh_token": "current_refresh_token"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_access_token",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "message": "Token refreshed successfully"
}
```

#### GET /auth/me
Get current user profile
- **Description**: Retrieve authenticated user's profile information
- **Authentication**: Bearer token
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "User profile retrieved successfully"
}
```

### Task Management Endpoints

#### GET /tasks
Retrieve user's tasks with pagination and filtering
- **Description**: Get list of tasks for authenticated user
- **Authentication**: Bearer token
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `status`: Filter by status (pending, in_progress, completed)
  - `priority`: Filter by priority (low, medium, high)
  - `sort`: Sort by field (created_at, updated_at, due_date, priority) + direction (asc, desc)
  - `search`: Search term for title/description
- **Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid-string",
        "title": "Task title",
        "description": "Task description",
        "status": "pending",
        "priority": "high",
        "due_date": "2023-12-31T23:59:59Z",
        "completed_at": null,
        "user_id": "user-uuid",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "message": "Tasks retrieved successfully"
}
```

#### POST /tasks
Create a new task
- **Description**: Create a new task for authenticated user
- **Authentication**: Bearer token
- **Request Body**:
```json
{
  "title": "New task title",
  "description": "Task description (optional)",
  "status": "pending", // default
  "priority": "medium", // default
  "due_date": "2023-12-31T23:59:59Z" // optional
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "new-task-uuid",
    "title": "New task title",
    "description": "Task description (optional)",
    "status": "pending",
    "priority": "medium",
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": null,
    "user_id": "authenticated-user-uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Task created successfully"
}
```

#### GET /tasks/{task_id}
Get a specific task
- **Description**: Retrieve a specific task by ID
- **Authentication**: Bearer token
- **Path Parameter**: `task_id` - UUID of the task
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",
    "priority": "high",
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": null,
    "user_id": "user-uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Task retrieved successfully"
}
```

#### PUT /tasks/{task_id}
Update a specific task
- **Description**: Update properties of a specific task
- **Authentication**: Bearer token
- **Path Parameter**: `task_id` - UUID of the task
- **Request Body** (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z",
  "completed_at": "2023-01-02T10:00:00Z"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": "2023-01-02T10:00:00Z",
    "user_id": "user-uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T10:00:00Z"
  },
  "message": "Task updated successfully"
}
```

#### PATCH /tasks/{task_id}/complete
Mark a task as completed
- **Description**: Update task status to completed
- **Authentication**: Bearer token
- **Path Parameter**: `task_id` - UUID of the task
- **Request Body**: None
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "completed",
    "priority": "high",
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": "2023-01-02T10:00:00Z",
    "user_id": "user-uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T10:00:00Z"
  },
  "message": "Task marked as completed"
}
```

#### PATCH /tasks/{task_id}/uncomplete
Mark a task as incomplete
- **Description**: Update task status to pending
- **Authentication**: Bearer token
- **Path Parameter**: `task_id` - UUID of the task
- **Request Body**: None
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",
    "priority": "high",
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": null,
    "user_id": "user-uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T10:00:00Z"
  },
  "message": "Task marked as incomplete"
}
```

#### DELETE /tasks/{task_id}
Delete a specific task
- **Description**: Remove a task from the system
- **Authentication**: Bearer token
- **Path Parameter**: `task_id` - UUID of the task
- **Response**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Invalid token
- `AUTH_004`: Account inactive
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `UNAUTHORIZED_ACCESS`: Attempt to access another user's resources
- `INTERNAL_ERROR`: Server error occurred

## Rate Limiting
- Auth endpoints: 10 attempts per hour per IP
- API endpoints: 1000 requests per hour per user
- Exceeding limits results in 429 Too Many Requests response