# AERS Reporting Agent - AI Coding Instructions

## Project Overview
This is a React/TypeScript medical reporting application that uses Google Gemini AI to guide users through FDA adverse event reporting. The app features a conversational interface with real-time form updates and external medical term validation.

## Core Architecture

### Main Application Flow (`App.tsx`)
- **4 Views**: `greeting` → `chat` ↔ `review` + `login`
- **State Management**: React hooks for messages, reportData, and authentication
- **Dual Interface**: Chat panel (left) + live report panel (right) 
- **OAuth Flow**: Supabase auth with pending action handling via localStorage

### Critical Data Flow
1. User describes symptom → AI calls `get_adverse_effect_suggestions` tool
2. External MedDRA API returns medical terms → User selects from suggestions  
3. Selected term populates `adverse_event.description_narrative`
4. AI continues conversation using field completion analysis
5. Real-time ReportData updates maintained throughout

## Key Files & Patterns

### AI Service (`services/geminiService.ts`)
- **Dual Call Pattern**: Initial tool-enabled call → JSON schema-enforced response
- **Response Analysis**: `analyzeReportCompleteness()` tracks filled vs empty fields
- **Tool Integration**: Single mandatory `get_adverse_effect_suggestions` call for symptoms
- **Error Handling**: Graceful degradation for MedDRA API failures

### Data Management (`constants.ts`, `types.ts`)
- **Immutable Updates**: Always spread existing data, never overwrite sections
- **Auto-Fill Pattern**: `createInitialReportDataWithUser()` populates from auth metadata
- **Progress Calculation**: Dynamic completion percentage based on non-null fields
- **Profile Enhancement**: `calculateProfileCompletionPercentage()` for user onboarding

### Authentication & State (`contexts/AuthContext.tsx`)
- **Pending Actions**: Store user intent in localStorage during OAuth redirects
- **Auto-Fill Logic**: Preserve existing reporter_info, merge new auth data
- **Profile Management**: User metadata drives form pre-population

## Environment & Deployment

### Environment Variables (Critical Pattern)
```typescript
// Development: .env file
GEMINI_API_KEY="your_key_here"

// Production: Runtime injection via window.__ENV__
const API_KEY = process.env.API_KEY || window.__ENV__?.GEMINI_API_KEY;
```

### Build Commands
```bash
npm install             # Install dependencies
npm run dev            # Vite dev server (localhost:5173)
npm run build          # Production build
```

### Docker Deployment
- **Multi-stage**: Node build → Nginx static serving
- **Runtime Config**: `docker-entrypoint.sh` generates `window.__ENV__` at startup
- **Proxy Setup**: Nginx proxies `/api/meddra` to external Cloud Function

## Development Pitfalls & Solutions

### AI State Management
- **Never overwrite auto-filled reporter_info** - merge with existing data
- **Field completion awareness** - AI skips already-filled fields (core UX)
- **Tool calling constraint** - Only first symptom description triggers external API

### Authentication Flow
- **OAuth redirect handling** - Store pending actions in localStorage
- **Profile completion prompts** - Calculate completion percentage for UX
- **Metadata preservation** - Auto-fill from Supabase user metadata

### Component Communication
- **Manual edit propagation** - `handleUpdateReportData` syncs live panel changes
- **Modal state management** - Suggestion selection triggers AI continuation
- **File upload handling** - Base64 conversion for AI processing

### External Dependencies
- **MedDRA API**: `https://meddra-lite-1036646057438.europe-west1.run.app`
- **Supabase**: Authentication and user profile management
- **Google Gemini**: AI model with function calling (gemini-2.5-flash)

## Medical Compliance Context
This application handles sensitive health information reporting. Always:
- Maintain data integrity throughout state changes
- Preserve user privacy in error handling
- Ensure conversational flow remains intuitive for adverse event reporting
- Validate form completeness before submission
