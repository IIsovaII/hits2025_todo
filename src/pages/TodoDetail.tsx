import {useNavigate, useParams} from 'react-router-dom';
import {useTodo} from "../hooks/useTodo.ts";
import Swal from "sweetalert2";
import TodoData from "../components/TodoList/TodoData.tsx";
import TodoModal from "../components/Modal/TodoModal.tsx";

const TodoDetailPage = () => {
        const {id} = useParams();
        const {
            todo,
            isLoading,
            error,
            updateTodo,
            deleteTodo
        } = useTodo(id);
        const navigate = useNavigate();

        const handleToggle = async (completed: boolean) => {
            try {
                await updateTodo({completed});
            } catch (err) {
                console.error('Error toggling todo:', err);
            }
        };

        const handleDeleteTodo = async () => {
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
                    await deleteTodo();
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
            <div>
                <h1>Детали задачи</h1>
                {isLoading && <div className="loading-spinner">Загрузка...</div>}
                {error && <div className="error-message">{error}</div>}

                {todo ? (
                    <>
                        <button
                            onClick={() => TodoModal(updateTodo, todo)}
                            className="main-button"
                        >
                            Редактировать задачу
                        </button>

                        <TodoData
                            todo={todo}
                            onToggle={() => handleToggle(!todo?.completed)}
                            onDelete={() => handleDeleteTodo()}>
                        </TodoData>
                    </>
                ) : (
                    <p>Нет такой задачи</p>
                )}


                <button
                    className="secondary-button"
                    onClick={() => navigate('/')}
                >
                    Назад к списку
                </button>
            </div>
        );
    }
;

export default TodoDetailPage;