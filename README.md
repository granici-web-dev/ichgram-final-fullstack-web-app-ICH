# ICHgram

A full-stack mini-Instagram built as a final project. Users can register, post photos,
like and comment, follow each other, search, get notifications and chat in real time.

## Features

- **Auth** — register / login / reset password (JWT + bcrypt)
- **Feed** — all posts, like (optimistic), follow author right from the feed
- **Posts** — create (image as Base64), edit caption, delete; post modal with comments
- **Comments** — add, like comments, emoji picker
- **Profile** — avatar, bio, website, stats, posts grid; edit your own profile
- **Explore** — grid of random posts
- **Search** — live user search (debounced) with recent searches
- **Notifications** — likes, comments and follows
- **Messages** — real-time 1:1 chat over Socket.IO
- **404 page** and **logout**

## Tech stack

- **Client:** React 19, Vite, Redux Toolkit, React Router, Axios, socket.io-client, emoji-picker-react
- **Server:** Node.js, Express (ESM), MongoDB + Mongoose, JWT, bcrypt, multer, Socket.IO
- **Images:** stored as Base64 strings in MongoDB (per the assignment)

## Project structure

```
client/   — Vite + React frontend (pages, components, redux slices)
server/   — Express API + Socket.IO (db, models, controllers, routes, middlewares)
```

## Getting started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongodb://127.0.0.1:27017` by default)

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # fill in the values
npm run dev            # starts on http://127.0.0.1:5001
```

`.env`:

```
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ichgram
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env   # API + socket URLs
npm run dev            # starts on http://localhost:5173
```

`.env`:

```
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Open http://localhost:5173, register an account and start using the app.

## API overview

All routes are under `/api` and protected by JWT (except register/login):
`auth`, `users`, `posts`, `likes`, `comments`, `follow`, `notifications`, `messages`.
Real-time chat runs over Socket.IO (JWT in the connection handshake).
