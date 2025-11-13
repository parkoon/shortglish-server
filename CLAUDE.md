# Shortglish Server - NestJS Project Guide

## Project Overview

This is a NestJS-based backend server for the Shortglish application. The project is a fresh NestJS 10.0 setup with minimal scaffolding, configured for development and production deployment on Railway.

**Repository URL**: https://github.com/parkoon/shortglish-server
**Language**: TypeScript (ES2021 target)
**Package Manager**: Yarn 1.22.22 (PnP mode with SDKs)
**Node Requirement**: v20.3.1+
**License**: UNLICENSED (Private)

---

## Development Commands

### Quick Start
```bash
# Install dependencies
yarn install

# Development mode (with watch/hot reload)
yarn start:dev

# Debug mode (with debugger on port 9229)
yarn start:debug
```

### Building & Running
```bash
# Build for production (compiles to /dist)
yarn build

# Start production build
yarn start:prod

# Run development server (no watch)
yarn start
```

### Code Quality
```bash
# Format code with Prettier
yarn format

# Lint and fix code with ESLint
yarn lint
```

### Testing
```bash
# Run all unit tests (Jest)
yarn test

# Watch mode for tests
yarn test:watch

# Generate coverage report
yarn test:cov

# Run e2e tests
yarn test:e2e

# Debug tests
yarn test:debug
```

---

## Project Architecture

### Directory Structure
```
src/
├── main.ts                  # Application entry point
├── app.module.ts           # Root module definition
├── app.controller.ts       # Root controller with endpoints
├── app.controller.spec.ts  # Unit tests
└── app.service.ts          # Service layer (business logic)

test/
├── app.e2e-spec.ts        # End-to-end tests
└── jest-e2e.json          # e2e Jest configuration

dist/                       # Compiled output (generated)
coverage/                   # Test coverage report (generated)
```

### Application Bootstrap (`src/main.ts`)

- **Port**: Reads from `process.env.PORT` or defaults to 4000
- **CORS**: Enabled globally via `app.enableCors()`
- **Start Message**: Logs running port to console
- **Railway Compatibility**: Respects PORT environment variable for cloud deployment

### Module Organization (`src/app.module.ts`)

- **Root Module**: `AppModule` exports no external modules
- **Controllers**: `AppController`
- **Providers**: `AppService`
- **Pattern**: Simple monolithic structure, ready to expand with feature modules

### Controller & Service Pattern (`src/app.controller.ts`, `src/app.service.ts`)

Standard NestJS dependency injection:
- `AppController`: Defines HTTP routes
- `AppService`: Contains business logic
- Follows single responsibility principle

#### Endpoints

| Method | Route | Response | Purpose |
|--------|-------|----------|---------|
| GET | `/` | `"Hello World!"` | Root endpoint |
| GET | `/health` | `{ status: "ok", timestamp: ISO8601 }` | Health check |

---

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)

**Key Settings**:
- **Target**: ES2021
- **Module**: CommonJS
- **Output**: `./dist/` directory
- **Decorators**: Experimentally enabled (`experimentalDecorators: true`)
- **Metadata**: Emitted for NestJS dependency injection
- **Source Maps**: Enabled for debugging
- **Strict Mode**: Relaxed for flexibility
  - `strictNullChecks: false`
  - `noImplicitAny: false`
  - `strictBindCallApply: false`

**Build Config** (`tsconfig.build.json`):
- Excludes: `node_modules`, `test`, `dist`, `**/*spec.ts`

### NestJS CLI Configuration (`nest-cli.json`)

- **Collection**: `@nestjs/schematics` (standard generators)
- **Source Root**: `src` directory
- **Compiler Options**: Deletes old output directory on build (`deleteOutDir: true`)

### Code Quality

**ESLint** (`.eslintrc.js`):
- Parser: `@typescript-eslint/parser`
- Extends: TypeScript ESLint recommended + Prettier integration
- Relaxed rules for flexibility (no explicit return types required)
- Ignores: `.eslintrc.js` itself

