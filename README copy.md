# E-Voting System

A modern, secure electronic voting system built with Vue 3, TypeScript, and Vite. This application provides a comprehensive platform for managing elections, including user authentication, party management, candidate registration, voting, and real-time results.

## Features

- **User Authentication**: Secure login and registration with JWT token-based authentication
- **User Management**: CRUD operations for users with ECT (Electoral Commission of Tanzania) status management
- **Party Management**: Create, update, and manage political parties with member associations
- **Candidate Setup**: Register candidates and associate them with political parties
- **Voting System**: Secure voting mechanism with duplicate vote prevention
- **Results Dashboard**: Real-time vote results by constituency
- **Constituency Management**: Manage electoral constituencies

## Technology Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Pinia** - State management
- **Vue Router** - Client-side routing with navigation guards
- **Axios** - HTTP client for API communication
- **Vite** - Fast build tool and development server
- **fast-check** - Property-based testing

## Architecture Overview

The application follows a feature-based architecture with clear separation of concerns:

### API Layer
- **HTTP Client** (`src/api/client.ts`): Axios instance with request/response interceptors for authentication and error handling
- **Endpoints** (`src/api/endpoints.ts`): Centralized API endpoint constants
- **Services** (`src/api/services/`): Domain-specific API services (auth, user, party, candidate, vote, constituency)

### State Management
- **Pinia Stores** (`src/stores/`): Reactive state management for auth, users, parties, candidates, votes, and constituencies
- Stores handle business logic and API integration
- Type-safe with TypeScript interfaces

### Composables
- **Reusable Logic** (`src/composables/`): Composition functions for forms, toasts, and feature-specific logic
- Encapsulate common patterns and side effects
- Promote code reuse across components

### Type System
- **Models** (`src/types/models/`): Domain entity interfaces
- **DTOs** (`src/types/dto/`): Data Transfer Objects for API requests
- **API Types** (`src/types/api/`): API response and error type definitions

### Utilities
- **Validators** (`src/utils/validators.ts`): Form validation functions
- **Formatters** (`src/utils/formatters.ts`): Data formatting utilities
- **Error Handler** (`src/utils/error-handler.ts`): Centralized error handling
- **Token Manager** (`src/utils/token-manager.ts`): JWT token management

### Router Guards
- **Authentication Guard**: Protects routes requiring login
- **Authorization Guard**: Role-based access control (admin, ECT, voter)

## Project Structure

```
src/
├── api/                    # API services and HTTP client
│   ├── client.ts           # Axios HTTP client with interceptors
│   ├── endpoints.ts        # API endpoint constants
│   └── services/           # Domain-specific API services
│       ├── auth.service.ts
│       ├── user.service.ts
│       ├── party.service.ts
│       ├── candidate.service.ts
│       ├── vote.service.ts
│       └── constituency.service.ts
├── stores/                 # Pinia state management stores
│   ├── auth.store.ts
│   ├── user.store.ts
│   ├── party.store.ts
│   ├── candidate.store.ts
│   ├── vote.store.ts
│   └── constituency.store.ts
├── composables/            # Reusable composition functions
│   ├── useForm.ts
│   └── useToast.ts
├── types/                  # TypeScript type definitions
│   ├── models/             # Domain models
│   ├── dto/                # Data Transfer Objects
│   └── api/                # API response/error types
├── utils/                  # Utility functions
│   ├── validators.ts
│   ├── formatters.ts
│   ├── error-handler.ts
│   └── token-manager.ts
├── features/               # Feature-based components
│   ├── auth/               # Authentication (login, registration)
│   ├── users/              # User management
│   ├── parties/            # Party management
│   ├── candidates/         # Candidate setup
│   ├── voting/             # Voting and results
│   ├── constituencies/     # Constituency management
│   └── profile/            # User profile
├── router/                 # Vue Router configuration
│   ├── index.ts            # Route definitions
│   └── guards/             # Navigation guards
├── layouts/                # Layout components
│   └── DashboardLayout.vue
├── config/                 # Application configuration
│   └── environment.ts      # Environment variable handling
├── App.vue                 # Root component
└── main.ts                 # Application entry point
```

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file based on `.env.example`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | `http://localhost:3000/api` | Backend API base URL |
| `VITE_REQUEST_TIMEOUT` | No | `30000` | API request timeout in milliseconds |

