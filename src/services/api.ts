export const API_URL = '/api';

export const api = {
    fetchData: async () => {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },

    saveData: async (data: any) => {
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to save data');
        return response.json();
    }
};
