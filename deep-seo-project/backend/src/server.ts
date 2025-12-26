// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './api/routes/projectRoutes';
import analysisRoutes from './api/routes/analysisRoutes'; // <-- ADD THIS IMPORT
import aiRoutes from './api/routes/aiRoutes';
import path from 'path'; // Make sure path is imported
import settingsRoutes from './api/routes/settingsRoutes'; // <-- ADD

import fs from 'fs'; // Import fs

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// Dynamic Injector Route (Must be before express.static)
app.get('/injector.js', (req, res) => {
    const filePath = path.join(__dirname, '../public/injector.js');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading injector.js:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Inject API_BASE_URL from env, defaulting to localhost if not set
        const apiUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
        const injectedContent = data.replace('{{API_URL}}', apiUrl);

        res.setHeader('Content-Type', 'application/javascript');
        res.send(injectedContent);
    });
});

app.use(express.static(path.join(__dirname, '../public')));

// --- API Routes ---
// All routes defined in projectRoutes will be prefixed with '/api/projects'
app.use('/api/projects', projectRoutes);
app.use('/api/analysis', analysisRoutes); // <-- ADD THIS LINE
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes); // <-- ADD

// --- Server Listener ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Crawl endpoint is available at POST http://localhost:${port}/api/projects/crawl`);
    console.log(`Analysis endpoint is available at POST http://localhost:${port}/api/analysis/run`);
});
