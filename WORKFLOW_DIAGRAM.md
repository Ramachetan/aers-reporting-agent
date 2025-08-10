# GitHub Workflow Visual Flow

## Workflow Trigger Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TRIGGERS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Push to main branch              Pull Request to main branch       │
│         │                                     │                     │
│         ▼                                     ▼                     │
│  ┌─────────────┐                    ┌─────────────────┐             │
│  │   git push  │                    │  Open/Update PR │             │
│  │     main    │                    │   → main        │             │
│  └─────────────┘                    └─────────────────┘             │
│         │                                     │                     │
│         └──────────────┬──────────────────────┘                     │
│                        ▼                                            │
│              ┌─────────────────────┐                                │
│              │ GitHub Workflow     │                                │
│              │ "Docker Image CI"   │                                │
│              │ TRIGGERED           │                                │
│              └─────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Workflow Execution Steps

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EXECUTION FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 1. Runner Setup                                                     │
│ ┌─────────────────────┐                                             │
│ │   ubuntu-latest     │  ← GitHub provides clean Ubuntu VM         │
│ │   (Ubuntu 22.04)    │                                             │
│ │   with Docker       │                                             │
│ └─────────────────────┘                                             │
│            │                                                        │
│            ▼                                                        │
│                                                                     │
│ 2. Code Checkout                                                    │
│ ┌─────────────────────┐                                             │
│ │ actions/checkout@v4 │  ← Downloads repository source code        │
│ │                     │                                             │
│ │ Repository files:   │                                             │
│ │ • Source code       │                                             │
│ │ • Dockerfile        │                                             │
│ │ • package.json      │                                             │
│ │ • nginx.conf        │                                             │
│ └─────────────────────┘                                             │
│            │                                                        │
│            ▼                                                        │
│                                                                     │
│ 3. Docker Build                                                     │
│ ┌─────────────────────┐                                             │
│ │ docker build .      │  ← Build image from Dockerfile             │
│ │ --file Dockerfile   │                                             │
│ │ --tag my-image-name:│                                             │
│ │   $(date +%s)       │  ← Timestamp: e.g., 1691234567             │
│ └─────────────────────┘                                             │
│            │                                                        │
│            ▼                                                        │
│                                                                     │
│ 4. Build Result                                                     │
│ ┌─────────────────────┐                                             │
│ │ ✅ Success: Image   │  ← Docker image created locally            │
│ │    built locally    │                                             │
│ │                     │                                             │
│ │ ❌ Failure: Build   │  ← Build errors reported in workflow       │
│ │    errors reported  │                                             │
│ └─────────────────────┘                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Docker Multi-Stage Build Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCKER BUILD STAGES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Stage 1: Builder (Node.js)                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  FROM node:20.0.0-bullseye AS builder                          │ │
│ │                                                                 │ │
│ │  WORKDIR /app                                                   │ │
│ │  COPY package.json package-lock.json* ./                       │ │
│ │  RUN npm ci              ← Install dependencies                │ │
│ │  COPY . .                ← Copy source code                    │ │
│ │  RUN npm run build       ← Build React app with Vite          │ │
│ │                                                                 │ │
│ │  Output: /app/dist/ (production static files)                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                    │                               │
│                                    ▼                               │
│                                                                     │
│ Stage 2: Production (Nginx)                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  FROM nginx:alpine AS production                                │ │
│ │                                                                 │ │
│ │  COPY --from=builder /app/dist /usr/share/nginx/html           │ │
│ │  COPY nginx.conf /etc/nginx/nginx.conf                         │ │
│ │  COPY docker-entrypoint.sh /docker-entrypoint.sh               │ │
│ │                                                                 │ │
│ │  Features:                                                      │ │
│ │  • Serves React SPA                                             │ │
│ │  • Runtime env injection                                        │ │
│ │  • API proxy to MedDRA service                                  │ │
│ │  • Security headers                                             │ │
│ │  • Health checks                                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Timeline and Dependencies

```
Time Flow: Push/PR → Workflow Trigger → Build → Result

┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│  Code Push  │───▶│   Workflow   │───▶│ Docker Build │───▶│   Result    │
│     or      │    │   Triggers   │    │   Process    │    │  Success/   │
│ PR Update   │    │              │    │              │    │   Fail      │
└─────────────┘    └──────────────┘    └──────────────┘    └─────────────┘
    ~instant           ~30 seconds        ~2-5 minutes        immediate

Dependencies:
• Node.js 20.0.0 (from Docker Hub)
• npm packages (from package.json)
• Nginx Alpine (from Docker Hub)
• Source code (from GitHub repository)
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTEGRATION FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ GitHub Repository                                                   │
│ ┌─────────────────────┐                                             │
│ │ Source Code         │                                             │
│ │ • React/TypeScript  │                                             │
│ │ • AERS Medical App  │                                             │
│ │ • Vite Build Config │                                             │
│ └─────────────────────┘                                             │
│            │                                                        │
│            ▼                                                        │
│ ┌─────────────────────┐                                             │
│ │ GitHub Actions      │  ← Automated CI/CD Platform                │
│ │ Workflow Runner     │                                             │
│ └─────────────────────┘                                             │
│            │                                                        │
│            ▼                                                        │
│ ┌─────────────────────┐                                             │
│ │ Docker Build        │  ← Containerization                        │
│ │ • Multi-stage       │                                             │
│ │ • Optimized         │                                             │
│ └─────────────────────┘                                             │
│            │                                                        │
│            ▼                                                        │
│ ┌─────────────────────┐                                             │
│ │ Ready for Deploy    │  ← Image ready for:                        │
│ │ • Google Cloud Run  │   • Cloud platforms                        │
│ │ • AWS ECS           │   • Kubernetes                              │
│ │ • Docker Registry   │   • Local development                      │
│ └─────────────────────┘                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Workflow Status Indicators

### Success Flow
```
✅ Push/PR → ✅ Checkout → ✅ Docker Build → ✅ Green Check Mark
```

### Failure Flow
```
❌ Push/PR → ✅ Checkout → ❌ Docker Build → ❌ Red X Mark
                                    │
                                    ▼
                            📝 Build Error Logs
                            📧 Email Notification
                            🔔 GitHub Notification
```

This visual representation helps understand how the GitHub workflow orchestrates the continuous integration process for the AERS medical reporting application.