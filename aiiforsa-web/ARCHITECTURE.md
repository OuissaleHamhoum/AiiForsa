# Architecture Overview

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Client)                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App (React 19)                                  │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Pages/UI    │  │    Stores    │  │   React Query   │  │
│  │  Components   │◄─┤   (Zustand)  │  │   (Caching)     │  │
│  └───────┬───────┘  └──────▲───────┘  └────────▲────────┘  │
│          │                  │                    │           │
│          └──────────────────┴────────────────────┘           │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │   Auth Hooks    │                       │
│                    │   (useAuth)     │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│          ┌──────────────────┼──────────────────┐             │
│          │                  │                  │             │
│    ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐     │
│    │ NextAuth  │    │ API Client  │    │  Middleware │     │
│    │  (Auth)   │    │  (Axios)    │    │  (Guards)   │     │
│    └─────┬─────┘    └──────┬──────┘    └─────────────┘     │
└──────────┼──────────────────┼────────────────────────────────┘
           │                  │
           │    HTTPS/JWT     │
           └──────────┬────────┘
                      │
┌─────────────────────▼──────────────────────────────────────┐
│                  Backend API (NestJS)                       │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │   Auth     │  │    User     │  │     Database      │   │
│  │  Service   │◄─┤   Service   │◄─┤   (PostgreSQL)    │   │
│  └────────────┘  └─────────────┘  └───────────────────┘   │
│         │                                                   │
│    ┌────▼────┐                                             │
│    │  Redis  │  (Refresh Tokens, Sessions)                │
│    └─────────┘                                             │
└───────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Authentication Flow

```
User Login Request
       │
       ▼
┌──────────────┐
│  LoginForm   │ (React Hook Form + Zod validation)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ useLogin()   │ (React Query mutation)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  NextAuth    │ (Credentials provider)
│  signIn()    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Backend API  │ POST /auth/login
│ Auth Service │ (Validates credentials)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Response   │ { user, accessToken, refreshToken }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth Store   │ (Zustand - saves to sessionStorage)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Dashboard   │ (Redirect to protected page)
└──────────────┘
```

### API Request Flow with Token Refresh

```
Protected Resource Request
       │
       ▼
┌──────────────────┐
│  API Client      │ (Axios interceptor adds token)
│  + Bearer Token  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Backend API     │
│  JWT Guard       │
└──────┬───────────┘
       │
       ├─────► [Token Valid] ────► Response with Data
       │
       └─────► [Token Expired (401)]
                     │
                     ▼
              ┌──────────────┐
              │ Auto Refresh │ POST /auth/refresh
              │   Token      │ (with refreshToken)
              └──────┬───────┘
                     │
                     ├─► [Success] ─► Retry Original Request
                     │
                     └─► [Failed] ──► Redirect to Login
```

## 🧩 Component Architecture

### Component Hierarchy

```
RootLayout
├── Providers (NextAuth + React Query)
│   ├── SessionProvider
│   └── QueryClientProvider
├── Notifications (Toast messages)
└── Page Components
    ├── Home (/)
    ├── Auth Pages
    │   ├── Login (/login)
    │   │   └── LoginForm
    │   ├── Register (/register)
    │   │   └── RegisterForm
    │   ├── ForgotPassword (/forgot-password)
    │   │   └── ForgotPasswordForm
    │   └── ResetPassword (/reset-password)
    │       └── ResetPasswordForm
    └── Protected Pages
        └── Dashboard (/)
```

## 🔄 State Management

### State Architecture

```
┌─────────────────────────────────────────┐
│           Application State             │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌───────────────┐ │
│  │  Auth Store    │  │   UI Store    │ │
│  │  (Zustand)     │  │   (Zustand)   │ │
│  ├────────────────┤  ├───────────────┤ │
│  │ • user         │  │ • sidebar     │ │
│  │ • accessToken  │  │ • theme       │ │
│  │ • refreshToken │  │ • notifications│ │
│  │ • isAuth       │  └───────────────┘ │
│  └────────────────┘                    │
│           ▲                             │
│           │                             │
│  ┌────────┴────────┐                   │
│  │ Session Storage │ (Persisted)       │
│  └─────────────────┘                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Server State (Cache)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     React Query Cache           │   │
│  ├─────────────────────────────────┤   │
│  │ • User data                     │   │
│  │ • API responses                 │   │
│  │ • Automatic refetch             │   │
│  │ • Background updates            │   │
│  │ • Optimistic updates            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🔐 Security Architecture

### Security Layers

```
┌─────────────────────────────────────────┐
│         Security Layer 1: Input         │
│  • Zod Schema Validation                │
│  • Input Sanitization                   │
│  • XSS Prevention                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Security Layer 2: Transport       │
│  • HTTPS/TLS Encryption                 │
│  • CSRF Tokens                          │
│  • HTTP-only Cookies                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Security Layer 3: Authentication   │
│  • JWT Tokens (short-lived)             │
│  • Refresh Tokens (Redis)               │
│  • Password Hashing (bcrypt)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Security Layer 4: Authorization    │
│  • Route Guards (Middleware)            │
│  • Role-based Access                    │
│  • Session Validation                   │
└─────────────────────────────────────────┘
```

## 🔌 API Integration Pattern

### Request/Response Flow

```typescript
// 1. Define Types
interface UserData {
  id: string;
  name: string;
  email: string;
}

