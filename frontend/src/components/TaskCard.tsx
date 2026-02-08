import React from 'react';
import { Task } from '@/types/types';
import { format } from 'date-fns';
import {
  Clock,
  Calendar,
  CheckCircle,
  Circle,
  AlertTriangle,
  Flag,
  MoreVertical
} from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onComplete,
  onDelete,
  compact = false
}) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className={clsx(
      "border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow",
      isOverdue && "border-red-200 bg-red-50",
      compact ? "flex items-center justify-between" : "space-y-3"
    )}>
      <div className={clsx(compact ? "flex-1 min-w-0" : "")}>
        <div className="flex items-start justify-between">
          <div className={clsx(compact ? "flex items-center space-x-2 min-w-0 flex-1" : "")}>
            <button
              onClick={() => onComplete(task.id)}
              className="flex-shrink-0"
              aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
            >
              {getStatusIcon()}
            </button>

            <div className={clsx(compact ? "min-w-0 flex-1" : "")}>
              <h3 className={clsx(
                "font-medium text-gray-900",
                task.status === 'completed' ? "line-through text-gray-500" : "",
                compact ? "truncate" : ""
              )}>
                {task.title}
              </h3>

              {!compact && task.description && (
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={clsx(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
              getPriorityColor()
            )}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </span>

            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!compact && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {task.due_date && (
                <div className={clsx("flex items-center", isOverdue ? "text-red-600" : "")}>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(task.due_date)}</span>
                  {isOverdue && <span className="ml-1">(overdue)</span>}
                </div>
              )}
              {task.status !== 'completed' && task.completed_at && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Completed {formatDate(task.completed_at)}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(task.id)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;