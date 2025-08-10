
# AERS Reporting Agent

A System Agnostic, Scalable, Compliant & Future-Ready AE Intake Solution Powered by AI.

This application provides a conversational interface for users to report adverse events (side effects) related to medications. It uses the Google Gemini API to guide the user through a series of questions, structuring the gathered information in real-time into a comprehensive report.

## Technology Stack

- **Framework**: React with TypeScript
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **External Service**: A Google Cloud Function for MedDRA term suggestions.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or later.
- **npm** (or yarn/pnpm).
- **A Google Gemini API Key**: You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

First, clone this repository to your local machine.

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

The project uses `npm` to manage the development dependencies required to run the Vite server.

```bash
npm install
```

### 3. Set Up Environment Variables

The application requires a Google Gemini API key to communicate with the AI model.

1.  Create a new file named `.env` in the root of your project directory.
    ```bash
    touch .env
    ```
2.  Open the `.env` file and add your Gemini API key as shown below. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.

    ```env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

> **Note:** The `vite.config.ts` file is configured to securely load this key into the application. The `.env` file should not be committed to version control.

## Running the Application

Once the dependencies are installed and your environment variable is set, you can start the local development server.

```bash
npm run dev
```

This command will start the Vite server. Open your web browser and navigate to the URL provided in your terminal (typically `http://localhost:5173`) to see the application in action.

## How It Works

1.  **Initial Interaction**: The user is greeted with a landing page where they can describe their problem or upload a relevant document/photo.
2.  **Symptom Clarification**: The initial user input is sent to the Gemini API. The AI uses a tool-calling function (`get_adverse_effect_suggestions`) to query an external service for medically accurate terms (MedDRA LLTs) related to the user's description.
3.  **User Confirmation**: The application presents these suggestions to the user in a modal, ensuring the primary symptom is captured accurately.
4.  **Conversational Data Intake**: After the user selects a term, the AI proceeds with a guided conversation, asking targeted questions one by one to fill out the adverse event report.
5.  **Live Report Building**: As the conversation progresses, a "Live Data Report" on the side panel is updated in real-time with the information provided by the user.
6.  **Manual Editing**: The user can click the pencil icon on any section of the report to manually edit the data at any point during the process.
7.  **Review and Download**: Once the AI determines all necessary information has been collected, it presents a final review screen. The user can then download the completed report as a JSON file.

## CI/CD Pipeline

This repository includes a GitHub Actions workflow for continuous integration:

- **Workflow File**: `.github/workflows/docker-image.yml`
- **Purpose**: Automatically builds Docker images on push/PR to main branch
- **Documentation**: See [GITHUB_WORKFLOW_EXPLANATION.md](./GITHUB_WORKFLOW_EXPLANATION.md) for detailed explanation
- **Quick Reference**: See [WORKFLOW_SUMMARY.md](./WORKFLOW_SUMMARY.md) for a concise overview
- **Visual Flow**: See [WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md) for visual diagrams

The workflow ensures that every code change can be successfully containerized, supporting reliable deployment of this medical reporting application.