// 2. Create API Function
async function fetchUser(): Promise<UserData> {
  const response = await apiClient.get('/user');
  return response.data;
}

// 3. Create React Query Hook
function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 4. Use in Component
function UserProfile() {
  const { data, isLoading, error } = useUser();

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <div>{data.name}</div>;
}
```

## 📦 Module Dependencies

```
next (15.5.4)
├── react (19.1.0)
├── react-dom (19.1.0)
└── next-auth (@beta)
    └── Authentication

@tanstack/react-query
└── Server State Management

zustand
└── Client State Management

zod
└── Schema Validation

react-hook-form
├── Form Management
└── @hookform/resolvers
    └── Zod Integration

axios
└── HTTP Client

shadcn/ui
├── @radix-ui/* (UI primitives)
└── tailwindcss (styling)
```

## 🎯 Design Patterns Used

### 1. Container/Presentational Pattern

- **Container**: Hooks that manage logic (`useAuth`, `useLogin`)
- **Presentational**: Pure UI components (`LoginForm`, `Button`)

### 2. Custom Hooks Pattern

- Encapsulate complex logic in reusable hooks
- Example: `useAuth`, `useLogin`, `useLogout`

### 3. Provider Pattern

- Global context via providers
- `SessionProvider`, `QueryClientProvider`

### 4. Store Pattern (Zustand)

- Centralized state management
- Separated concerns: `auth.store`, `ui.store`

### 5. Repository Pattern

- API layer abstraction
- `auth-api.ts` separates API calls from components

### 6. Middleware Pattern

- Route protection via Next.js middleware
- Token refresh via Axios interceptors

## 🔄 Development Workflow

```
1. User Story
   │
   ▼
2. Define Types (types/*.ts)
   │
   ▼
3. Create Schema (schemas/*.ts)
   │
   ▼
4. Create API Function (lib/*-api.ts)
   │
   ▼
5. Create Hook (hooks/*.ts)
   │
   ▼
6. Build Component (components/*.tsx)
   │
   ▼
7. Create Page (app/*/page.tsx)
   │
   ▼
8. Test & Validate
   │
   ▼
9. Deploy
```

## 📈 Performance Optimizations

### Implemented Optimizations

1. **React Query Caching**
    - Automatic data caching
    - Background refetching
    - Stale-while-revalidate

2. **Code Splitting**
    - Next.js automatic code splitting
    - Dynamic imports for heavy components

3. **Token Management**
    - SessionStorage (faster than localStorage)
    - Automatic token refresh
    - Minimal re-renders

4. **Form Optimization**
    - Controlled components with React Hook Form
    - Zod schema validation (client-side)
    - Debounced validation

## 🧪 Testing Strategy

```
Unit Tests
├── Schemas (Zod validation)
├── Utilities (security, auth-utils)
└── Hooks (useAuth, useLogin)

Integration Tests
├── API Client (interceptors)
├── Store (Zustand actions)
└── Forms (React Hook Form)

E2E Tests
├── Authentication Flow
├── Protected Routes
└── Token Refresh
```

## 🚀 Deployment Architecture

```
Production Environment

┌─────────────────────────────────┐
│   CDN (Vercel Edge Network)     │
│   • Static Assets                │
│   • Image Optimization           │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   Next.js App (Serverless)      │
│   • Server Components            │
│   • API Routes                   │
│   • Middleware                   │
└────────────┬────────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼────┐  ┌────▼─────┐
│ Backend  │  │  Redis   │
│   API    │  │  Cache   │
└──────────┘  └──────────┘
```

## 📚 Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [React Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zod Documentation](https://zod.dev/)
