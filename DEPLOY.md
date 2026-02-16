# Deploying to Google Cloud Platform (GCP)

Since "Echoes of the Hidden" is a React application, you have two primary options for deployment on GCP:

1. **Google Cloud Run** (Recommended for scale/containerization)
2. **Firebase Hosting** (Easiest for static sites)

---

## Option 1: Google Cloud Run (Docker)

Cloud Run hosts your application as a container. This is great if you want a robust, scalable backend later.

### Prerequisites
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed (`gcloud`).
- Docker installed (optional, but good for testing).

### Steps

1. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Build & Deploy**
   Run this single command to build the Docker image remotely and deploy it:
   ```bash
   gcloud run deploy echoes-game \
     --source . \
     --port 80 \
     --allow-unauthenticated \
     --region us-central1
   ```
   
   *Follow the prompts to enable APIs (Artifact Registry, Cloud Run) if asked.*

3. **Enjoy**
   The command will output a URL (e.g., `https://echoes-game-xyz-uc.a.run.app`).

### Option 1.1: Cloud Run via GitHub (No CLI required)

Since you have published your code to GitHub, this is the **easiest method**:

1. Go to the [Google Cloud Run Console](https://console.cloud.google.com/run).
2. Click **Create Service**.
3. Select **Continuously deploy new revisions from a source repository**.
4. Click **Set up with Cloud Build**.
5. Authenticate with GitHub and select your repository: `Priyanshu-Iron/Echoes-of-the-Hidden`.
6. **Build Configuration**:
   - Select **Dockerfile**.
   - Source location: `/` (root).
7. Scroll down to **Authentication** and check **Allow unauthenticated invocations** (so anyone can play).
8. Click **Create**.

Google Cloud will automatically build your Dockerfile and deploy the game!

Firebase is part of GCP and is optimized for serving static assets like this game.

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login & Init**
   ```bash
   firebase login
   firebase init hosting
   ```
   - Select "Use an existing project" or "Create a new project".
   - **Public directory**: `dist`
   - **Configure as single-page app**: `Yes`
   - **Automatic builds/deploys with GitHub**: `No` (or Yes if you want CI/CD).

3. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## Notes
- **Gemini API**: Remember to set your `VITE_GEMINI_API_KEY` in the environment variables.
    - For **Cloud Run**, set it in the console or add `--set-env-vars VITE_GEMINI_API_KEY=...` to the deploy command.
    - For **Firebase**, you must include it in your `.env` file **during the build process** (`npm run build`) because Vite embeds variables at build time.
