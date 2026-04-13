<!-- markdownlint-disable MD041 MD032 -->

<div align="center">

# Quill

[![Expo](https://img.shields.io/badge/Expo%20SDK-52+-000029?style=for-the-badge&logo=expo)](https://expo.dev)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.76%2B-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-CB3837?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

[![Build Status](https://img.shields.io/github/actions/workflow-status/quill-app/quill/main.yml?branch=main&style=for-the-badge)](https://github.com/quill-app/quill/actions)
[![Code Quality](https://img.shields.io/codeclimate/maintainability/quill-app/quill?style=for-the-badge)](https://codeclimate.com)
[![Last Commit](https://img.shields.io/github/last-commit/quill-app/quill/main?style=for-the-badge)](https://github.com/quill-app/quill/commits/main)

A full-stack mobile application powering seamless reading experiences with modern authentication, real-time chat, and intelligent book management — built with React Native, Python, and love.

[Report Bug](https://github.com/quill-app/quill/issues) · [Request Feature](https://github.com/quill-app/quill/issues) · [Documentation](https://quill.docs.app) · [API Reference](https://api.quill.docs.app)

</div>

---

## Table of Contents

1. [About Quill](#about-quill)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Clone the Repository](#clone-the-repository)
   - [Frontend Setup](#frontend-setup-expo)
   - [Backend Setup](#backend-setup-python)
   - [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)
14. [Code of Conduct](#code-of-conduct)
15. [Changelog](#changelog)
16. [Acknowledgments](#acknowledgments)
17. [License](#license)
18. [Contact & Support](#contact--support)

---

## About Quill

**Quill** is a modern, full-stack mobile application designed to transform how users discover, read, and manage their digital book collections. Built with scalability and developer experience in mind, Quill combines a sleek React Native frontend with a robust Python backend to deliver a seamless, responsive reading experience across iOS and Android devices.

### Why Quill?

- **Intuitive Design**: Clean, accessible UI following Material Design 3 principles
- **Powerful Backend**: RESTful API with streaming support for real-time experiences
- **Production-Ready**: Containerized services with CI/CD, monitoring, and observability
- **Developer Experience**: Well-documented codebase with clear coding standards
- **Community-Driven**: Open to contributions with a clear contribution guide

> **Quill** — Where technology meets the love for reading.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-------------|---------|---------|
| React Native (Expo) | SDK 52+ | Cross-platform mobile framework |
| TypeScript | 5.6+ | Type-safe JavaScript |
| React Navigation | 7.x | Navigation and routing |
| Axios | 1.7+ | HTTP client |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| AsyncStorage | 2.x | Local persistence |
| Expo Notifications | 1.x | Push notifications |
| Expo SecureStore | 1.x | Secure credential storage |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Server-side runtime |
| FastAPI | 0.115+ | Modern web framework |
| SQLAlchemy | 2.x | ORM |
| Alembic | 1.x | Database migrations |
| Pydantic | 2.x | Data validation |
| Python-Jose | 3.x | JWT handling |
| Passlib | 1.7+ | Password hashing |
| Uvicorn | 0.32+ | ASGI server |
| Celery | 5.x | Async task queue |
| Redis | 7.x | Caching & message broker |

### Database & Storage

| Technology | Purpose |
|------------|---------|
| PostgreSQL 15+ | Primary relational database |
| SQLite | Development database |
| Redis | Caching, session, queue |
| S3 / Local Storage | Book file storage |

### DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Orchestration |
| GitHub Actions | CI/CD pipelines |
| ArgoCD | GitOps deployment |
| Helm | Package management |
| Prometheus | Metrics collection |
| Grafana | Visualization |
| Loki | Log aggregation |
| Istio | Service mesh |
| AWS | Cloud infrastructure |
| Terraform | Infrastructure as Code |

---

## Features

### Core Features

| Feature | Description | Status |
|---------|------------|--------|
| **User Authentication** | Secure signup/login with JWT tokens, OTP verification, password reset | ✅ Complete |
| **Onboarding Flow** | Guided first-time user experience with tour and preferences | ✅ Complete |
| **Chat System** | Real-time messaging between users | ✅ Complete |
| **Book Management** | View catalog, upload PDFs/EPUBs, in-app preview | ✅ Complete |
| **User Profile** | Settings, preferences, notifications, help center | ✅ Complete |
| **Search & Discovery** | Full-text search with filters and recommendations | 🔄 In Progress |
| **Offline Mode** | Download books for offline reading | 🔄 In Progress |
| **Social Features** | Share book excerpts, reading lists | 🔄 Planned |
| **Push Notifications** | Real-time alerts and updates | 🔄 Planned |

### Technical Features

- **Responsive Design**: Mobile-optimized UI for iOS and Android
- **Accessibility**: WCAG 2.1 AA compliant
- **PWA Support**: Progressive web app capabilities
- **Dark Mode**: System-wide theme support
- **Multi-language**: i18n support (English, Hindi, more coming)
- **Analytics**: Usage tracking and insights
- **Error Reporting**: Sentry integration for crash reporting

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile Client                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   React     │  │   State    │  │   Navigation      │   │
│  │   Native   │  │   (Zustand)│  │   (React Nav)   │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
└─────────���─��─────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (Nginx)                      │
│                    (Rate Limiting, SSL/TLS)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Auth Service   │ │  Book Service  │ │  Chat Service  │
│  (FastAPI)      │ │  (FastAPI)    │ │  (FastAPI)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ PostgreSQL   │  │   Redis     │  │      S3        │      │
│  │  (Primary)  │  │  (Cache)    │  │    (Files)     │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

| Service | Responsibility | Port | Endpoints |
|---------|---------------|------|----------|
| **Auth Service** | Authentication, authorization, user management | 8001 | `/auth/*` |
| **User Service** | Profile, preferences, settings | 8002 | `/users/*` |
| **Book Service** | Book CRUD, catalog, search | 8003 | `/books/*` |
| **Chat Service** | Real-time messaging, WebSocket | 8004 | `/chat/*` |
| **Notification Service** | Push notifications, emails | 8005 | `/notifications/*` |
| **Analytics Service** | Usage tracking, reporting | 8006 | `/analytics/*` |

---

## Project Structure

```
quill/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── android/                # Android native configuration
├── ios/                   # iOS native configuration
├── src/                   # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── constants/        # App constants
│   └── assets/            # Images, fonts, etc.
├── backend/               # Backend source code
│   ├── app/
│   │   ├── api/           # API endpoints/routers
│   │   ├── core/         # Core configurations
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── alembic/          # Database migrations
│   ├── tests/            # Backend tests
│   └── scripts/          # Utility scripts
├── docker/               # Docker compositions
├── k8s/                  # Kubernetes manifests
├── docs/                  # Documentation
├── .env.example          # Environment variables template
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── pytest.ini            # Pytest configuration
├── docker-compose.yml    # Docker Compose configuration
├── package.json         # Frontend dependencies
├── pyproject.toml       # Backend dependencies
├── README.md            # This file
└── LICENSE              # License file
```

---

## Getting Started

### Prerequisites

_verify your environment meets these requirements before proceeding_

| Requirement | Minimum Version | Recommended Version | Check Command |
|-------------|--------------|-------------------|--------------|
| **Node.js** | 18.x | 20.x LTS | `node --version` |
| **Python** | 3.9 | 3.12 | `python3 --version` |
| **npm** | 9.x | 10.x | `npm --version` |
| **pip** | 23.x | 24.x | `pip --version` |
| **Docker** | 24.x | 25.x | `docker --version` |
| **Docker Compose** | 2.x | v2 | `docker compose version` |
| **Git** | 2.x | 2.43+ | `git --version` |
| **Expo CLI** | 13.x | Latest | `npx expo --version` |

#### Optional Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Android Studio** | Android emulator | [Download](https://developer.android.com/studio) |
| **Xcode** | iOS development (macOS only) | App Store |
| **PostgreSQL 15+** | Local database | [Download](https://www.postgresql.org/download/) |
| **Redis** | Local caching | `brew install redis` |
| **awscli** | AWS CLI | `pip install awscli` |
| **tfenv** | Terraform version manager | [GitHub](https://github.com/tfutils/tfenv) |

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/quill-app/quill.git
cd quill

# Check available branches
git branch -a

# Install Git hooks
make install-hooks
```

### Frontend Setup (Expo)

#### 1. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn (recommended for faster installs)
yarn install
```

#### 2. Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Edit the environment file
nano .env
```

Required environment variables:

```env
# .env
API_URL=http://localhost:8000
API_VERSION=v1
EXPO_PUBLIC_ENV=development
```

#### 3. Start Development Server

```bash
# Start Expo server
npx expo start

# Or with clear cache
npx expo start --clear

# Run on specific platform
npx expo run:android    # Android
npx expo run:ios        # iOS (macOS only)
```

#### 4. Using Expo Go

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the terminal
3. The app will load with hot reload enabled

### Backend Setup (Python)

#### 1. Navigate to Backend Directory

```bash
cd backend
```

#### 2. Create Virtual Environment

```bash
# Using venv (recommended)
python3 -m venv venv

# Activate on Linux/macOS
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate.bat  # CMD
venv\Scripts\Activate.ps1  # PowerShell

# Verify activation
which python  # Linux/macOS
where python  # Windows
```

#### 3. Install Dependencies

```bash
# Using pip
pip install -r requirements.txt

# Using poetry (recommended)
pip install poetry
poetry install
```

#### 4. Configure Environment

```bash
# Copy the environment template
cp app/.env.example app/.env

# Edit the environment file
nano app/.env
```

Required environment variables:

```env
# app/.env
DATABASE_URL=postgresql://quill:quill@localhost:5432/quill
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=quill-books

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
```

#### 5. Run Database Migrations

```bash
# Apply migrations
alembic upgrade head

# Or using Django migrations (if applicable)
python manage.py migrate
```

#### 6. Start Backend Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or with Docker
docker compose up -d postgres redis
python main.py

# Server runs on http://localhost:8000
# API docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Environment Configuration

#### Development Environment

```bash
# Minimum required variables
cp .env.example .env

# Edit with your values
nano .env
```

Example development `.env`:

```env
# Frontend (.env)
API_URL=http://10.0.2.2:8000    # Android emulator
API_URL=http://localhost:8000   # iOS simulator
API_VERSION=v1
EXPO_PUBLIC_ENV=development

# Backend (app/.env)
DATABASE_URL=postgresql://quill:quill@localhost:5432/quill
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret-key-change-this
JWT_SECRET_KEY=dev-jwt-secret-change-this
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
```

#### Production Environment

```env
# Backend (app/.env)
DATABASE_URL=postgresql://user:password@prod-db:5432/quill
REDIS_URL=redis://prod-redis:6379/0
SECRET_KEY=<generate-with-openssl-rand-hex-32>
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# AWS Production
AWS_REGION=us-east-1
AWS_S3_BUCKET=quill-prod-books
AWS_CLOUDFRONT_URL=https://cdn.quill.app

# Security
CORS_ORIGINS=https://quill.app,https://api.quill.app
RATE_LIMIT_PER_MINUTE=60
SESSION_COOKIE_SECURE=true
```

> **Security Note**: Never commit `.env` files to version control. Use `.env.example` as a template.

---

## Running the Application

### Option 1: Native Development

```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Start Frontend
npx expo start

# Terminal 3: (Optional) Start Redis
redis-server
```

### Option 2: Docker Compose (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Option 3: Kubernetes (Production)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check pod status
kubectl get pods

# View logs
kubectl logs -f deployment/quill-backend
```

---

## API Documentation

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| **POST** | `/auth/register` | Register new user | No |
| **POST** | `/auth/login` | User login | No |
| **POST** | `/auth/refresh` | Refresh token | Yes |
| **POST** | `/auth/logout` | User logout | Yes |
| **POST** | `/auth/forgot-password` | Request password reset | No |
| **POST** | `/auth/reset-password` | Reset password | No |
| **GET** | `/users/me` | Get current user | Yes |
| **PATCH** | `/users/me` | Update current user | Yes |
| **GET** | `/books` | List books | Yes |
| **POST** | `/books` | Upload book | Yes |
| **GET** | `/books/{id}` | Get book details | Yes |
| **DELETE** | `/books/{id}` | Delete book | Yes |
| **GET** | `/books/{id}/download` | Download book | Yes |
| **GET** | `/chat/messages` | Get chat messages | Yes |
| **POST** | `/chat/messages` | Send chat message | Yes |
| **WebSocket** | `/ws/chat` | Real-time chat | Yes |

### API Documentation (Interactive)

Once the backend is running, visit:

| Documentation | URL |
|---------------|-----|
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| **Postman Collection** | [Download](https://github.com/quill-app/quill/blob/main/docs/Quill-API.json) |

### Example API Calls

```bash
# Register a new user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Get books (with token)
curl -X GET http://localhost:8000/books \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Testing

### Frontend Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run tests for specific file
npm test -- src/components/__tests__/Button.test.tsx

# Run linting
npm run lint

# Run prettier
npm run format
```

### Backend Testing

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests matching pattern
pytest -k "test_auth"

# Run with verbose output
pytest -v

# Run linting
flake8 app
black app --check
isort app --check-only
mypy app
```

### Running All Tests

```bash
# Run all tests (frontend + backend)
make test

# Run with coverage
make test-coverage
```

---

## Deployment

### Docker Deployment

```bash
# Build production images
docker build -t quill/frontend:latest ./frontend
docker build -t quill/backend:latest ./backend

# Run production containers
docker compose -f docker-compose.production.yml up -d
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/ingress/

# Scale services
kubectl scale deployment quill-backend --replicas=3

# Check status
kubectl get pods,svc,ingress
```

### AWS Deployment

```bash
# Configure AWS CLI
aws configure

# Create ECR repository
aws ecr create-repository --repository-name quill-frontend
aws ecr create-repository --repository-name quill-backend

# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/quill-frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/quill-backend:latest

# Deploy to ECS
ecs-cli compose up
```

### Terraform Deployment

```bash
# Initialize Terraform
cd infra
terraform init

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

---

## Security

### Security Checklist

- [ ] All secrets stored in environment variables, not in code
- [ ] Strong password hashing (bcrypt/argon2)
- [ ] JWT tokens with short expiration
- [ ] HTTPS enforced in production
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation with Pydantic
- [ ] SQL injection prevention (SQLAlchemy ORM)
- [ ] XSS protection (React escaped output)
- [ ] CSRF tokens for state-changing operations
- [ ] Regular dependency updates
- [ ] Security audit with Snyk/Dependabot

### Reporting Security Vulnerabilities

If you find a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email security@quill.app with details
3. We will acknowledge within 24 hours
4. We will provide a timeline for fixes
5. We will credit you in the security Hall of Fame (with permission)

---

## Troubleshooting

### Common Issues

#### Frontend Issues

| Issue | Solution |
|-------|----------|
| Metro bundler not starting | Run `npx expo start --clear` |
| Module not found | Delete `node_modules` and run `npm install` |
| TypeScript errors | Run `npx tsc --noEmit` |
| Image loading errors | Clear Expo cache: `npx expo r -c` |
| iOS build fails | Check Xcode version and run `xcodebuild -version` |
| Android APK build fails | Verify Java version: `java -version` (should be 17+) |

#### Backend Issues

| Issue | Solution |
|-------|----------|
| Import errors | Activate virtual environment: `source venv/bin/activate` |
| Database connection | Verify DATABASE_URL in `.env` |
| Migration failures | Check PostgreSQL is running: `pg_isready` |
| Redis connection | Verify Redis is running: `redis-cli ping` |
| Port already in use | Kill process: `lsof -ti:8000 \| xargs kill` |
| CORS errors | Add frontend URL to CORS_ORIGINS |

#### Database Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Start PostgreSQL: `pg_ctl -D /usr/local/var/postgres start` |
| Migration fails | Check migrations: `alembic current` |
| Data loss | Never run migrations on production without backup |

#### Docker Issues

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs: `docker compose logs` |
| Port conflicts | Stop other services using the port |
| Volume permissions | Check file ownership: `ls -la` |

### Getting Help

1. **Check Documentation**: [docs.quill.app](https://docs.quill.app)
2. **Search Existing Issues**: [GitHub Issues](https://github.com/quill-app/quill/issues)
3. **Ask in Community**: [Discord](https://discord.gg/quill)
4. **Contact Support**: support@quill.app

---

## Contributing

We welcome contributions! Please follow these steps:

### Contributing Guidelines

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** with clear messages
7. **Push** to your fork
8. **Submit** a Pull Request

### Branch Naming

- `feature/description` — New features (e.g., `feature/add-dark-mode`)
- `fix/description` — Bug fixes (e.g., `fix/login-redirect`)
- `docs/description` — Documentation (e.g., `docs/api-reference`)
- `refactor/description` — Code refactoring
- `test/description` — Adding tests

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org):

```bash
feat: add new book upload feature
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify authentication logic
test: add unit tests for auth module
chore: update dependencies
```

### Code Style

| Language | Tool | Configuration |
|----------|------|-------------|
| **TypeScript** | ESLint + Prettier | `.eslintrc.js`, `.prettierrc` |
| **Python** | Black + isort | `pyproject.toml` |
| **Markdown** | markdownlint | `.markdownlint.json` |

### Pull Request Template

```markdown
## Description
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
<!-- Describe testing performed -->

## Checklist
- [ ] My code follows the code style
- [ ] I have added tests
- [ ] Documentation updated (if applicable)
- [ ] All tests pass

## Screenshots (if UI changes)
```

### Development Workflow

```bash
# Setup development environment
make setup

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Run tests before pushing
make test

# Push and create PR
git push origin feature/my-feature
```

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- Harassment of any kind
- Inappropriate language or imagery
-Personal or political attacks
- Publishing others' private information
- Unwelcome sexual attention or advances

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community team at conduct@quill.app. All complaints will be reviewed and investigated promptly and fairly.

---

## Changelog

All notable changes to this project will be documented in [CHANGELOG.md](CHANGELOG.md).

### Versioning

We use [Semantic Versioning](http://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Schedule

- **Patch Releases**: As needed (bug fixes)
- **Minor Releases**: Monthly (new features)
- **Major Releases**: Annually (breaking changes)

---

## Acknowledgments

### Contributors

Thank you to all our contributors! 🎉

[![Contributors](https://contrib.rocks/image?repo=quill-app/quill)](https://github.com/quill-app/quill/graphs/contributors)

### Technologies

We built Quill with these amazing technologies:

- [React Native](https://reactnative.dev)
- [Expo](https://expo.dev)
- [FastAPI](https://fastapi.tiangolo.com)
- [PostgreSQL](https://www.postgresql.org)
- [Docker](https://www.docker.com)
- [Kubernetes](https://kubernetes.io)

### Inspiration

- [RealWorld Example App](https://github.com/gothinkster/realworld)
- [Expo Web](https://docs.expo.dev)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/best-practices/)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

| Package | License |
|---------|---------|
| React Native | MIT |
| FastAPI | MIT |
| PostgreSQL | PostgreSQL License |
| Expo | MIT |

---

## Contact & Support

### Get in Touch

| Channel | Link |
|--------|------|
| **Website** | [quill.app](https://quill.app) |
| **Documentation** | [docs.quill.app](https://docs.quill.app) |
| **API Reference** | [api.quill.app](https://api.quill.app) |
| **GitHub Issues** | [github.com/quill-app/quill/issues](https://github.com/quill-app/quill/issues) |
| **Discord** | [discord.gg/quill](https://discord.gg/quill) |
| **Twitter** | [@quillapp](https://twitter.com/quillapp) |
| **Email** | support@quill.app |

### Enterprise Support

For enterprise support and custom development, contact enterprise@quill.app.

---

<div align="center">

**Quill** — Made with ❤️ by the community, for the community.

[![Star us on GitHub](https://img.shields.io/github/stars/quill-app/quill?style=social)](https://github.com/quill-app/quill)
[![Follow us on Twitter](https://img.shields.io/twitter/follow/quillapp?style=social)](https://twitter.com/quillapp)

</div>