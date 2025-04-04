import React from "react";
import TodoItem from "./TodoItem";
import { Todo } from "../../models/todo";
import "../../styles/TodosPage.css"
import {NavigateFunction} from "react-router-dom";

interface TodoListProps {
    todos: Todo[];
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    navigate: NavigateFunction
}

class TodoList extends React.Component<TodoListProps> {
    render() {
        const { todos, onToggle, onDelete, navigate } = this.props;

        if (!todos || todos.length === 0) {
            return (
                <div className="todo-list-empty">
                    <h2>Список задач</h2>
                    <p>Задачи не найдены</p>
                </div>
            );
        }

        return (
            <div className="todo-list">
                <h2>Список задач</h2>
                <div className="todo-items">
                    {todos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={() => onToggle(todo.id, !todo.completed)}
                            onDelete={() => onDelete(todo.id)}
                            navigate={navigate}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default TodoList;