import React from "react";
import {getDeadlineStatus, Todo} from "../../models/todo";
import '../../styles/Todo.css';
import {NavigateFunction} from "react-router-dom";

interface TodoItemProps {
    todo: Todo;
    onToggle: () => void;
    onDelete: () => void;
    navigate: NavigateFunction;
}


class TodoItem extends React.Component<TodoItemProps> {

    render() {
        const {todo, onToggle, onDelete, navigate} = this.props;

        const priorityClass: string = `priority-${todo.priority.toLowerCase()}`;

        const completedClass: '' | 'completed' = todo.completed ? 'completed' : '';

        const deadlineTime = getDeadlineStatus(todo);


        return (
            <div className={`todo-item ${priorityClass} ${completedClass} ${deadlineTime}`}
                 onDoubleClick={() => navigate(`todos/${todo.id}`)}
            >

                <div className="todo-header">
                    <div className="todo-checkbox">
                        <input
                            type="checkbox"
                            checked={todo.completed || false}
                            onChange={onToggle}
                            id={`todo-${todo.id}`}
                        />
                        <label htmlFor={`todo-${todo.id}`} className="custom-checkbox"></label>
                    </div>

                    <h4 className="todo-title">{todo.title}</h4>

                    <button className="delete-button" onClick={onDelete}>×</button>
                </div>

                {todo.description && (<div className="todo-description">{todo.description}</div>)}

                <div className="todo-footer">
                    {todo.priority && (
                        <span className={`todo-badge ${priorityClass}`}>{todo.priority}</span>
                    )}

                    {todo.status && (
                        <span className="todo-badge status">{todo.status}</span>
                    )}

                    {todo.deadline && (
                        <span className="todo-deadline">
                            {new Date(todo.deadline).toLocaleString(
                                "ru-RU",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                })}
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

export default TodoItem;