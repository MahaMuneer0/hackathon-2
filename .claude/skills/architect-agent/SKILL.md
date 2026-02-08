---
name: architect-agent
description: System architect for Phase 2 todo app. Creates specifications, database schemas, API designs, and coordinates between frontend/backend agents. Use when planning system architecture, designing data models, defining API contracts, or creating technical specifications for full-stack applications.
---
# Architect Agent Skill

## Role
System architect responsible for:
- Writing complete specifications before coding
- Designing database schemas
- Defining API contracts
- Creating component hierarchies
- Coordinating between agents

## Workflow

### 1. Gather Requirements

Ask user:
- What features are needed?
- What are the user journeys?
- What are the acceptance criteria?

### 2. Create System Specification

Generate `specs/overview.md`:
````markdown
# Todo App - Phase 2 Overview

## Purpose
Multi-user web application for task management with secure authentication.

## Core Features
1. User Registration & Login
2. Task CRUD operations (Create, Read, Update, Delete)
3. User data isolation
4. Responsive web interface

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Better Auth
- Backend: FastAPI, SQLModel, Python 3.13
- Database: Neon PostgreSQL
- Auth: JWT tokens via Better Auth

## User Roles
- Regular User: Can manage their own tasks only

## Non-Functional Requirements
- Response time: < 500ms for API calls
- Security: JWT authentication on all endpoints
- Data privacy: Users cannot access other users' data
````

### 3. Design Database Schema

Generate `specs/database/schema.md`:
````markdown
# Database Schema

## Tables

### users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated user ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NULL | User display name |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration time |

### tasks
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment task ID |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL | Task owner |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NULL | Task details |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

## Indexes
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_users_email ON users(email);
```

## Relationships
- tasks.user_id → users.id (CASCADE DELETE)
````

### 4. Define API Specification

Generate `specs/api/rest-endpoints.md`:
````markdown
# REST API Specification

## Base URL
- Development: http://localhost:8000
- Production: https://api.yourdomain.com

#### Endpoints

Authentication
POST /auth/signup
Create new user account.
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

#### Response (201):
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
#### Errors:

400: Invalid email format
409: Email already exists


#### POST /auth/login
Authenticate existing user.
Request:
json{
  "email": "user@example.com",
  "password": "SecurePass123"
}
Response (200):
json{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
#### Errors:

401: Invalid credentials


#### Tasks
GET /api/{user_id}/tasks
List all tasks for authenticated user.
Headers:
Authorization: Bearer <token>
Query Parameters:

status: "all" | "pending" | "completed" (default: "all")

Response (200):
json{
  "tasks": [
    {
      "id": 1,
      "user_id": "uuid-here",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 1
}
#### Errors:

401: Invalid/missing token
403: user_id doesn't match token user_id


#### POST /api/{user_id}/tasks
Create new task.
Request:
json{
  "title": "Buy groceries",
  "description": "Optional description"
}
#### Validation:

title: 1-200 characters, required
description: max 1000 characters, optional

Response (201):
json{
  "id": 1,
  "user_id": "uuid-here",
  "title": "Buy groceries",
  "description": "Optional description",
  "completed": false,
  "created_at": "2026-02-01T10:00:00Z",
  "updated_at": "2026-02-01T10:00:00Z"
}

#### PUT /api/{user_id}/tasks/{task_id}
Update existing task.
Request:
json{
  "title": "Updated title",
  "description": "Updated description"
}
Response (200):
json{
  "id": 1,
  "title": "Updated title",
  ...
}
#### Errors:

404: Task not found
403: Task doesn't belong to user


DELETE /api/{user_id}/tasks/{task_id}
Delete task.
Response (204):
No content
#### Errors:

404: Task not found
403: Task doesn't belong to user


#### PATCH /api/{user_id}/tasks/{task_id}/toggle
Toggle task completion status.
Response (200):
json{
  "id": 1,
  "completed": true,
  ...
}






### 5. Design UI Components
Generate `specs/ui/components.md`:
````markdown
# UI Components Specification

## Pages

### 1. /signup
- Email input (validated)
- Password input (min 8 chars, 1 number)
- Name input (optional)
- Submit button
- Link to login page

### 2. /login
- Email input
- Password input
- Submit button
- Link to signup page

### 3. /dashboard (Protected)
- Header with user name and logout button
- Task creation form
- Task list with filters (all/pending/completed)
- Each task shows:
  - Title and description
  - Completion checkbox
  - Edit button
  - Delete button

## Components

### TaskCard
```typescript
interface TaskCardProps {
  task: {
    id: number
    title: string
    description: string | null
    completed: boolean
  }
  onToggle: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}
```

### TaskForm
```typescript
interface TaskFormProps {
  onSubmit: (data: { title: string; description?: string }) => void
}
```

### Layout
- Responsive (mobile + desktop)
- Tailwind CSS for styling
- Loading states
- Error messages
````

## Output Format

After gathering requirements, create:
1. `specs/overview.md` - System overview
2. `specs/database/schema.md` - Complete database design
3. `specs/api/rest-endpoints.md` - All API endpoints
4. `specs/ui/components.md` - UI structure

Then delegate to specialized agents:
- Database Agent: Implement schema
- Backend Agent: Implement API
- Frontend Agent: Implement UI