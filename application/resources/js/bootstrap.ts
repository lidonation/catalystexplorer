import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { configureEcho, echo } from '@laravel/echo-react';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// @ts-ignore
window.Pusher = Pusher;

// @ts-ignore
// window.Echo = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT,
//     wssPort: import.meta.env.VITE_REVERB_PORT,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });

configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    encrypted: import.meta.env.VITE_REVERB_SCHEME === 'https',
    authEndpoint: (() => {
        const pathParts = window.location.pathname.split('/');
        const locale = pathParts[1] || 'en';
        return `/${locale}/broadcasting/auth`;
    })(),
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'X-Requested-With': 'XMLHttpRequest'
        }
    },

    authorizer: (channel, options) => {
        console.log('🔐 Authorizer called for channel:', channel.name);
        
        // Check if this is a bookmark-collection stream channel
        if (channel.name && channel.name.includes('bookmark-collection') && channel.name.includes('.stream')) {
            console.log('✅ Authorizing bookmark-collection stream channel without auth');
            return {
                authorize: (socketId, callback) => {
                    // Authorize without authentication
                    callback(false, { user: null, guest: true });
                }
            };
        }
        
        // Handle private-undefined channel
        if (channel.name === 'private-undefined') {
            return {
                authorize: (socketId, callback) => {
                    callback(false, {});
                }
            };
        }

        // Use default authentication for other channels
        return {
            authorize: (socketId, callback) => {
                const authEndpoint = options.authEndpoint || `/${window.location.pathname.split('/')[1] || 'en'}/broadcasting/auth`;

                fetch(authEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                })
                    .then(response => response.json())
                    .then(data => callback(false, data))
                    .catch(error => callback(true, error));
            }
        };
    }
});

// @ts-ignore
window.echo = echo();
