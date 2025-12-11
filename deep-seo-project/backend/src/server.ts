// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './api/routes/projectRoutes';
import analysisRoutes from './api/routes/analysisRoutes'; // <-- ADD THIS IMPORT
import aiRoutes from './api/routes/aiRoutes';
import path from 'path'; // Make sure path is imported
import settingsRoutes from './api/routes/settingsRoutes'; // <-- ADD

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies
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
