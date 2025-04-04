export const API_URL = 'http://localhost:8080';

export const apiHeaders = {
    'Content-Type': 'application/json',
};

export const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Что-то пошло не так');
    }
    return response.json();
};