# sc monorepo

This repository keeps the existing folder layout:

- `backend/` – .NET API (queries/ApiForReact)
- `soundcloud/` – React frontend (Create React App)

## Backend
- Restore and run from `backend/queries/ApiForReact` (e.g. `dotnet run`).
- RLS policies live in `backend/queries/ApiForReact/rls-policy.sql`.
- Supabase secrets stay out of git (`backend/**/services/tokens.json` is ignored by default).

## Frontend
- Inside `soundcloud/`: `npm install` then `npm start`.
- Auth is proxied through the backend; set Supabase keys in the backend service and restart it.

## Notes
- Git root is now the `sc` folder so both `backend/` and `soundcloud/` are tracked together.
- Keep any sensitive environment data in ignored files (`tokens.json`, `.env*`).
