@echo off
echo Building Docker image locally...
docker build -t aers-reporting-agent .

if %ERRORLEVEL% neq 0 (
    echo Docker build failed!
    exit /b 1
)

echo Running container locally on port 8080...
echo Visit http://localhost:8080 to test the application
docker run -p 8080:8080 aers-reporting-agent

REM To stop the container, press Ctrl+C or run:
REM docker stop $(docker ps -q --filter ancestor=aers-reporting-agent)
