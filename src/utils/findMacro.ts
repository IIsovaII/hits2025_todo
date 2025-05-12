import {TodoPriority} from "../models/todo";

const findMacro = (title: string) => {
    let er: string = '';
    let deadline: Date | null = null;
    let priority: TodoPriority = TodoPriority.MEDIUM;
    if (!title) {
        er = "Пожалуйста, введите название задачи";
        return {title, deadline, priority, er};
    }

    const dateRegex = /\s*!before\s+(\d{1,2}[.-]\d{1,2}[.-]\d{4,})\s*/;
    const matchDate = title.match(dateRegex);
    if (matchDate) {

        const dateString = matchDate[1];

        let dateParts;

        if (dateString.includes('.')) {
            dateParts = dateString.split('.');
        } else if (dateString.includes('-')) {
            dateParts = dateString.split('-');
        }

        if (!dateParts || dateParts.length != 3) {
            er = 'Указана некорректная дата deadline в макросе title';
            return {title, deadline, priority, er};
        } else {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const year = parseInt(dateParts[2]);

            if (year < 1000 || year > 9999) {
                er = 'Указана некорректная дата deadline в макросе title';
                return {title, deadline: null, priority, er};
            }

            const date = new Date(year, month, day);

            if (date.toString() == null || date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
                er = 'Указана некорректная дата deadline в макросе title';
                return {title, deadline, priority, er};
            }

            deadline = date;
        }

        title = title.replace(matchDate[0], '');
    }

    const priorityRegex = /\s*!(-*\d+)\s*/;
    const matchPriority = title.match(priorityRegex);
    if (matchPriority) {
        title = title.replace(matchPriority[0], '');

        switch (matchPriority[1]) {
            case '1':
                priority = TodoPriority.CRITICAL
                break;
            case '2':
                priority = TodoPriority.HIGH
                break;
            case '3':
                priority = TodoPriority.MEDIUM
                break;
            case '4':
                priority = TodoPriority.LOW
                break;
            default:
                er = 'Указана некорректная priority в макросе title'
                return {title, deadline, priority, er};
        }
        title = title.replace(matchPriority[0], '');
    }

    return {title, deadline, priority, er};
}

export default findMacro;