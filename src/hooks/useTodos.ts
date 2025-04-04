import {useState, useEffect, useCallback} from 'react';
import {Todo, CreateTodoDto, UpdateTodoDto, TodoFilters, filterTodos, SortConfig, sortTodos} from '../models/todo';
import {todoApi} from '../api/todoApi';

export const useTodos = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TodoFilters>({
        status: 'all',
        priority: 'all',
    });
    const [sortConfigs, setSortConfigs] = useState<SortConfig<Todo>[]>([
        {key: 'completed', direction: 'asc'}
    ]);

    const fetchTodos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await todoApi.getAll();
            setTodos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке задач');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createTodo = useCallback(async (data: CreateTodoDto) => {
        setIsLoading(true);
        setError(null);
        try {
            await todoApi.create(data);
            await fetchTodos()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при создании задачи');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [fetchTodos]);

    const updateTodo = useCallback(async (id: string, data: UpdateTodoDto) => {
        setIsLoading(true);
        setError(null);
        try {
            await todoApi.update(id, data);
            await fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при обновлении задачи');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [fetchTodos]);

    const deleteTodo = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await todoApi.delete(id);
            await fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при удалении задачи');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [fetchTodos]);

    const filteredTodos = filterTodos(todos, filters);

    const updateFilters = useCallback((newFilters: Partial<TodoFilters>) => {
        setFilters((prev: TodoFilters) => ({...prev, ...newFilters}));
    }, []);

    const addSortCriteria = useCallback(() => {
        setSortConfigs((prev: SortConfig<Todo>[]) => [...prev, {key: 'description', direction: 'asc'}]);
    }, []);

    const removeSortCriteria = useCallback((index: number) => {
        setSortConfigs((prev: SortConfig<Todo>[]) => {
            const newConfigs = [...prev];
            newConfigs.splice(index, 1);
            return newConfigs;
        });
    }, []);

    const updateSortCriteria = useCallback((index: number, field: 'key' | 'direction', value: any) => {
        setSortConfigs((prev: SortConfig<Todo>[]) => {
            const newConfigs = [...prev];
            newConfigs[index] = {...newConfigs[index], [field]: value};
            return newConfigs;
        });
    }, []);

    const sortedTodos = sortTodos(filteredTodos, sortConfigs);

    useEffect(() => {
        fetchTodos().then();
    }, [fetchTodos]);

    return {
        sortConfigs,
        addSortCriteria,
        removeSortCriteria,
        updateSortCriteria,
        todos: sortedTodos,
        isLoading,
        error,
        filters,
        updateFilters,
        createTodo,
        updateTodo,
        deleteTodo,
        refreshTodos: fetchTodos,
    };
};