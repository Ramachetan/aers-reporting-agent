# AERS Reporting Agent - AI Coding Instructions

## Project Overview
This is a React/TypeScript medical reporting application that uses Google Gemini AI to guide users through FDA adverse event reporting. The app features a conversational interface with real-time form updates and external medical term validation.

## Architecture & Key Components

### Core Application Flow
- **App.tsx**: Main orchestrator with 4 views: `greeting`, `chat`, `review`, `login`
- **State Management**: React hooks for messages, reportData, and authentication
- **Dual Interface**: Chat panel (left) + live report panel (right) in main view
- **Authentication**: Supabase integration with auto-filled reporter information

### Critical Data Flow Pattern
1. User describes symptom → AI calls `get_adverse_effect_suggestions` tool
2. External MedDRA API returns medical terms → User selects from suggestions
3. Selected term populates `adverse_event.description_narrative`
4. AI continues conversation to fill remaining fields
5. Real-time updates to ReportData structure maintained throughout

### Key Files & Responsibilities
- **services/geminiService.ts**: AI integration with tool calling, response parsing, and report completeness analysis
- **constants.ts**: System prompts, response schemas, and data initialization
- **types.ts**: Complete ReportData interface matching FDA MedWatch 3500B form
- **contexts/AuthContext.tsx**: Supabase auth with auto-filling user metadata

## Development Patterns

### Environment Variables (Critical)
- Development: Uses `.env` with `GEMINI_API_KEY`
- Production: Docker runtime injection via `window.__ENV__` object
- **Pattern**: Check both `process.env` and `window.__ENV__` in browser builds
- Vite config defines env vars for build-time replacement

### AI Service Integration
- **Tool Calling**: Mandatory `get_adverse_effect_suggestions` for first symptom description
- **Dual Response Pattern**: Tool call → external API OR JSON schema enforcement
- **Response Analysis**: `analyzeReportCompleteness()` tracks filled vs empty fields
- **State Preservation**: Always preserve existing reporter_info and other filled data

### Report Data Management
- **Immutable Updates**: Always spread existing data, never overwrite entire sections
- **Field Awareness**: AI skips already-filled fields (critical UX pattern)
- **Auto-Fill Logic**: `createInitialReportDataWithUser()` populates reporter info from auth
- **Progress Calculation**: Dynamic progress bar based on non-null field count

### Component Architecture
- **ChatPanel**: Message handling, file uploads, typing indicators
- **ReportPanel**: Live editing with pencil icons, section-based updates
- **Section Pattern**: Collapsible sections with edit modes and data validation
- **Modal Pattern**: `SuggestionModal` for MedDRA term selection

## Build & Deployment

### Local Development
```bash
npm install
# Create .env with GEMINI_API_KEY
npm run dev  # Vite dev server on localhost:5173
```

### Docker Deployment
- **Multi-stage**: Node build → Nginx serving
- **Runtime Config**: `docker-entrypoint.sh` injects env vars into `window.__ENV__`
- **Proxy Setup**: Nginx proxies `/api/meddra` to external Cloud Function

### External Dependencies
- **MedDRA API**: `https://meddra-lite-1036646057438.europe-west1.run.app`
- **Supabase**: Authentication and user management
- **Google Gemini**: AI model with function calling capabilities

## Critical Development Notes

### AI Prompt Engineering
- System prompt in `constants.ts` includes field completion awareness
- **Never ask for already-filled fields** - this is a core requirement
- Tool calling is mandatory for first symptom description only
- Response must always include complete ReportData structure

### State Management Pitfalls
- **Reporter Info Preservation**: Never overwrite auto-filled user data
- **Partial Updates**: Always merge with existing state, don't replace
- **Authentication Flow**: Handle pending actions during login redirects
- **File Handling**: Base64 conversion for image uploads to AI

### Component Communication
- **Event Patterns**: `handleUpdateReportData` propagates manual edits
- **Modal State**: Suggestion selection triggers AI continuation
- **Progress Updates**: Real-time calculation affects UI progress bar
- **Error Handling**: Graceful degradation for API failures

### Testing Considerations
- Mock Gemini API responses for development
- Test auth flow with Supabase test users
- Verify file upload edge cases
- Validate form state preservation across view changes

When working on this codebase, always consider the medical compliance context, maintain data integrity, and ensure the conversational AI flow remains intuitive for users reporting sensitive health information.
