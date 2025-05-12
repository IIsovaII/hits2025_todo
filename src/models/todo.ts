export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt?: Date;
    deadline: Date | null;
    status: TodoStatus;
    priority: TodoPriority;
}

export enum TodoStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    LATE = 'LATE',
    OVERDUE = 'OVERDUE',
}

export enum TodoPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export type CreateTodoDto = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTodoDto = Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;

export interface TodoFilters {
    searchText?: string;
    status?: 'all' | 'active' | 'completed';
    priority?: TodoPriority | 'all';
    category?: string | 'all';
}

export interface SortConfig<T> {
    key: keyof T;
    direction?: 'asc' | 'desc';
}

export const sortTodos = (array: Todo[], config: SortConfig<Todo> | SortConfig<Todo>[]): Todo[] => {
    const sortedArray = [...array];
    const configs = Array.isArray(config) ? config : [config];

    const priorityOrder = {
        [TodoPriority.CRITICAL]: 3,
        [TodoPriority.HIGH]: 2,
        [TodoPriority.MEDIUM]: 1,
        [TodoPriority.LOW]: 0
    };

    return sortedArray.sort((a, b) => {
        for (const {key, direction = 'asc'} of configs) {
            if (key === 'priority') {
                const priorityA = priorityOrder[a.priority];
                const priorityB = priorityOrder[b.priority];

                if (priorityA < priorityB) return direction === 'asc' ? -1 : 1;
                if (priorityA > priorityB) return direction === 'asc' ? 1 : -1;
                continue;
            }

            const valueA = a[key] ?? '';
            const valueB = b[key] ?? '';

            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
};

export const filterTodos = (todos: Todo[], filters: TodoFilters): Todo[] => {
    return todos.filter(todo => {
        if (filters.searchText &&
            !todo.title.toLowerCase().includes(filters.searchText.toLowerCase()) &&
            !todo.description?.toLowerCase().includes(filters.searchText.toLowerCase())) {
            return false;
        }

        if (filters.status === 'active' && todo.completed) return false;
        if (filters.status === 'completed' && !todo.completed) return false;

        if (filters.priority && filters.priority !== 'all' && todo.priority !== filters.priority) {
            return false;
        }

        return true;
    });
};

export const getDeadlineStatus  = (todo?: Todo) => {
    let deadlineTime: '' | 'soon' | 'late' = '';
    if (todo && todo.deadline !== null) {
        const date = new Date();
        const deadline = new Date(todo.deadline);
        const datePlus3Days = new Date();
        datePlus3Days.setDate(date.getDate() + 3)

        if (deadline < date) {
            deadlineTime = 'late';

            if (todo.status == TodoStatus.ACTIVE) {
                todo.status = TodoStatus.OVERDUE;
            }

        } else if (deadline < datePlus3Days) {
            deadlineTime = 'soon';
        }
    }
    return deadlineTime;
}