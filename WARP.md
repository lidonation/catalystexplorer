# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CatalystExplorer is a Laravel-based platform for exploring Project Catalyst proposals and outcomes. It features:
- **Backend**: Laravel 12+ with PostgreSQL database
- **Frontend**: Inertia.js with React 18+ and TypeScript
- **Infrastructure**: Docker-based development with Laravel Sail
- **Search**: Meilisearch integration
- **Charts**: Nivo library for data visualization
- **Testing**: Pest (PHP) and Playwright (E2E)

## Development Setup Commands

### Initial Setup
```bash
# Clone and setup the project
git clone https://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com.git
cd www.catalystexplorer.com
make init  # Installs dependencies and starts Docker services
```

### Daily Development
```bash
make up            # Start Docker containers
make vite          # Start Vite dev server (for frontend development)
make watch         # Start containers + Vite in one command
make down          # Stop containers (keep volumes)
make restart       # Stop and start containers
```

### Backend Commands
```bash
make artisan migrate              # Run database migrations
make artisan db:seed             # Seed database
make artisan key:generate        # Generate app key
make backend-install            # Install composer dependencies
make lint-backend               # Run Laravel Pint (code formatting)
make test-backend               # Run Pest tests
```

### Frontend Commands  
```bash
make frontend-install           # Install/reinstall node modules
make frontend-clean            # Clean node_modules and caches
make build                     # Build for production
make tsc                       # Run TypeScript compiler
make lint-frontend             # Run ESLint
```

### Search Index Management
```bash
# Create search indexes for all models
make create-index

# Create index for specific model (e.g., Proposal)
make create-index proposal

# Import data to search indexes
make import-index

# Flush search indexes
make flush-index

# Delete search indexes
make delete-index
```

### Testing Commands
```bash
# Backend tests (Pest with architecture tests)
make test-backend

# End-to-end tests (Playwright)
make test-e2e

# Run specific E2E test file
make test-e2e FILE=tests/e2e/proposals.spec.ts

# Stop E2E test services
make test-e2e-stop
```

### Database Schema Generation
```bash
# Generate IndexedDB schema for frontend
make db-schema
```

## Architecture Overview

### Backend Architecture (Laravel)

**Core Models**: The platform centers around these key entities:
- `Proposal` - Project Catalyst proposals with funding details
- `Campaign` - Funding campaigns (grouped proposals)  
- `Fund` - Higher-level funding rounds
- `IdeascaleProfile` - Community member profiles
- `Review` - Community reviews of proposals
- `Vote` - Voting records from Jormungandr chain
- `Community` - User groups and organizations

**Data Transfer Objects (DTOs)**: Located in `app/DataTransferObjects/`, these define structured data for API responses and type safety with the frontend.

**API Strategy**: 
- RESTful API with versioning (`/api/v1/`)
- Uses Spatie Query Builder for advanced filtering/sorting
- API Resources for consistent JSON responses
- Legacy unversioned endpoints maintained for backward compatibility

**Search Integration**: Meilisearch powers the search functionality with:
- Custom search indexes for major models
- Scout integration for automatic indexing
- Configurable index management via Artisan commands

**External Data Sources**:
- Cardano blockchain data via CARP (Cardano Application with Real-time Postgres)
- Ideascale API integration for community data
- NMKR integration for NFT functionality

### Frontend Architecture (React + Inertia.js)

**Directory Structure**:
- `resources/js/Components/` - Reusable React components
- `resources/js/pages/` - Page-level components mapped to Laravel routes
- `resources/js/layouts/` - Layout components
- `resources/js/hooks/` - Custom React hooks
- `resources/js/db/` - IndexedDB integration for offline data

**State Management**: 
- React hooks and context for local state
- IndexedDB (via Dexie) for persistent client-side data
- Inertia.js for server-state synchronization

**UI Framework**:
- Tailwind CSS for styling
- Radix UI components for accessibility
- Nivo for data visualization charts
- Framer Motion for animations

**TypeScript Integration**:
- Laravel TypeScript Transformer generates types from PHP DTOs
- Strict typing throughout React components
- Generated database schema types for IndexedDB

### Database Architecture

**Primary Database**: PostgreSQL with these key patterns:
- Snake_case naming for tables/columns
- UUID primary keys with hash ID casting for public URLs
- Eloquent relationships define all associations
- Migrations with descriptive names and proper down() methods

**Search Database**: Meilisearch indexes:
- `cx_proposals` - Main proposal search
- `cx_communities` - Community search
- `cx_ideascale_profiles` - Profile search
- Custom index configuration per model

**External Database**: CARP connection for Cardano blockchain data access

### Development Patterns

**Code Organization**: Follows Laravel conventions with:
- Controllers use resourceful routes when possible
- Models include DTOs, Policies, and Repositories as required
- Services extracted for complex business logic
- Jobs for background processing

**API Patterns**:
- API Resources transform model data consistently
- Spatie Query Builder enables powerful filtering: `filter[status]=active&sort=-created_at&include=campaign`
- Pagination with configurable per_page (max 60)

**Frontend Patterns**:
- Function components with React Hooks
- Custom hooks for data fetching and state management
- Component composition over inheritance
- Consistent error handling and loading states

## Key Configuration

### Environment Variables
- Database: PostgreSQL connection + CARP secondary connection
- Redis: Used for caching, queues, and sessions
- Meilisearch: Search engine configuration
- External APIs: Ideascale, NMKR tokens

### Docker Services
- `catalystexplorer.com` - Main Laravel application
- `catalystexplorer.pgsql` - PostgreSQL database  
- `catalystexplorer.redis` - Redis cache/queue
- `catalystexplorer.meilisearch` - Search engine
- `catalystexplorer.allure` - E2E test reporting

### Workflow System
Multi-step user workflows are implemented for:
- Claiming Ideascale profiles
- Creating voter lists with wallet signatures
- Generating NFTs for completed projects
- Service registration

Each workflow uses session state and middleware for step validation.

## Important Development Notes

### Commit Standards
Follow Conventional Commits: `<type>[scope]: <ticket-no> <description>`
Examples: `feat(proposals): ln-1343 added search filtering`, `fix(api): ln-1545 resolved pagination bug`

### Testing Strategy
- **Pest (PHP)**: Unit/feature tests with architecture testing
- **Playwright (E2E)**: Full browser automation with Allure reporting
- Tests run in isolated Docker environment with test database

### Code Style
- **PHP**: Laravel Pint for formatting, follows PSR-12
- **JavaScript/TypeScript**: ESLint + Prettier with import organization
- **Database**: Snake_case, explicit foreign keys, proper indexes

### Search Best Practices
- Use `make create-index` before `make import-index` for new models
- Search indexes require model configuration in `MODELS` variable in Makefile
- Test search functionality after index changes

### Performance Considerations  
- Eager loading relationships to prevent N+1 queries
- Redis caching for frequently accessed data
- Meilisearch for fast full-text search
- PostgreSQL query optimization with proper indexing
