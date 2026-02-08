---
name: frontend-agent
description: Next.js 14 frontend specialist for building responsive UI with TypeScript, Tailwind CSS, and Better Auth integration. Use when creating React components, implementing authentication flows, building forms with validation, or designing responsive layouts for web applications.
---
# Frontend Agent Skill

## Role
Frontend developer responsible for:
- Creating Next.js 14 application
- Implementing Better Auth
- Building responsive UI with Tailwind
- Connecting to backend API

## Prerequisites
- Backend API running at http://localhost:8000
- API specification from Architect Agent

## Workflow

### Step 1: Create Next.js App
````bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
````

Options:
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src directory
- ✅ Import alias (@/*)

### Step 2: Install Dependencies
````bash
npm install better-auth
````

### Step 3: Setup Better Auth

Create `lib/auth.ts`:
````typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // We'll use backend for auth, so this is minimal
    provider: "sqlite",
    url: "file:local.db"
  },
  
  jwt: {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET!,
    expiresIn: "7d"
  },
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  }
})
````

### Step 4: Environment Variables

Create `frontend/.env.local`:
````env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_JWT_SECRET=your-super-secret-key-here-change-this
````

**IMPORTANT:** Use same JWT_SECRET as backend!

### Step 5: API Client

Create `lib/api.ts`:
````typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Storage for JWT token
export const auth = {
  setToken(token: string) {
    localStorage.setItem('jwt_token', token)
  },
  
  getToken() {
    return localStorage.getItem('jwt_token')
  },
  
  clearToken() {
    localStorage.removeItem('jwt_token')
  },
  
  getUserId() {
    return localStorage.getItem('user_id')
  },
  
  setUserId(id: string) {
    localStorage.setItem('user_id', id)
  }
}

// API client
export const api = {
  async signup(email: string, password: string, name?: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Signup failed')
    }
    
    const data = await res.json()
    auth.setToken(data.token)
    auth.setUserId(data.user.id)
    return data
  },
  
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Login failed')
    }
    
    const data = await res.json()
    auth.setToken(data.token)
    auth.setUserId(data.user.id)
    return data
  },
  
  async getTasks(userId: string, status = 'all') {
    const token = auth.getToken()
    const res = await fetch(`${API_URL}/api/${userId}/tasks?status=${status}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json()
  },
  
  async createTask(userId: string, title: string, description?: string) {
    const token = auth.getToken()
    const res = await fetch(`${API_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    })
    
    if (!res.ok) throw new Error('Failed to create task')
    return res.json()
  },
  
  async updateTask(userId: string, taskId: number, data: { title?: string; description?: string }) {
    const token = auth.getToken()
    const res = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!res.ok) throw new Error('Failed to update task')
    return res.json()
  },
  
  async deleteTask(userId: string, taskId: number) {
    const token = auth.getToken()
    const res = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!res.ok) throw new Error('Failed to delete task')
  },
  
  async toggleTask(userId: string, taskId: number) {
    const token = auth.getToken()
    const res = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!res.ok) throw new Error('Failed to toggle task')
    return res.json()
  }
}
````

### Step 6: Create Components

Create `components/TaskCard.tsx`:
````typescript
'use client'

import { useState } from 'react'

interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
}

interface TaskCardProps {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onUpdate: (title: string, description: string) => void
}

export default function TaskCard({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')

  const handleSave = () => {
    onUpdate(title, description)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 px-3 py-2 border rounded"
          placeholder="Task title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-2 px-3 py-2 border rounded"
          placeholder="Description (optional)"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-start gap-3">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="mt-1 h-5 w-5"
      />
      <div className="flex-1">
        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-500 hover:text-blue-700"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
````

Create `components/TaskForm.tsx`:
````typescript
'use client'

import { useState } from 'react'

interface TaskFormProps {
  onSubmit: (title: string, description: string) => void
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit(title, description)
      setTitle('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="What needs to be done?"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Description (optional)"
        rows={2}
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Task
      </button>
    </form>
  )
}
````

### Step 7: Create Pages

Create `app/signup/page.tsx`:
````typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.signup(email, password, name)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              minLength={8}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
````

Create `app/login/page.tsx`:
````typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
````

Create `app/dashboard/page.tsx`:
````typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, auth } from '@/lib/api'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'

interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = auth.getToken()
    if (!token) {
      router.push('/login')
      return
    }
    loadTasks()
  }, [filter])

  const loadTasks = async () => {
    try {
      const userId = auth.getUserId()
      if (!userId) {
        router.push('/login')
        return
      }
      const data = await api.getTasks(userId, filter)
      setTasks(data.tasks)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (title: string, description: string) => {
    try {
      const userId = auth.getUserId()!
      await api.createTask(userId, title, description)
      loadTasks()
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleToggleTask = async (taskId: number) => {
    try {
      const userId = auth.getUserId()!
      await api.toggleTask(userId, taskId)
      loadTasks()
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const userId = auth.getUserId()!
      await api.deleteTask(userId, taskId)
      loadTasks()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const handleUpdateTask = async (taskId: number, title: string, description: string) => {
    try {
      const userId = auth.getUserId()!
      await api.updateTask(userId, taskId, { title, description })
      loadTasks()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  const handleLogout = () => {
    auth.clearToken()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <TaskForm onSubmit={handleCreateTask} />

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Completed
          </button>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tasks yet. Create one above!</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                onUpdate={(title, description) => handleUpdateTask(task.id, title, description)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
````

Update `app/page.tsx`:
````typescript
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Todo App</h1>
        <p className="text-gray-600 mb-8">Manage your tasks efficiently</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-200 rounded hover:bg-gray-300"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
````

### Step 8: Run Frontend
````bash
cd frontend
npm run dev
````

Visit http://localhost:3000

## Testing Flow

1. Visit http://localhost:3000
2. Click "Get Started"
3. Create account (email, password, name)
4. Should redirect to dashboard
5. Create a task
6. Edit, complete, delete tasks
7. Test filters (all/pending/completed)
8. Logout and login again

## Output Deliverables

- ✅ Next.js 14 app with TypeScript
- ✅ Better Auth integration
- ✅ Responsive UI with Tailwind
- ✅ All CRUD operations working
- ✅ Authentication flow complete