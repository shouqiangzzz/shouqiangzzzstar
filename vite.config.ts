import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function videoUploadPlugin(): Plugin {
  return {
    name: 'video-upload-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-video', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            const body = JSON.parse(buffer.toString('utf-8'));
            const { dataUrl, filename } = body;

            if (!dataUrl) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing dataUrl' }));
            }

            const base64Data = dataUrl.replace(/^data:video\/[a-zA-Z0-9.-]+;base64,/, '');
            const uploadsDir = path.resolve(process.cwd(), 'public/uploads/videos');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const safeName = (filename || `user_vid_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_') + '.mp4';
            const filePath = path.join(uploadsDir, safeName);
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

            const publicUrl = `/uploads/videos/${safeName}`;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, videoUrl: publicUrl }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Upload failed' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), videoUploadPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
