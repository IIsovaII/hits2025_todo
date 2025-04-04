import Swal from "sweetalert2";
import {CreateTodoDto, TodoPriority, TodoStatus} from "../../models/todo.ts";

const openAddTodoModal: (
    createTodo: (data: CreateTodoDto) => Promise<void>
        ) => Promise<void> = async (createTodo: (data: CreateTodoDto) => Promise<void>) => {

        const result = await Swal.fire({
        title: 'Создать новую задачу',
        html: `
                <div class="swal2-input-group">
                    <label for="title">Название:</label>
                    <input id="title" class="swal2-input" placeholder="Название задачи" required minlength="4">
                    <p>Возможно использование макросов типа !before 31.12.2025 для deadline и !1 для priority</p>
                </div>
                <div class="swal2-input-group">
                    <label for="description">Описание:</label>
                    <textarea id="description" class="swal2-textarea" placeholder="Описание задачи"></textarea>
                </div>
                <div class="swal2-input-group">
                    <label for="deadline">Срок выполнения:</label>
                    <input type="datetime-local" id="deadline" class="swal2-input">
                </div>
                <div class="swal2-input-group">
                    <label for="priority">Приоритет:</label>
                    <select id="priority" class="swal2-select">
                        <option value="null" selected>Не выбрано</option>
                        <option value="LOW">Низкий</option>
                        <option value="MEDIUM" >Средний</option>
                        <option value="HIGH">Высокий</option>
                        <option value="CRITICAL">Критический</option>
                    </select>
                </div>
            `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Создать',
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

            const dateRegex = /\s*!before\s+(\d{1,2}[.-]\d{1,2}[.-]\d{4})\s*/;
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
            await createTodo(todoData);
            await Swal.fire({
                icon: 'success',
                title: 'Задача создана!',
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

export default openAddTodoModal;