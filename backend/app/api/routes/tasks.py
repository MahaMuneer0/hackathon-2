from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from app.database import get_session
from app.models.user import User
from app.models.task import Task, TaskCreate, TaskUpdate
from app.database.crud import create_task, get_task_by_id, get_tasks_by_user, update_task, delete_task
from app.core.auth import get_current_user
from app.schemas import TaskCreate as TaskCreateSchema, TaskUpdate as TaskUpdateSchema, TaskResponse, TaskListResponse
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=TaskListResponse)
async def get_tasks(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status_param: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    skip = (page - 1) * limit

    # Get tasks for the current user with filters
    tasks = get_tasks_by_user(
        session,
        current_user.id,
        skip=skip,
        limit=limit,
        status=status_param,
        priority=priority
    )

    # Count total tasks for pagination
    # We'll implement a simple count for now - in production you'd want a dedicated count function
    all_user_tasks = get_tasks_by_user(session, current_user.id)
    total = len(all_user_tasks)

    # Apply search filter if provided
    if search:
        tasks = [task for task in tasks if search.lower() in task.title.lower() or
                 (task.description and search.lower() in task.description.lower())]
        total = len([task for task in all_user_tasks if search.lower() in task.title.lower() or
                     (task.description and search.lower() in task.description.lower())])

    # Apply sorting if provided
    if sort:
        if sort.startswith("-"):
            reverse = True
            sort_field = sort[1:]
        else:
            reverse = False
            sort_field = sort

        if hasattr(Task, sort_field):
            tasks.sort(key=lambda x: getattr(x, sort_field), reverse=reverse)

    return TaskListResponse(
        items=[TaskResponse.model_validate(task) for task in tasks],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{id}", response_model=TaskResponse)

async def get_task(
    id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = get_task_by_id(session, id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    return TaskResponse.model_validate(task)


@router.post("", response_model=TaskResponse)

async def create_new_task(
    task_data: TaskCreateSchema,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Create task for the current user
    db_task = create_task(session, TaskCreate(**task_data.model_dump()), current_user.id)
    return TaskResponse.model_validate(db_task)


@router.put("/{id}", response_model=TaskResponse)
async def update_existing_task(
    id: str,
    task_data: TaskUpdateSchema,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = get_task_by_id(session, id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    updated_task = update_task(session, id, TaskUpdate(**task_data.model_dump(exclude_unset=True)))

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse.model_validate(updated_task)


@router.patch("/{id}/complete", response_model=TaskResponse)
async def complete_task(
    id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = get_task_by_id(session, id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # Update task to completed status
    task_update = TaskUpdate(status="completed", completed_at=datetime.utcnow())
    updated_task = update_task(session, id, task_update)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse.model_validate(updated_task)


@router.patch("/{id}/uncomplete", response_model=TaskResponse)
async def uncomplete_task(
    id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = get_task_by_id(session, id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # Update task to pending status and clear completed_at
    task_update = TaskUpdate(status="pending", completed_at=None)
    updated_task = update_task(session, id, task_update)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse.model_validate(updated_task)


@router.delete("/{id}")
async def delete_task(
    id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = get_task_by_id(session, id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    success = delete_task(session, id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}