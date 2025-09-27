# Centro-sis - Educational Management System

A cross-platform educational management application built with Expo React Native and React Native Web.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Multi-role Support**: Alumno, Profesor, and Administrador views
- **Cross-platform**: Works on web, iOS, and Android
- **Responsive Design**: Drawer navigation for web, tabs for mobile
- **CRUD Operations**: Complete management for users, courses, and payments
- **Mock Mode**: Demo functionality when backend is unavailable

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
BASE_URL=http://localhost:8080/api
MOCK_MODE=true
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── complete-profile.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── admin.tsx
│   │   ├── payments.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── navigation/
├── hooks/
├── services/
├── stores/
├── types/
└── utils/
```

## Environment Variables

- `BASE_URL`: Backend API base URL
- `MOCK_MODE`: Enable mock mode for demo (true/false)

## Mock Credentials

When in mock mode, use these credentials:
- **Alumno**: email: `alumno@test.com`, password: `123456`
- **Profesor**: email: `profesor@test.com`, password: `123456`
- **Administrador**: email: `admin@test.com`, password: `123456`

## API Endpoints

The app expects the following endpoints from the Spring Boot backend:

- `POST /auth/login` - Authentication
- `GET /users` - List users with filters
- `POST /users` - Create user
- `GET /courses` - List courses
- `POST /payments` - Process payments
- And more... (see API documentation)

## Development

Run tests:
```bash
npm test
```

Build for web:
```bash
npm run build:web
```

## License

MIT