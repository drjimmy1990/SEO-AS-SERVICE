// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './api/routes/projectRoutes'; // <-- Import our new routes

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- API Routes ---
// All routes defined in projectRoutes will be prefixed with '/api/projects'
app.use('/api/projects', projectRoutes);

// --- Server Listener ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Crawl endpoint is available at POST http://localhost:${port}/api/projects/crawl`);
});