### Example Configuration

```env
# .env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_REQUEST_TIMEOUT=30000
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server (or enable mock mode)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Set VITE_API_BASE_URL to your backend API URL
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

## Development

### Running with Backend

1. Ensure your backend API is running
2. Set `VITE_API_BASE_URL` in your `.env` file to your backend URL
3. Run `npm run dev`

### Hot Module Replacement (HMR)

Vite provides instant HMR during development. Changes to Vue components, TypeScript files, and CSS are reflected immediately without full page reloads.

## Key Features Documentation

### Authentication

- **Login**: Users authenticate with email and password
- **Registration**: New users can register with NIN, name, email, and password
- **JWT Tokens**: Access tokens stored securely, automatically included in API requests
- **Token Refresh**: Automatic token refresh on expiration
- **Logout**: Clears authentication state and tokens

### User Management

- **List Users**: View all registered users
- **Create User**: Add new users with role assignment
- **Update User**: Edit user details
- **Delete User**: Remove users from the system
- **ECT Status**: Toggle Electoral Commission status for users

### Party Management

- **List Parties**: View all political parties
- **Create Party**: Register new political parties
- **Update Party**: Edit party information
- **Delete Party**: Remove parties
- **Member Management**: Associate users with parties

### Candidate Setup

- **Register Candidates**: Add candidates for elections
- **Party Association**: Link candidates to political parties
- **Constituency Assignment**: Assign candidates to constituencies

### Voting

- **Cast Vote**: Submit votes for candidates
- **Duplicate Prevention**: System prevents multiple votes from same user
- **Secure Submission**: Votes encrypted and validated server-side

### Results

- **View Results**: Real-time vote counts by constituency
- **Filter by Constituency**: View results for specific constituencies
- **Candidate Rankings**: See vote distribution across candidates

### Constituency Management

- **List Constituencies**: View all electoral constituencies
- **Create Constituency**: Add new constituencies
- **Update Constituency**: Edit constituency details
- **Delete Constituency**: Remove constituencies

## Code Organization Patterns

### Store Usage

```typescript
import { useAuthStore } from '@/stores/auth.store';
import { storeToRefs } from 'pinia';

// In component
const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const { login, logout } = authStore;
```

### Composable Usage

```typescript
import { useForm } from '@/composables/useForm';

const { formData, errors, validate, resetForm } = useForm({
  email: '',
  password: ''
});
```

### Error Handling

```typescript
import { handleApiError } from '@/utils/error-handler';

try {
  await authService.login(credentials);
} catch (error) {
  const errorMessage = handleApiError(error);
  // Display error to user
}
```

### Form Validation

```typescript
import { validateEmail, validateRequired } from '@/utils/validators';

const errors = {
  email: validateEmail(formData.email),
  password: validateRequired(formData.password, 'Password')
};
```

## Testing

The project includes comprehensive tests:

### Unit Tests

- **Service Tests**: Test API service methods with mocked HTTP client
- **Store Tests**: Test Pinia store actions and state management
- **Utility Tests**: Test validators, formatters, and helper functions

### Component Tests

- **View Tests**: Test feature views and user interactions
- **Form Tests**: Test form validation and submission

### Property-Based Tests

Using fast-check for property-based testing:

- **Validator Tests**: Test validation functions with generated inputs
- **Formatter Tests**: Test data formatting with edge cases
- **Store Tests**: Test state management with random action sequences

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Code Style

This project follows Vue 3 best practices:

- **Script Setup**: Use `<script setup>` syntax for components
- **Composition API**: Prefer Composition API over Options API
- **TypeScript**: Strict type checking enabled
- **Component Organization**: Props → Emits → State → Computed → Methods → Lifecycle
- **Naming Conventions**: 
  - Components: PascalCase
  - Composables: useXxx
  - Stores: xxxStore
  - Services: xxx.service.ts

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request with a clear description

### Commit Conventions

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)

## License

[Your License Here]

## Support

For issues and questions, please open an issue on the repository.
