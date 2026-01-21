import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import wasm from "vite-plugin-wasm";
import path from "node:path";
import fs from "node:fs";
import i18n from 'laravel-react-i18n/vite';

/**
 * Detect server configuration based on available certificates
 * If local development certificates exist, enable HTTPS
 */
function detectServerConfig() {
    let certPath = path.resolve(__dirname, '/etc/caddy/certs/catalystexplorer.local.crt');
    let keyPath = path.resolve(__dirname, '/etc/caddy/certs/catalystexplorer.local.key');

    // Check if certificates exist for HTTPS
    const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

    if (hasCerts) {
        console.log('🔒 HTTPS enabled for Vite dev server');
        return {
            host: '0.0.0.0',
            https: {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
            },
            hmr: {
                host: 'catalystexplorer.local',
                clientPort: 5173,
                protocol: 'wss',
            },
        };
    }

    // Fallback to HTTP
    console.log('⚠️  HTTP mode - generate certificates for HTTPS/HTTP2/HTTP3 support');
    return {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
    };
}

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.tsx',
                'resources/scss/app.scss',
                'resources/scss/pdf.scss'
            ],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        i18n({
            langDir: 'lang',
            phpDir: 'lang'
        }),
        wasm(),
    ],
    resolve: {
        alias: {
            ziggy: path.resolve('vendor/tightenco/ziggy/dist'),
            '@': path.resolve(__dirname, 'resources/js'),
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: detectServerConfig(),
    ssr: {
        noExternal: ['@inertiajs/server'],
        external: [
            'react-map-gl',
            'react-map-gl/mapbox',
            'mapbox-gl',
            '@mapbox/mapbox-gl-geocoder',
            'mapbox-gl/dist/mapbox-gl.css'
        ],
    },
    build: {
        target: 'esnext',
    }

});