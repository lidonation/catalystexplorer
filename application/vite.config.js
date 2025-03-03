import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from "node:path";


export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            ziggy: path.resolve('vendor/tightenco/ziggy/dist'),
        },
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        host: '0.0.0.0',
    }
});
