import { useState, useEffect, useCallback } from 'react';
import { Todo, UpdateTodoDto } from '../models/todo';
import { todoApi } from '../api/todoApi';

export const useTodo = (id: string | undefined) => {
    const [todo, setTodo] = useState<Todo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTodo = useCallback(async (todoId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await todoApi.getById(todoId);
            setTodo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке задачи');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateTodo = useCallback(async (data: UpdateTodoDto) => {
        if (!id || !todo) return;

        setIsLoading(true);
        setError(null);
        try {
            const updatedTodo = await todoApi.update(id, data);
            setTodo(updatedTodo);
            return updatedTodo;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при обновлении задачи');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [id, todo]);

    const deleteTodo = useCallback(async () => {
        if (!id || !todo) return;

        setIsLoading(true);
        setError(null);
        try {
            await todoApi.delete(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при удалении задачи');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [id, todo]);

    useEffect(() => {
        if (id) {
            fetchTodo(id).then();
        }
    }, [id, fetchTodo]);

    return {
        todo,
        isLoading,
        error,
        updateTodo,
        deleteTodo,
        refreshTodo: id ? () => fetchTodo(id) : undefined,
    };
};