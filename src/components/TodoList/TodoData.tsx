import React from "react";
import {getDeadlineStatus, Todo} from "../../models/todo";
import '../../styles/Todo.css'

interface TodoDataProps {
    todo: Todo;
    onToggle: () => void;
    onDelete: () => void;
}


class TodoData extends React.Component<TodoDataProps> {

    render() {
        const {todo, onToggle, onDelete} = this.props;
        
        const priorityClass: string = `priority-${todo.priority.toLowerCase()}`;
        const completedClass: '' | 'completed' = todo.completed ? 'completed' : '';
        const deadlineTime = getDeadlineStatus(todo);


        return (
            <div className={`todo-data ${priorityClass} ${completedClass} ${deadlineTime}`}
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

                    <button className="delete-button" onClick={onDelete}>×</button>
                </div>

                <table className="attributes-table">
                    <tr>
                        <td className="attribute-name">Название задачи:</td>
                        <td className="attribute-value">{todo.title}</td>
                    </tr>
                    <tr>
                        <td className="attribute-name">Описание задачи:</td>
                        <td className="attribute-value">{todo.description}</td>
                    </tr>
                    <tr>
                        <td className="attribute-name">Deadline:</td>
                        <td className={`attribute-value ${deadlineTime}`}>
                            {todo.deadline ? (
                                    <text>{new Date(todo.deadline).toLocaleString(
                                        "ru-RU",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            // hour: "numeric",
                                            // minute: "numeric",
                                        })}
                                    </text>
                                ) :
                                <text>Не установлен</text>
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="attribute-name">Статус задачи:</td>
                        <td className="attribute-value">{todo.status}</td>
                    </tr>
                    <tr>
                        <td className="attribute-name">Приоритет задачи:</td>
                        <td className={`attribute-value ${priorityClass} `}>{todo.priority}</td>
                    </tr>
                    <tr>
                        <td className="attribute-name">Дата создания задачи: </td>
                        <td className="attribute-value">{new Date(todo.createdAt).toLocaleString(
                            "ru-RU",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                // hour: "numeric",
                                // minute: "numeric",
                            })}</td>
                    </tr>
                    <tr>
                        <td className="attribute-name">Дата редактирования задачи: </td>
                        <td className="attribute-value">{todo.updatedAt ? new Date(todo.updatedAt).toLocaleString(
                            "ru-RU",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                // hour: "numeric",
                                // minute: "numeric",
                            }) : null}</td>
                    </tr>
                </table>
            </div>
        );
    }
}

export default TodoData;