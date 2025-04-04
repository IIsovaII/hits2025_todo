import Swal from "sweetalert2";
import {CreateTodoDto, Todo, TodoPriority, TodoStatus, UpdateTodoDto} from "../../models/todo.ts";

function dateToInput(date: Date | null) {
    const deadline = date? new Date(date): null;
    let formattedValue = null;
    if (deadline) {
        const year = deadline.getFullYear();
        const month = String(deadline.getMonth() + 1).padStart(2, '0');
        const day = String(deadline.getDate()).padStart(2, '0');
        const hours = String(deadline.getHours()).padStart(2, '0');
        const minutes = String(deadline.getMinutes()).padStart(2, '0');

        formattedValue= `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
        formattedValue = null;
    }
    return formattedValue;

}

const openEditTodoModal: (
    editTodo: (data: UpdateTodoDto) => Promise<Todo | undefined>, prevTodo: Todo
) => Promise<void> =
    async (editTodo: (data: UpdateTodoDto) => Promise<Todo | undefined>, prevTodo: Todo) => {

    // console.log(prevTodo.priority)
    const result = await Swal.fire({
        title: 'Изменение задачи',
        html: `
                <div class="swal2-input-group">
                    <label for="title">Название:</label>
                    <input id="title" class="swal2-input" placeholder="Название задачи" required minlength="4" value=${prevTodo.title}>
                    <p>Возможно использование макросов типа !before 31.12.2025 для deadline и !1 для priority</p>
                </div>
                <div class="swal2-input-group">
                    <label for="description">Описание:</label>
                    <textarea id="description" class="swal2-textarea" placeholder="Описание задачи" >${prevTodo.description}</textarea>
                </div>
                <div class="swal2-input-group">
                    <label for="deadline">Срок выполнения:</label>
                    <input type="datetime-local" id="deadline" class="swal2-input" value=${dateToInput(prevTodo.deadline)}>
                </div>
                <div class="swal2-input-group">
                    <label for="priority">Приоритет:</label>
                    <select id="priority" class="swal2-select"">
                        <option value="LOW" ${prevTodo.priority === "LOW" ? "selected" : ""}>Низкий</option>
                        <option value="MEDIUM" ${prevTodo.priority === "MEDIUM" ? "selected" : ""}>Средний</option>
                        <option value="HIGH" ${prevTodo.priority === "HIGH" ? "selected" : ""}>Высокий</option>
                        <option value="CRITICAL" ${prevTodo.priority === "CRITICAL" ? "selected" : ""}>Критический</option>
                    </select>
                </div>
            `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Изменить',
        cancelButtonText: 'Отмена',
        preConfirm: () => {
            const titleEl = Swal.getPopup()?.querySelector('#title') as HTMLInputElement;
            const deadlineEl = (Swal.getPopup()?.querySelector('#deadline') as HTMLInputElement).value || null
            const priorityEl = Swal.getPopup()?.querySelector('#priority') as HTMLSelectElement

            let deadlineInput = deadlineEl ? new Date(deadlineEl) : null;
            let titleInput = titleEl.value;
            let priorityInput = priorityEl.value;

            if (!titleInput) {
                Swal.showValidationMessage('Пожалуйста, введите название задачи');
                return false;
            }

            const dateRegex = /\s*!before:\s*(\d{1,2}[.-]\d{1,2}[.-]\d{4})\s*/;
            const matchDate = titleInput.match(dateRegex);
            if (matchDate) {
                titleInput = titleInput.replace(matchDate[0], '');
                const dateString = matchDate[1];

                let dateParts;

                if (dateString.includes('.')) {
                    dateParts = dateString.split('.');
                } else if (dateString.includes('-')) {
                    dateParts = dateString.split('-');
                }

                if (!dateParts || dateParts.length != 3) {
                    Swal.showValidationMessage('Указана некорректная дата deadline в макросе title');
                    return false;
                } else {
                    const day = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1;
                    const year = parseInt(dateParts[2]);

                    const date = new Date(year, month, day);

                    if (date.toString() == null || date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
                        Swal.showValidationMessage('Указана некорректная дата deadline в макросе title');
                        return false;
                    }

                    if (deadlineInput == null) {
                        deadlineInput = date;
                    }
                }
            }

            const priorityRegex = /\s*!(\d+)\s*/;
            const matchPriority = titleInput.match(priorityRegex);
            if (matchPriority) {
                titleInput = titleInput.replace(matchPriority[0], '');

                console.log(matchPriority);

                let titlePriority = "MEDIUM";
                switch (matchPriority[1]) {
                    case '1':
                        titlePriority = "CRITICAL"
                        break;
                    case '2':
                        titlePriority = "HIGH"
                        break;
                    case '3':
                        titlePriority = "MEDIUM"
                        break;
                    case '4':
                        titlePriority = "LOW"
                        break;
                    default:
                        Swal.showValidationMessage('Указана некорректная priority в макросе title 123');
                        return false;
                }
                if (priorityInput == "null") {
                    priorityInput = titlePriority;
                }
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
            await editTodo(todoData);
            await Swal.fire({
                icon: 'success',
                title: 'Задача изменена!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Не удалось изменить задачу';

            await Swal.fire({
                icon: 'error',
                title: 'Ошибка!',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        }
    }
};

export default openEditTodoModal;