**Prettier** (`.prettierrc`):
- Single quotes
- Trailing commas on all items
- Print width: 100 characters
- Tab width: 2 spaces
- Semicolons required

### IDE Setup (`.vscode/`)

**Settings** (`settings.json`):
- Excludes `.yarn` and `.pnp.*` from search
- Uses Yarn SDKs for TypeScript, ESLint, Prettier
- Enables workspace TypeScript prompt

**Extensions** (`extensions.json`):
- `arcanis.vscode-zipfs` - Yarn PnP support
- `dbaeumer.vscode-eslint` - ESLint integration
- `esbenp.prettier-vscode` - Prettier formatting

---

## Testing Setup

### Jest Configuration

**Unit Tests** (configured in `package.json`):
- Root directory: `src`
- Test regex: `.*\.spec\.ts$`
- Coverage directory: `../coverage`
- Transform: `ts-jest`
- Test environment: Node.js

**E2E Tests** (`test/jest-e2e.json`):
- Test regex: `.e2e-spec.ts$`
- Uses same transformer
- Located in `test/` directory

### Test Examples

**Unit Test** (`src/app.controller.spec.ts`):
- Uses `@nestjs/testing` Test module
- Tests controller methods in isolation
- Mocks service dependencies

**E2E Test** (`test/app.e2e-spec.ts`):
- Creates full application context
- Tests HTTP endpoints with `supertest`
- Validates complete request/response cycle

---

## Deployment

