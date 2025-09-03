import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
//
// export default defineConfig({ plugins: [react(), tailwindcss()] })
// If you want to be extra safe in dev, you can disable React Fast Refresh
export default defineConfig({ plugins: [react({ fastRefresh: false }), tailwindcss()]})





// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     port: 5173,
//     host: true,
//   },
// });
