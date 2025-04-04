import React from 'react';
import {useTodos} from "../hooks/useTodos.ts";
import TodoList from '../components/TodoList/TodoList';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import openAddTodoModal from "../components/Modal/openAddTodoModal.tsx";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {SortingControls} from "../components/Components/SortingControls.tsx";

const TodosPage: React.FC = () => {
    const {
        sortConfigs,
        addSortCriteria,
        removeSortCriteria,
        updateSortCriteria,
        todos,
        isLoading,
        error,
        createTodo,
        updateTodo,
        deleteTodo,
        filters,
        updateFilters
    } = useTodos();

    const navigate: NavigateFunction = useNavigate();

    const handleToggle = async (id: string, completed: boolean) => {
        try {
            await updateTodo(id, {completed});
        } catch (err) {
            console.error('Error toggling todo:', err);
        }
    };

    const handleDeleteTodo = async (id: string) => {
        const result = await Swal.fire({
            title: 'Вы уверены?',
            text: "Эту операцию невозможно отменить!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Да, удалить!',
            cancelButtonText: 'Отмена'
        });

        if (result.isConfirmed) {
            try {
                await deleteTodo(id);
                await Swal.fire({
                    title: 'Удалено!',
                    text: 'Задача была успешно удалена.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                await Swal.fire({
                    title: 'Ошибка!',
                    text: 'Не удалось удалить задачу.' + (err as Error).message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    return (
        <div className="todos-page">

            <div className="todos-controls">
                <button
                    className="main-button"
                    onClick={() => openAddTodoModal(createTodo)}
                >
                    <i className="fa fa-plus"></i> Добавить задачу
                </button>

                <div className="filters">
                    <select
                        value={filters.status}
                        onChange={e => updateFilters({status: e.target.value as ('all' | 'active' | 'completed')})}
                        className="filter-select"
                    >
                        <option value="all">Все</option>
                        <option value="active">Активные</option>
                        <option value="completed">Завершенные</option>
                    </select>
                </div>


            </div>
            <SortingControls
                sortConfigs={sortConfigs}
                addSortCriteria={addSortCriteria}
                removeSortCriteria={removeSortCriteria}
                updateSortCriteria={updateSortCriteria}
            />

            {isLoading && <div className="loading-spinner">Загрузка...</div>}

            {error && <div className="error-message">{error}</div>}

            <TodoList
                todos={todos}
                onToggle={handleToggle}
                onDelete={handleDeleteTodo}
                navigate={navigate}
            />
        </div>
    );
};

export default TodosPage;