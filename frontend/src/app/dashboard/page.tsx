'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskAPI } from '@/lib/api';
import { isAuthenticated, removeTokens } from '@/lib/auth';
import { Task } from '@/types/types';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, []);

  // Calculate stats
  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAll();
      // Backend returns TaskListResponse directly: {items: [...], total, page, limit}
      setTasks(response.data.items || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    const overdue = tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) < new Date() &&
      t.status !== 'completed'
    ).length;

    setStats({ total, completed, pending, overdue });
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await taskAPI.create(taskData);
      // Backend returns TaskResponse directly
      setTasks([response.data, ...tasks]);
      setShowTaskForm(false);
    } catch (error: any) {
      console.error('Error creating task:', error);

      // Display error message to user
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.message ||
                          'Failed to create task. Please check your input.';
      alert(errorMessage); // In production, use a proper UI notification
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;

    try {
      const response = await taskAPI.update(editingTask.id, taskData);
      // Backend returns TaskResponse directly
      setTasks(tasks.map(t =>
        t.id === editingTask.id ? response.data : t
      ));
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const response = task.status === 'completed'
        ? await taskAPI.uncomplete(taskId)
        : await taskAPI.complete(taskId);

      // Backend returns TaskResponse directly
      setTasks(tasks.map(t =>
        t.id === taskId ? response.data : t
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setShowTaskForm(true);
    }
  };

  const handleLogout = () => {
    removeTokens();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Todo Dashboard</h1>
              </div>
              <nav className="ml-6 flex space-x-8">
                <a href="/dashboard" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.completed}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pending}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.overdue}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          <Button className='m-4 p-4' onClick={() => setShowTaskForm(true)}>
            Add New Task
          </Button>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new task.</p>
            <div className="mt-6">
              <Button  className='m-4 p-4' onClick={() => setShowTaskForm(true)}>
                Create your first task
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask || undefined}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}