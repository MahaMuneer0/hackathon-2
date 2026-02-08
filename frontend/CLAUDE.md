# Frontend Development Guide

Use @frontend-agent.skill for all frontend work.

## Structure
frontend/
├── app/
│   ├── page.tsx           # Landing page
│   ├── signup/page.tsx    # Signup page
│   ├── login/page.tsx     # Login page
│   └── dashboard/page.tsx # Main app
├── components/
│   ├── TaskCard.tsx       # Task component
│   └── TaskForm.tsx       # Create task form
├── lib/
│   ├── api.ts             # API client
│   └── auth.ts            # Auth utilities
└── .env.local
## Before Starting
- Check @specs/api/rest-endpoints.md
- Check @specs/ui/components.md
- Backend must be running at http://localhost:8000

## Development Order
1. Setup Next.js + Better Auth
2. Create auth pages (signup, login)
3. Create dashboard with task management
4. Style with Tailwind CSS