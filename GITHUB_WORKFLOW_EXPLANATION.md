# GitHub Workflow Explanation - AERS Reporting Agent

## Overview

The GitHub workflow in this repository implements a **Continuous Integration (CI) pipeline** that automatically builds Docker images for the AERS (Adverse Event Reporting System) medical reporting application whenever code changes are made to the main branch.

## Workflow File Location
```
.github/workflows/docker-image.yml
```

## Workflow Details

### Name
**"Docker Image CI"** - Indicates this is a Continuous Integration workflow focused on Docker image building.

### Triggers (When it runs)
The workflow automatically executes in two scenarios:

1. **Push to main branch**
   ```yaml
   on:
     push:
       branches: [ "main" ]
   ```
   - Runs when code is directly pushed to the main branch
   - Ensures the latest main branch code is always containerized

2. **Pull Request to main branch**
   ```yaml
   on:
     pull_request:
       branches: [ "main" ]
   ```
   - Runs when a Pull Request is opened, updated, or synchronized targeting main
   - Validates that proposed changes can be successfully containerized
   - Provides early feedback to developers before merging

### Job Configuration

**Runner Environment:**
- Uses `ubuntu-latest` (currently Ubuntu 22.04)
- Provides a clean Linux environment with Docker pre-installed

### Workflow Steps

#### Step 1: Code Checkout
```yaml
- uses: actions/checkout@v4
```
**Purpose:** Downloads the repository source code to the runner
- Uses the latest stable version (v4) of the checkout action
- Retrieves the complete repository content including all files needed for Docker build

#### Step 2: Docker Image Build
```yaml
- name: Build the Docker image
  run: docker build . --file Dockerfile --tag my-image-name:$(date +%s)
```
**Purpose:** Builds a Docker image from the application source code

**Command Breakdown:**
- `docker build .` - Build from current directory (repository root)
- `--file Dockerfile` - Use the Dockerfile in the repository root
- `--tag my-image-name:$(date +%s)` - Tag the image with a timestamp

**Tag Strategy:**
- `$(date +%s)` generates a Unix timestamp (seconds since epoch)
- Creates unique tags like: `my-image-name:1691234567`
- Prevents tag conflicts and provides versioning

## Application Context

### What is AERS Reporting Agent?
This workflow supports a **medical reporting application** that:
- Helps users report adverse drug events (side effects) to the FDA
- Uses Google Gemini AI for conversational data collection
- Built with React/TypeScript and Vite
- Requires containerization for scalable deployment

### Why Docker CI is Important for this Application?

1. **Medical Compliance:** Ensures consistent, tested builds for healthcare software
2. **Deployment Ready:** Creates container images ready for cloud platforms (Google Cloud Run)
3. **Environment Consistency:** Guarantees the same runtime environment across development, testing, and production
4. **Quick Feedback:** Validates that code changes don't break the containerization process

## Docker Build Process

The workflow triggers a **multi-stage Docker build**:

### Stage 1: Builder (Node.js)
```dockerfile
FROM node:20.0.0-bullseye AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
```
- Installs Node.js dependencies
- Compiles TypeScript and builds React application with Vite
- Generates production-ready static files in `/app/dist`

### Stage 2: Production (Nginx)
```dockerfile
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```
- Uses lightweight Alpine Linux with Nginx
- Copies built static files from builder stage
- Configures Nginx for serving the React SPA

### Runtime Configuration
The container includes:
- Environment variable injection via `docker-entrypoint.sh`
- API proxying to external MedDRA medical terminology service
- Security headers and caching optimization
- Health check endpoints

## Workflow Benefits

### For Developers
- **Immediate Feedback:** Know if changes break the Docker build before merging
- **Consistent Environment:** Same containerized environment for all team members
- **Version Control:** Timestamped images provide clear build history

### For Operations
- **Deployment Ready:** Every successful build creates a deployable artifact
- **Rollback Capability:** Timestamped tags enable easy rollbacks
- **Cloud Platform Ready:** Images work seamlessly with Google Cloud Run, AWS ECS, etc.

### For Medical Application Requirements
- **Compliance:** Reproducible builds support regulatory requirements
- **Reliability:** Automated testing of containerization reduces deployment risks
- **Scalability:** Container images enable horizontal scaling for high user loads

## Current Limitations & Potential Improvements

### Current Limitations
1. **Image Storage:** Built images are not pushed to a registry (just built and discarded)
2. **Basic Tagging:** Simple timestamp tagging without semantic versioning
3. **No Testing:** No automated tests run before or after Docker build
4. **Single Architecture:** Only builds for linux/amd64 architecture

### Suggested Improvements
1. **Add Container Registry:** Push images to Docker Hub, Google Container Registry, or GitHub Container Registry
2. **Semantic Versioning:** Use git tags or version numbers for meaningful image tags
3. **Multi-Architecture Builds:** Support ARM64 for Apple Silicon and cloud ARM instances
4. **Security Scanning:** Add container vulnerability scanning
5. **Integration Testing:** Test the built container before considering the workflow successful

## Conclusion

This GitHub workflow provides a solid foundation for continuous integration of a containerized medical reporting application. It ensures that every code change can be successfully built into a Docker image, providing confidence for deployment and maintaining the reliability required for healthcare software.

The workflow is particularly well-suited for the AERS application's deployment needs on cloud platforms while maintaining the consistency and reliability required for medical software development.