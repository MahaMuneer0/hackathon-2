# Todo App Phase 2 - UI Components Specification

## Design Principles
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Consistency**: Reusable components with consistent styling and behavior
- **Performance**: Optimized loading times and smooth interactions
- **User Experience**: Intuitive navigation and clear feedback

## Color Palette
- **Primary**: #3B82F6 (Blue-500) - Main actions and highlights
- **Secondary**: #6B7280 (Gray-500) - Secondary actions and text
- **Success**: #10B981 (Emerald-500) - Success states and confirmations
- **Warning**: #F59E0B (Amber-500) - Warnings and alerts
- **Danger**: #EF4444 (Red-500) - Errors and destructive actions
- **Background**: #F9FAFB (Gray-50) - Main background
- **Surface**: #FFFFFF - Card and surface backgrounds
- **Text**: #1F2937 (Gray-800) - Main text
- **Text Secondary**: #6B7280 (Gray-500) - Secondary text

## Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Heading 1**: 2.5rem (40px), font-weight 700
- **Heading 2**: 2rem (32px), font-weight 600
- **Heading 3**: 1.5rem (24px), font-weight 600
- **Body Large**: 1.125rem (18px), font-weight 400
- **Body Regular**: 1rem (16px), font-weight 400
- **Body Small**: 0.875rem (14px), font-weight 400
- **Caption**: 0.75rem (12px), font-weight 400

## Component Specifications

### 1. Layout Components

#### Header
- **Purpose**: Navigation and user controls
- **Structure**:
  - Logo on left (clickable home link)
  - Navigation menu center (Dashboard, Profile, Settings)
  - User dropdown on right (avatar, name, logout)
- **Behavior**: Fixed at top, responsive hamburger menu on mobile
- **Props**:
  - `isLoggedIn: boolean`
  - `user: User | null`
  - `onLogout: () => void`

#### Sidebar
- **Purpose**: Secondary navigation and quick actions
- **Structure**:
  - Collapsible menu items (All Tasks, Pending, Completed, High Priority)
  - Quick add task button
  - User profile section
- **Behavior**: Collapsible on desktop, slide-in on mobile
- **Props**:
  - `isOpen: boolean`
  - `onToggle: () => void`
  - `activeTab: string`

#### Footer
- **Purpose**: Copyright and secondary links
- **Structure**:
  - Copyright notice centered
  - Links to Privacy Policy, Terms of Service
- **Props**: None required

### 2. Authentication Components

#### AuthLayout
- **Purpose**: Wrapper for auth pages with consistent layout
- **Structure**:
  - Centered card with logo, heading, and form
  - Background pattern or illustration
- **Props**:
  - `title: string`
  - `subtitle?: string`
  - `children: ReactNode`

#### LoginForm
- **Purpose**: User login form
- **Structure**:
  - Email/username input field
  - Password input field with visibility toggle
  - Remember me checkbox
  - Submit button
  - Forgot password link
  - Sign up link
- **Validation**: Real-time validation with error messages
- **Props**:
  - `onSubmit: (credentials: LoginCredentials) => void`
  - `isLoading: boolean`
  - `error?: string`

#### RegisterForm
- **Purpose**: User registration form
- **Structure**:
  - First name, last name inputs
  - Email input
  - Username input
  - Password input with strength indicator
  - Confirm password input
  - Submit button
  - Login link
- **Validation**: Real-time validation with error messages
- **Props**:
  - `onSubmit: (userData: RegisterData) => void`
  - `isLoading: boolean`
  - `error?: string`

### 3. Task Management Components

#### TaskCard
- **Purpose**: Display individual task information
- **Structure**:
  - Task title with priority indicator
  - Description (truncated if long)
  - Status badge (pending, in-progress, completed)
  - Due date with color coding
  - Action buttons (edit, complete, delete)
- **Variants**: Compact (for lists) and expanded (for detail view)
- **Props**:
  - `task: Task`
  - `onComplete: (taskId: string) => void`
  - `onEdit: (taskId: string) => void`
  - `onDelete: (taskId: string) => void`
  - `compact?: boolean`

#### TaskForm
- **Purpose**: Create or edit task form
- **Structure**:
  - Title input (required)
  - Description textarea
  - Priority selector (low, medium, high)
  - Status selector (pending, in-progress, completed)
  - Due date picker
  - Save and cancel buttons
- **Validation**: Required field validation
- **Props**:
  - `task?: Partial<Task>`
  - `onSubmit: (taskData: TaskFormData) => void`
  - `onCancel: () => void`
  - `isLoading: boolean`

