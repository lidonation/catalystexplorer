import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import wasm from "vite-plugin-wasm";
import path from "node:path";
import i18n from 'laravel-react-i18n/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        i18n(),
        wasm(),
    ],
    resolve: {
        alias: {
            ziggy: path.resolve('vendor/tightenco/ziggy/dist'),
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    // server: {
    //     hmr: {
    //         host: 'localhost',
    //     },
    //     host: '0.0.0.0',
    // },
    ssr: {
        noExternal: ['@inertiajs/server'],
    },
    build: {
        target: 'esnext',
    }
});
