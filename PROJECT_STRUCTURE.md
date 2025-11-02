# Project Structure

This project follows a clean code structure similar to modern React applications.

## Folder Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   ├── FileUpload.jsx
│   ├── ImageGallery.jsx
│   └── SessionSelector.jsx
├── constants/       # Application constants
│   └── endpoints.js # API endpoint definitions
├── hooks/           # Custom React hooks
│   └── useSubmission.js
├── layout/          # Layout components
│   ├── MainLayout.jsx
│   └── index.js
├── lib/             # Library configurations
│   └── config.js    # Application configuration
├── pages/           # Page components
│   └── HomePage/
│       ├── HomePage.jsx
│       └── index.js
├── routes/          # Routing configuration
│   └── AppRoutes.jsx
├── services/        # API services
│   └── api.js
├── utils/           # Utility functions
│   └── index.js
├── App.jsx          # Main App component
├── App.css          # Global styles
├── main.jsx         # Application entry point
└── index.css        # Base styles
```

## Path Aliases

The project uses path aliases for cleaner imports:

- `@` → `src/`
- `@components` → `src/components`
- `@pages` → `src/pages`
- `@layout` → `src/layout`
- `@services` → `src/services`
- `@hooks` → `src/hooks`
- `@utils` → `src/utils`
- `@lib` → `src/lib`
- `@assets` → `src/assets`
- `@routes` → `src/routes`
- `@constants` → `src/constants`

## Example Usage

```jsx
// Before
import SessionSelector from '../components/SessionSelector';
import { apiService } from '../services/api';

// After (using path aliases)
import SessionSelector from '@components/SessionSelector';
import { apiService } from '@services/api';
```

## Key Features

1. **Clean Code Structure**: Organized by feature/type
2. **Path Aliases**: Cleaner imports with `@` prefix
3. **Custom Hooks**: Reusable state management logic
4. **Layout System**: Reusable layout components
5. **Routing**: React Router for navigation
6. **Service Layer**: Centralized API calls
7. **Configuration**: Environment-based configs

