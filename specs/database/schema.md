# Todo App Phase 2 - Database Schema Specification

## Database System
- **Primary Database**: Neon PostgreSQL (managed PostgreSQL)
- **ORM**: SQLModel (combines SQLAlchemy and Pydantic)
- **Connection**: Connection pooling with proper resource management

## Tables and Models

### 1. Users Table (`users`)
| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| username | VARCHAR(50) | UNIQUE, NOT NULL | User's chosen username |
| hashed_password | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| first_name | VARCHAR(50) | NULL | User's first name |
| last_name | VARCHAR(50) | NULL | User's last name |
| is_active | BOOLEAN | DEFAULT TRUE | Account activation status |
| is_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- idx_users_email: Index on email column for fast lookup
- idx_users_username: Index on username column for fast lookup

### 2. Tasks Table (`tasks`)
| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Unique task identifier |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Detailed task description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Task status ('pending', 'in_progress', 'completed') |
| priority | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | Task priority ('low', 'medium', 'high') |
| due_date | TIMESTAMP | NULL | Task due date |
| completed_at | TIMESTAMP | NULL | Completion timestamp |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) | Owner of the task |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- idx_tasks_user_id: Index on user_id for user-specific queries
- idx_tasks_status: Index on status for filtering
- idx_tasks_priority: Index on priority for sorting
- idx_tasks_due_date: Index on due_date for deadline queries

### 3. Refresh Tokens Table (`refresh_tokens`)
| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Token record identifier |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Refresh token hash |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) | Associated user |
| expires_at | TIMESTAMP | NOT NULL | Token expiration timestamp |
| is_revoked | BOOLEAN | DEFAULT FALSE | Revocation status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- idx_refresh_tokens_token: Index on token for fast lookup
- idx_refresh_tokens_user_id: Index on user_id for user-specific queries

## Relationships
- **Users ↔ Tasks**: One-to-Many (One user can have many tasks)
- **Users ↔ Refresh Tokens**: One-to-Many (One user can have multiple refresh tokens)

## Security Considerations
- All passwords must be hashed using BCrypt with appropriate salt
- Refresh tokens should be stored as hashed values
- Use parameterized queries to prevent SQL injection
- Apply proper access controls to ensure users only access their own data

## Performance Optimizations
- Primary keys use UUID for distributed systems compatibility
- Proper indexing on frequently queried columns
- Timestamps for audit trails and caching mechanisms
- Efficient foreign key constraints for relationship integrity

## Data Validation Rules
- Email format validation using standard regex
- Username length constraints (3-50 characters)
- Password strength requirements (minimum 8 characters with complexity)
- Task title length constraints (1-255 characters)
- Proper date validation for due dates and timestamps