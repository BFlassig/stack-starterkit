import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const vitePort = Number(env.VITE_PORT ?? 5173);
    const viteHost = env.VITE_HOST ?? '0.0.0.0';
    const appUrl = env.APP_URL ?? 'http://localhost:8080';
    const appOrigin = (() => {
        try {
            return new URL(appUrl).origin;
        } catch {
            return 'http://localhost:8080';
        }
    })();
    const appHostname = (() => {
        try {
            return new URL(appUrl).hostname;
        } catch {
            return 'localhost';
        }
    })();
    const viteHmrHost = env.VITE_HMR_HOST ?? appHostname;
    const viteHmrPort = Number(env.VITE_HMR_PORT ?? vitePort);
    const viteOrigin = env.VITE_DEV_SERVER_URL ?? `http://${viteHmrHost}:${viteHmrPort}`;

    return {
        plugins: [
            laravel({
                input: 'resources/js/app.tsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'resources/js'),
            },
        },
        server: {
            host: viteHost,
            port: vitePort,
            origin: viteOrigin,
            cors: {
                origin: appOrigin,
            },
            strictPort: true,
            hmr: {
                host: viteHmrHost,
                port: viteHmrPort,
            },
        },
    };
});
