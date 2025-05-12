import Swal from "sweetalert2";
import {CreateTodoDto, Todo, TodoPriority, TodoStatus} from "../../models/todo";
import findMacro from "../../utils/findMacro";
import { dateToInput } from '../../utils/dateFormatters';

const TodoModal: (createTodo: (data: CreateTodoDto) => Promise<void | Todo | undefined>, prevTodo: Todo | null) =>
    Promise<void> = async (createTodo: (data: CreateTodoDto) => Promise<void | Todo | undefined>, prevTodo: Todo | null) => {

        const result = await Swal.fire({
            title: (prevTodo == null ? 'Создать новую задачу' : 'Изменить задачу'),
            html: `
                <div class="swal2-input-group">
                    <label for="title">Название:</label>
                    <input id="title" class="swal2-input" placeholder="Название задачи" required minlength="4" value=${prevTodo ? prevTodo.title : ''}>
                    <p>Возможно использование макросов типа !before 31.12.2025 для deadline и !1 для priority</p>
                </div>
                <div class="swal2-input-group">
                    <label for="description">Описание:</label>
                    <textarea id="description" class="swal2-textarea" placeholder="Описание задачи">${prevTodo? prevTodo.description : ''}</textarea>
                </div>
                <div class="swal2-input-group">
                    <label for="deadline">Срок выполнения:</label>
                    <input type="date" id="deadline" class="swal2-input" value=${prevTodo? dateToInput(prevTodo.deadline): null}>
                </div>
                <div class="swal2-input-group">
                    <label for="priority">Приоритет:</label>
                    <select id="priority" class="swal2-select">
                        <option value="null" ${!prevTodo ? "selected" : ""}>Не выбрано</option>
                        <option value="LOW" ${prevTodo ? (prevTodo.priority === "LOW" ? "selected" : "") : ""}>Низкий</option>
                        <option value="MEDIUM" ${prevTodo ? (prevTodo.priority === "MEDIUM" ? "selected" : "") : ""}>Средний</option>
                        <option value="HIGH" ${prevTodo ? (prevTodo.priority === "HIGH" ? "selected" : "") : ""}>Высокий</option>
                        <option value="CRITICAL" ${prevTodo ? (prevTodo.priority === "LOW" ? "CRITICAL" : "") : ""}>Критический</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: (prevTodo? "Изменить" : 'Создать'),
            cancelButtonText: 'Отмена',
            preConfirm: () => {
                let titleInput = (Swal.getPopup()?.querySelector('#title') as HTMLInputElement).value;
                const deadlineEl = (Swal.getPopup()?.querySelector('#deadline') as HTMLInputElement).value || null
                let deadlineInput = deadlineEl ? new Date(deadlineEl) : null;
                let priorityInput = (Swal.getPopup()?.querySelector('#priority') as HTMLSelectElement).value;

                const macroArray = findMacro(titleInput);
                console.log(macroArray);

                if (macroArray.er != '') {
                    Swal.showValidationMessage(macroArray.er);
                    return false;
                }
                titleInput = macroArray.title;
                if (deadlineInput == null) {
                    deadlineInput = macroArray.deadline;
                }
                if (priorityInput == null || priorityInput == "null") {
                    priorityInput = macroArray.priority;
                }

                if (!titleInput) {
                    Swal.showValidationMessage('Пожалуйста, введите название задачи');
                    return false;
                }
                if (titleInput.length < 4) {

                    Swal.showValidationMessage('Минимальная длина название: 4 символа');
                    return false;
                }

                if (priorityInput == "null") {
                    priorityInput = "MEDIUM"
                }


                return {
                    title: titleInput,
                    description: (Swal.getPopup()?.querySelector('#description') as HTMLTextAreaElement).value,
                    deadline: deadlineInput,
                    priority: priorityInput
                };
            }
        });

        if (result.isConfirmed && result.value) {

            const todoData: CreateTodoDto = {
                title: result.value.title,
                description: result.value.description,
                completed: false,
                deadline: result.value.deadline,
                status: TodoStatus.ACTIVE,
                priority: result.value.priority as TodoPriority
            };


            try {
                await createTodo(todoData);
                await Swal.fire({
                    icon: 'success',
                    title: prevTodo? 'Задача изменена!': 'Задача создана!',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Не удалось создать задачу';

                await Swal.fire({
                    icon: 'error',
                    title: 'Ошибка!',
                    text: errorMessage,
                    confirmButtonText: 'OK'
                });
            }
        }
    };

export default TodoModal;