# SocialPost — Full Stack Social Feed App

A production-quality mini social media application built for the 3W Solutions Full Stack Internship assignment.

## Features

- User registration and login with JWT authentication
- Persistent sessions via localStorage
- Create posts with text, image, or both
- Public feed sorted newest first with pagination
- Like / unlike posts (toggle)
- Comment on posts
- Real-time UI updates — no page reloads
- Usernames shown on likes and comments
- Image uploads via Cloudinary
- Fully responsive (desktop, tablet, mobile)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas (2 collections: users, posts) |
| Auth | JWT + bcryptjs |
| Images | Cloudinary |
| Deployment | Vercel (frontend) + Render (backend) |

## Project Structure

```
3w-social-post-app/
├── backend/
│   ├── config/          # db.js, cloudinary.js
│   ├── controllers/     # authController.js, postController.js
│   ├── middleware/      # authMiddleware.js, errorMiddleware.js
│   ├── models/          # User.js, Post.js
│   ├── routes/          # authRoutes.js, postRoutes.js
│   ├── utils/           # generateToken.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Navbar, PostCard, CreatePost, CommentSection, etc.
        ├── context/     # AuthContext.jsx
        ├── pages/       # Feed.jsx, Login.jsx, Signup.jsx
        ├── services/    # api.js
        ├── styles/      # global.css, auth.css, feed.css, components.css
        └── utils/       # time.js
```

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Backend

```bash
cd backend
npm install
# Fill in backend/.env
npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# Fill in frontend/.env
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Get current user |

### Posts

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/posts?page=1&limit=10` | Public | Get paginated feed |
| POST | `/api/posts` | Protected | Create post (multipart/form-data) |
| POST | `/api/posts/:id/like` | Protected | Toggle like |
| POST | `/api/posts/:id/comments` | Protected | Add comment |

All responses follow the format:
```json
{ "success": true, "message": "...", "data": { ... } }
```

## Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend → Render

1. Create a new Web Service on [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all backend env variables in the Render dashboard
6. Add `FRONTEND_URL=https://your-frontend.vercel.app` for CORS

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist `0.0.0.0/0` (all IPs) for Render compatibility
4. Copy the connection string into `MONGO_URI`

### Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, and API Secret from the dashboard

## Screenshots

_Add screenshots here after deployment_

## Future Improvements

- Edit and delete posts
- User profile pages
- Follow/unfollow system
- Notifications
- Dark mode
- Infinite scroll
- Post search
# 3w-social-post-app
