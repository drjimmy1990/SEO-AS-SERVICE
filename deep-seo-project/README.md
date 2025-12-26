# DeepSEO - Autonomous SEO Analysis Engine

DeepSEO is a comprehensive SEO tool that crawls websites, analyzes their technical and content health, and provides AI-powered recommendations. It is designed to be self-hosted and integrates with **Supabase** (for data) and **n8n** (for AI workflows).

## 🚀 Features

*   **Deep Crawling**: Recursively crawls websites to discover pages.
*   **Rule-Based Analysis**: Checks for broken links, missing meta tags, header hierarchy, and more.
*   **Live Injection**: Inject SEO fixes (titles, meta descriptions) dynamically via a JS snippet.
*   **AI Recommendations**: Generates improved titles, descriptions, and H1s using Generative AI (via n8n).
*   **Dashboard**: A React-based UI to manage projects and view reports.

---

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express, Puppeteer (Crawler), Supabase (DB).
*   **Frontend**: React, Vite.
*   **AI/Automation**: n8n (Orchestrates Gemini/OpenAI calls).
*   **Infrastructure**: Docker ready (or VPS deployment via aaPanel).

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `3001` |
| `SUPABASE_URL` | Your Supabase Project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Private Service Key (Role: service_role) | `eyJ...` |
| `N8N_WEBHOOK_URL` | Webhook URL for the AI workflow | `https://n8n.ai4eg.com/webhook/seo` |
| `API_BASE_URL` | Public URL of the backend (for Injector) | `https://api.yourdomain.com` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the Backend API | `https://api.yourdomain.com/api` |

---

## 📡 API Endpoints & cURL Examples

Assume `BASE_URL=http://localhost:3001/api` (or your production URL).

### 1. Start a New Project (Crawl)
Creates a project and recursively crawls the site to find pages.

- **Endpoint**: `POST /projects/crawl`
- **Body**:
  ```json
  { "homepage_url": "https://example.com" }
  ```
- **cURL**:
  ```bash
  curl -X POST http://localhost:3001/api/projects/crawl \
       -H "Content-Type: application/json" \
       -d '{"homepage_url": "https://example.com"}'
  ```

### 2. Get Discovered Pages
Retrieves all pages found for a project.

- **Endpoint**: `GET /projects/:projectId/pages`
- **cURL**:
  ```bash
  curl http://localhost:3001/api/projects/YOUR_PROJECT_ID_HERE/pages
  ```

### 3. Run SEO Analysis
Triggers a deep technical and content analysis for a specific URL.

- **Endpoint**: `POST /analysis/run`
- **Body**:
  ```json
  { "url": "https://example.com/page1", "trackingCode": "optional_script_verification" }
  ```
- **cURL**:
  ```bash
  curl -X POST http://localhost:3001/api/analysis/run \
       -H "Content-Type: application/json" \
       -d '{"url": "https://example.com/about"}'
  ```

### 4. Get AI Recommendations
Sends the analysis report to n8n to generate AI fixes.

- **Endpoint**: `POST /ai/suggestions`
- **Body**:
  ```json
  { "report_id": "uuid-from-analysis-response" }
  ```
- **cURL**:
  ```bash
  curl -X POST http://localhost:3001/api/ai/suggestions \
       -H "Content-Type: application/json" \
       -d '{"report_id": "3f4c66e2-..."}'
  ```

### 5. Live Injector Settings
Fetches saved SEO settings for the client script (`injector.js`).

- **Endpoint**: `GET /settings/live`
- **Query**: `?url=https://current-page.com`
- **cURL**:
  ```bash
  curl "http://localhost:3001/api/settings/live?url=https%3A%2F%2Fexample.com%2Fabout"
  ```

---

## 🚀 Deployment Guide: aaPanel (Node.js Project)

This guide walks you through deploying the **Backend** and **Frontend** to a VPS using **aaPanel**.

### Prerequisites
1.  **VPS** with aaPanel installed.
2.  **Node.js Manager**: Installed from App Store (Install Node v18+).
3.  **Supabase Credentials**: Ready.

---

### Part 1: Backend Deployment

**1. Upload Files**
*   Go to **Files**. Create folder `/www/wwwroot/deep-seo-backend`.
*   Upload the contents of your `backend` folder.

**2. Install Dependencies**
*   Open **Terminal**.
*   Run:
    ```bash
    cd /www/wwwroot/deep-seo-backend
    npm install
    npm run build
    ```

**3. Configure Environment**
*   Create `.env` file in the backend folder.
*   Paste your config (See "Environment Variables" section above).

**4. Start Node Service**
*   Go to **Websites** > **Node.js Project**.
*   **Add Node.js Project**:
    *   **Path**: `/www/wwwroot/deep-seo-backend`
    *   **Start Command**: `npm start` (or `node dist/server.js`)
    *   **Port**: `3001`
    *   **Name**: `deep-seo-backend`
*   Click **Submit**.

**5. Map Domain**
*   Click **Mapping** (or Domain settings).
*   Add your domain: `api.your-domain.com`.
*   **Enable SSL** (Let's Encrypt).

---

### Part 2: Frontend Deployment

**1. Build for Production**
*   On your local machine (or server), create `frontend/.env`:
    ```env
    VITE_API_URL=https://api.your-domain.com/api
    ```
*   Run build:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
*   This creates a `dist` folder.

**2. Create Static Site**
*   Go to **Websites** > **PHP Project** (Add Site).
*   **Domain**: `app.your-domain.com`.
*   **Root**: `/www/wwwroot/deep-seo-frontend` (Upload your `dist` folder contents here).
*   Click **Submit**.

**3. Configure Nginx (React Router)**
*   Open Site Settings > **Config** (or URL Rewrite).
*   Add this rule to handle routing:
    ```nginx
    location / {
      try_files $uri $uri/ /index.html;
    }
    ```
*   **Enable SSL** (Let's Encrypt).

---

### Part 3: Verification

1.  **Backend**: Open `https://api.your-domain.com/injector.js`. You should see JavaScript code.
2.  **Frontend**: Open `https://app.your-domain.com`. You should see the Dashboard.
3.  **Test**: Run an analysis on the dashboard. It should communicate with your backend successfully.
