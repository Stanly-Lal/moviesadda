# MoviesAdda Movies Gallery

Production-oriented MERN application for publishing Movies.

## Features

- Responsive home page and mobile-first layout
- Custom MoviesAdda text/SVG logo
- Dark/light theme persisted locally
- Search with debouncing
- Pagination (previous/next, page numbers, ellipsis)
- Video cards with poster, title and automatic upload date
- Admin login and protected dashboard
- Add, edit and delete videos
- MongoDB persistence
- Automatic `createdAt` upload date
- External video links open on click
- Server-side validation and sanitization
- Helmet, CORS allowlist, rate limiting, secure error handling
- JWT stored in HttpOnly cookie
- Password hashing with bcrypt

## Run locally

### Server

```bash
cd server
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

### Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Deployment

Set `CLIENT_URL` on the server to your deployed frontend URL and `VITE_API_URL` on the client to your deployed API URL.
Set `NODE_ENV=production`, use HTTPS, and configure `COOKIE_SECURE=true`.