#### TaskFilterBar
- **Purpose**: Filter and sort tasks
- **Structure**:
  - Status filter buttons
  - Priority filter buttons
  - Date range picker
  - Sort options dropdown
  - Search input
- **Props**:
  - `filters: TaskFilters`
  - `onFilterChange: (filters: TaskFilters) => void`
  - `onSearch: (query: string) => void`

#### TaskList
- **Purpose**: Display multiple tasks in a scrollable list
- **Structure**:
  - Scrollable container with infinite scrolling
  - Task cards
  - Loading spinner when fetching more tasks
  - Empty state when no tasks
- **Props**:
  - `tasks: Task[]`
  - `loading: boolean`
  - `hasMore: boolean`
  - `onLoadMore: () => void`
  - `onTaskAction: TaskActionHandler`

### 4. Dashboard Components

#### StatsOverview
- **Purpose**: Display task statistics
- **Structure**:
  - Total tasks count
  - Completed tasks percentage
  - Overdue tasks count
  - Upcoming tasks count
- **Visuals**: Cards with icons and progress indicators
- **Props**:
  - `stats: TaskStats`

#### QuickActions
- **Purpose**: Common task actions
- **Structure**:
  - Add new task button
  - Filter tasks button
  - Export tasks button
- **Props**:
  - `onAddTask: () => void`
  - `onFilter: () => void`

### 5. Modal Components

#### ConfirmationModal
- **Purpose**: Confirm destructive actions
- **Structure**:
  - Title and descriptive text
  - Confirmation and cancel buttons
  - Close button (X)
- **Props**:
  - `isOpen: boolean`
  - `title: string`
  - `message: string`
  - `onConfirm: () => void`
  - `onCancel: () => void`

#### TaskDetailModal
- **Purpose**: Show detailed task information
- **Structure**:
  - Task title and description
  - Status and priority badges
  - Due date and completion date
  - Action buttons (edit, complete, delete)
- **Props**:
  - `task: Task | null`
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onEdit: (taskId: string) => void`
  - `onComplete: (taskId: string) => void`
  - `onDelete: (taskId: string) => void`

### 6. Form Components

#### InputField
- **Purpose**: Standard text input with validation
- **Structure**:
  - Label
  - Input element
  - Helper text/error message
- **Variants**: Text, email, password, textarea
- **Props**:
  - `label: string`
  - `type?: 'text' | 'email' | 'password' | 'textarea'`
  - `value: string`
  - `onChange: (value: string) => void`
  - `error?: string`
  - `placeholder?: string`

#### SelectField
- **Purpose**: Dropdown selection with validation
- **Structure**:
  - Label
  - Select element
  - Helper text/error message
- **Props**:
  - `label: string`
  - `value: string`
  - `onChange: (value: string) => void`
  - `options: Array<{value: string, label: string}>`
  - `error?: string`

#### DatePicker
- **Purpose**: Date selection with calendar popup
- **Structure**:
  - Input field showing formatted date
  - Calendar icon
  - Popup calendar
- **Props**:
  - `value: Date | null`
  - `onChange: (date: Date | null) => void`
  - `placeholder?: string`
  - `error?: string`

### 7. Utility Components

#### LoadingSpinner
- **Purpose**: Indicate loading state
- **Structure**:
  - Animated circular spinner
- **Props**:
  - `size?: 'sm' | 'md' | 'lg'`
  - `className?: string`

#### Alert
- **Purpose**: Display important messages
- **Structure**:
  - Icon based on alert type
  - Message text
  - Optional close button
- **Variants**: Success, warning, error, info
- **Props**:
  - `type: 'success' | 'warning' | 'error' | 'info'`
  - `message: string`
  - `onClose?: () => void`

#### EmptyState
- **Purpose**: Display when no data is available
- **Structure**:
  - Illustration or icon
  - Descriptive message
  - Optional call-to-action button
- **Props**:
  - `icon?: ReactNode`
  - `title: string`
  - `description: string`
  - `action?: {text: string, onClick: () => void}`

## Responsive Breakpoints
- **Mobile**: 0px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

## Accessibility Features
- Keyboard navigation support (Tab, Enter, Space, Arrow keys)
- ARIA attributes for screen readers
- Sufficient color contrast ratios
- Focus indicators for interactive elements
- Semantic HTML structure
- Skip navigation links for screen readers

## State Management
- Global state for user authentication
- Local state for form inputs and UI interactions
- Context providers for theme and user preferences
- Client-side caching for improved performance

## Internationalization
- English as primary language
- Support for future localization
- Dynamic text content managed through translation files