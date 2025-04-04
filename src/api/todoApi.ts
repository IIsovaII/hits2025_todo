import { Todo, CreateTodoDto, UpdateTodoDto } from '../models/todo';
import { API_URL, apiHeaders, handleResponse } from './apiConfig';

export const todoApi = {
    async getAll(): Promise<Todo[]> {
        const response = await fetch(`${API_URL}/todo`, {
            headers: apiHeaders,
        });
        return handleResponse(response);
    },

    async getById(id: string): Promise<Todo> {
        const response = await fetch(`${API_URL}/todo/${id}`, {
            headers: apiHeaders,
        });
        return handleResponse(response);
    },

    async create(data: CreateTodoDto): Promise<Todo> {
        const response = await fetch(`${API_URL}/todo`, {
            method: 'POST',
            headers: apiHeaders,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async update(id: string, data: UpdateTodoDto): Promise<Todo> {
        const response = await fetch(`${API_URL}/todo/${id}`, {
            method: 'PUT',
            headers: apiHeaders,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async delete(id: string): Promise<void> {
        await fetch(`${API_URL}/todo/${id}`, {
            method: 'DELETE'
        });
    }
};