# Type Definitions

This directory contains shared type definitions for the application, organized to prevent circular dependencies between frontend and backend code.

## Structure

- `backend.ts`: Types used exclusively by backend code (API routes, server-side functions)
- `frontend.ts`: Types used exclusively by frontend code (React components, client-side functions)
- `openai.ts`: Shared types for OpenAI integration used by both frontend and backend

## Guidelines

1. **Import Direction**: 
   - Frontend code should only import from `frontend.ts` and shared types
   - Backend code should only import from `backend.ts` and shared types
   - Never import frontend types in backend code or vice versa

2. **Type Duplication**:
   - Some types are intentionally duplicated between frontend and backend
   - This prevents circular dependencies while maintaining type safety
   - Keep duplicated types in sync when making changes

3. **Type Organization**:
   - Place new types in the appropriate file based on where they're used
   - If a type is used by both frontend and backend, consider adding it to a shared file