### Railway Configuration (`railway.json`)

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "yarn build"
  },
  "deploy": {
    "startCommand": "node dist/main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Build Process**:
1. Runs `yarn build` to compile TypeScript → JavaScript
2. Outputs to `/dist` directory
3. Uses NIXPACKS builder (automatic environment setup)

**Runtime**:
- Executes `node dist/main` to start application
- Port auto-injected by Railway as environment variable
- Automatic restart on failure (up to 10 retries)

### Environment Variables

**`.env.example`**:
```
# Server
PORT=3000
NODE_ENV=development

# For Railway (commented out):
# PORT=8081
# NODE_ENV=production

# Database (placeholder):
# DATABASE_URL=postgresql://user:password@host:port/database

# API Keys (placeholder):
# API_KEY=your-api-key-here
```

**Important Notes**:
- Create `.env` file from `.env.example` for local development
- Railway auto-injects `PORT` variable
- Set `NODE_ENV=production` on Railway for optimizations
- `.env` files are gitignored (never commit secrets)

---

## Yarn Package Manager (PnP Mode)

This project uses **Yarn 1.22.22** in Plug'n'Play (PnP) mode instead of `node_modules`:

### Benefits
- Faster installs
- Smaller disk footprint
- Better dependency isolation
- No phantom dependencies

### Important Files (Generated & Staged)
- `.pnp.cjs` - PnP runtime (JavaScript implementation)
- `.pnp.loader.mjs` - ESM loader for Node
- `.yarn/sdks/` - IDE integrations (TypeScript, ESLint, Prettier)
- `.yarn/unplugged/` - Packages requiring disk access
- `.yarn/install-state.gz` - State tracking for installs

### Workflow
```bash
# Add dependencies
yarn add <package>
yarn add --dev <dev-package>

# Upgrade all
yarn upgrade-interactive

# No need to commit node_modules or package-lock.json
```

---

## Development Workflow

### Adding Features

1. **Create Controller** (example: users)
   ```bash
   nest g controller users
   ```

2. **Create Service**
   ```bash
   nest g service users
   ```

3. **Create Module**
   ```bash
   nest g module users
   ```

4. **Add to Root Module** (`app.module.ts`)
   ```typescript
   imports: [UsersModule]
   ```

### Code Style Standards

**Format Before Commit**:
```bash
yarn format
yarn lint
```

**Conventions**:
- Files follow NestJS patterns: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.spec.ts`
- Classes use PascalCase, methods/properties use camelCase
- Use `@Injectable()` decorator for providers
- Use standard NestJS decorators: `@Controller()`, `@Get()`, `@Post()`, etc.

### Running Tests Locally

```bash
# Watch mode during development
yarn test:watch

# Coverage before PR
yarn test:cov

# E2E tests (full app)
yarn test:e2e
```

---

## Non-Obvious Architectural Decisions

### 1. **Relaxed TypeScript Strictness**
   - Intentional to balance flexibility with type safety
   - Allows quicker prototyping
   - Can be tightened later as codebase matures

### 2. **Minimal Initial Structure**
   - No database ORM (TypeORM, Prisma) configured yet
   - No authentication/authorization middleware
   - No global exception filters
   - Design: Add layers incrementally as requirements grow

### 3. **CORS Enabled by Default**
   - Open CORS in main.ts with `app.enableCors()`
   - Will need restriction for production (specify allowed origins)
   - Temporary for development/prototyping phase

### 4. **Port Flexibility**
   - Default port 4000 locally
   - Railway overrides with PORT environment variable
   - Respects Railway's dynamic port assignment

### 5. **No Separate Build Config**
   - Uses standard NestJS builder
   - No custom webpack configuration needed
   - TypeScript compilation via ts-loader/ts-jest

---

## Important Commands Reference

| Command | Purpose |
|---------|---------|
| `yarn install` | Install all dependencies (regenerates PnP files) |
| `yarn start:dev` | Development with hot reload |
| `yarn build && yarn start:prod` | Full production cycle |
| `yarn format && yarn lint` | Pre-commit code quality |
| `yarn test` | Quick test run |
| `yarn test:watch` | TDD workflow |
| `nest g <schematic>` | Generate boilerplate (use NestJS CLI) |

---

## Debugging Tips

### VS Code Launch Configuration
The project has VSCode configured with:
- TypeScript workspace SDK enabled
- ESLint integration through Yarn SDK
- Prettier auto-format on save

### Common Issues

**Issue**: TypeScript intellisense not working
- **Solution**: Reload VS Code window, ensure workspace TypeScript is enabled
- Settings show: `typescript.enablePromptUseWorkspaceTsdk: true`

**Issue**: ESLint/Prettier not formatting
- **Solution**: Check VS Code has Yarn SDK configured in settings.json
- Restart ESLint extension if needed

**Issue**: Tests fail with module not found
- **Solution**: Run `yarn install` to regenerate PnP files
- Clear Jest cache: `yarn test --clearCache`

---

## Next Steps for Growth

This is a minimal starter. Common next additions:

1. **Database Integration**: Add TypeORM/Prisma and configure
2. **Authentication**: Implement JWT guards and auth module
3. **Validation**: Add class-validator and class-transformer
4. **Logging**: Replace console.log with proper logging (Winston/Pino)
5. **Environment**: More robust config management (@nestjs/config)
6. **Monitoring**: Add health checks module for production readiness
7. **Documentation**: Add Swagger/OpenAPI documentation
8. **Error Handling**: Global exception filters for standardized responses

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/main.ts` | App bootstrap, port, CORS config |
| `src/app.module.ts` | Root DI container, module imports |
| `src/app.controller.ts` | HTTP routes definition |
| `src/app.service.ts` | Business logic |
| `package.json` | Dependencies, scripts, Jest config |
| `tsconfig.json` | TypeScript compiler options |
| `nest-cli.json` | NestJS code generation config |
| `.eslintrc.js` | Linting rules |
| `.prettierrc` | Code formatting rules |
| `railway.json` | Railway deployment config |
| `.env.example` | Environment variable template |

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Yarn Plug'n'Play Guide](https://yarnpkg.com/features/pnp)
- [Railway Deployment Docs](https://docs.railway.app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io)

---

**Last Updated**: 2025-11-13
**NestJS Version**: 10.0.0
**Node Target**: v20.3.1+
