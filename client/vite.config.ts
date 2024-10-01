import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		watch: {
			usePolling: true,
		},
		// proxy: {
		// 	'/register_event': {
		// 		target: 'http://localhost:5000',
		// 		changeOrigin: true,
		// 		secure: false,
		// 	},
		// },
		port: 3000,
		strictPort: true,
		host: true,
		origin: 'http://localhost:3000',
	},
});
