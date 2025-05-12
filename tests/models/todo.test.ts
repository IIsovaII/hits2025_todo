import {filterTodos, getDeadlineStatus, Todo} from "../../src/models/todo";
import {TodoPriority} from "../../src/models/todo";
import {TodoStatus} from "../../src/models/todo";
import {sortTodos} from "../../src/models/todo";

describe('sortTodos', () => {
    const mockTodos: Todo[] = [
        {
            id: '1',
            title: 'Z Task',
            priority: TodoPriority.LOW,
            createdAt: new Date('2023-01-01'),
            deadline: new Date('2023-12-31'),
            completed: false,
            status: TodoStatus.ACTIVE
        },
        {
            id: '2',
            title: 'A Task',
            priority: TodoPriority.HIGH,
            createdAt: new Date('2023-01-02'),
            deadline: new Date('2023-06-30'),
            completed: true,
            status: TodoStatus.COMPLETED
        },
        {
            id: '3',
            title: 'M Task',
            priority: TodoPriority.MEDIUM,
            createdAt: new Date('2023-01-03'),
            deadline: null,
            completed: false,
            status: TodoStatus.ACTIVE
        }
    ];

    describe('Single sort', () => {
        it('should sort by title ascending', () => {
            const result = sortTodos(mockTodos, { key: 'title', direction: 'asc' });
            expect(result.map(t => t.title)).toEqual(['A Task', 'M Task', 'Z Task']);
        });

        it('should sort by priority descending', () => {
            const result = sortTodos(mockTodos, { key: 'priority', direction: 'desc' });
            expect(result.map(t => t.priority)).toEqual([TodoPriority.HIGH, TodoPriority.MEDIUM, TodoPriority.LOW]);
        });

        it('should sort by deadline with nulls last', () => {
            const result = sortTodos(mockTodos, { key: 'deadline', direction: 'asc' });
            expect(result[0].deadline).toBeNull();
        });
    });

    describe('Multi-sort', () => {
        it('should sort by completed then by title', () => {
            const result = sortTodos(mockTodos, [
                { key: 'completed', direction: 'asc' },
                { key: 'title', direction: 'desc' }
            ]);
            expect(result.map(t => t.id)).toEqual(['1', '3', '2']);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty array', () => {
            expect(sortTodos([], { key: 'title' })).toEqual([]);
        });

        it('should handle undefined values', () => {
            const todosWithUndefined = [...mockTodos, { ...mockTodos[0], title: undefined } as unknown as Todo];
            const result = sortTodos(todosWithUndefined, { key: 'title' });
            expect(result[0].title).toBeUndefined();
        });
    });
});


describe('filterTodos', () => {
    const mockTodos: Todo[] = [
        {
            id: '1',
            title: 'Fix bugs',
            description: 'Fix all critical bugs',
            priority: TodoPriority.CRITICAL,
            completed: false,
            status: TodoStatus.ACTIVE,
            createdAt: new Date(),
            deadline: new Date(Date.now() + 86400000)
        },
        {
            id: '2',
            title: 'Write docs',
            description: 'Document new features',
            priority: TodoPriority.MEDIUM,
            completed: true,
            status: TodoStatus.COMPLETED,
            createdAt: new Date(),
            deadline: new Date(Date.now() - 86400000)
        },
        {
            id: '3',
            title: 'Refactor',
            priority: TodoPriority.LOW,
            completed: false,
            status: TodoStatus.ACTIVE,
            createdAt: new Date(),
            deadline: null
        }
    ];

    describe('Search text', () => {
        it('should filter by title', () => {
            const result = filterTodos(mockTodos, { searchText: 'fix' });
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('1');
        });

        it('should filter by description', () => {
            const result = filterTodos(mockTodos, { searchText: 'document' });
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('2');
        });

        it('should return empty if no matches', () => {
            const result = filterTodos(mockTodos, { searchText: 'non-existent' });
            expect(result).toEqual([]);
        });
    });

    describe('Status filter', () => {
        it('should filter active tasks', () => {
            const result = filterTodos(mockTodos, { status: 'active' });
            expect(result.length).toBe(2);
            expect(result.every(t => !t.completed)).toBeTruthy();
        });

        it('should filter completed tasks', () => {
            const result = filterTodos(mockTodos, { status: 'completed' });
            expect(result.length).toBe(1);
            expect(result[0].completed).toBeTruthy();
        });
    });

    describe('Priority filter', () => {
        it('should filter by critical priority', () => {
            const result = filterTodos(mockTodos, { priority: TodoPriority.CRITICAL });
            expect(result.length).toBe(1);
            expect(result[0].priority).toBe(TodoPriority.CRITICAL);
        });

        it('should return all when priority is all', () => {
            const result = filterTodos(mockTodos, { priority: 'all' });
            expect(result.length).toBe(mockTodos.length);
        });
    });

    describe('Combined filters', () => {
        it('should combine multiple filters', () => {
            const result = filterTodos(mockTodos, {
                searchText: 'fix',
                status: 'active',
                priority: TodoPriority.CRITICAL
            });
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('1');
        });
    });
});


describe('getDeadlineStatus', () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 86400000); // +1 day
    const late = new Date(now.getTime() - 86400000); // -1 day
    const farFuture = new Date(now.getTime() + 4 * 86400000); // +4 days

    describe('Status calculation', () => {
        it('should return empty for no deadline', () => {
            const todo = { deadline: null } as Todo;
            expect(getDeadlineStatus(todo)).toBe('');
        });

        it('should return "soon" for deadline within 3 days', () => {
            const todo = { deadline: soon, status: TodoStatus.ACTIVE } as Todo;
            expect(getDeadlineStatus(todo)).toBe('soon');
        });

        it('should return "late" for past deadline', () => {
            const todo = { deadline: late, status: TodoStatus.ACTIVE } as Todo;
            expect(getDeadlineStatus(todo)).toBe('late');
        });

        it('should return empty for deadline beyond 3 days', () => {
            const todo = { deadline: farFuture, status: TodoStatus.ACTIVE } as Todo;
            expect(getDeadlineStatus(todo)).toBe('');
        });
    });

    describe('Status update', () => {
        it('should update status to OVERDUE for late active task', () => {
            const todo = { deadline: late, status: TodoStatus.ACTIVE } as Todo;
            getDeadlineStatus(todo);
            expect(todo.status).toBe(TodoStatus.OVERDUE);
        });

        it('should not update status for completed late task', () => {
            const todo = { deadline: late, status: TodoStatus.COMPLETED } as Todo;
            getDeadlineStatus(todo);
            expect(todo.status).toBe(TodoStatus.COMPLETED);
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined todo', () => {
            expect(getDeadlineStatus(undefined)).toBe('');
        });

        it('should handle invalid date', () => {
            const todo = { deadline: new Date('invalid'), status: TodoStatus.ACTIVE } as Todo;
            expect(getDeadlineStatus(todo)).toBe('');
        });
    });
});