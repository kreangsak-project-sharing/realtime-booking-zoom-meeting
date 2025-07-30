# Real-time booking time slot with generate zoom meeting project

## Getting Started

First, run the development server:

Add data in .env file
```bash
DATABASE_URL="postgresql://prisma.xxxxxxxxxx:xxxxxxxx@xxxxxxxxxx.pooler.supabase.com:5432/postgres"

NODE_ENV=production
PORT=3000
JWT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
CORS_ORIGIN=http://localhost:3000,https://xxxxxxxxxx.com

# ZOOM API credentials
ZOOM_ACCOUNT_ID="xxxxxxxxxxxxxxxxxxxxx"
ZOOM_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxx" 
ZOOM_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxx"

# Turnstile API credentials
NEXT_PUBLIC_TURNSTILE_SITE_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TURNSTILE_SECRET_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run dev
```

## ZoomMeeting Scopes
```bash
meeting:read:meeting:admin
meeting:write:meeting:admin
meeting:delete:meeting:admin
user:read:user:admin
```
