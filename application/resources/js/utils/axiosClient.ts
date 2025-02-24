import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentUrl =
                window.location.pathname + window.location.search;
            const locale = document.documentElement.lang || 'en';
            router.visit(generateLocalizedRoute('login', {}, locale), {
                preserveState: true,
                replace: true,
                only: [],
                data: { redirect: currentUrl },
            });
        }
        return Promise.reject(error);
    },
);

export default api;
