# MusicStream Backend

MusicStream Backend is an Express.js API for the RAGAS music streaming application. It provides user authentication, song management, playlists, favorites, feedback, and admin analytics backed by PostgreSQL and Sequelize.

## Features

- JWT-based authentication with refresh tokens
- User registration, login, profile management, avatar upload, and account deletion
- Song catalog CRUD for admin users
- Search songs and retrieve song details
- Playlist management with add/remove song support
- Favorite songs management
- Feedback/comments for songs
- Admin-only dashboard routes for users, songs, feedback, and analytics
- File uploads for audio files, avatars, and images
- Automatic admin account and sample song seeding on startup

## Project Structure

- `server.js` - application entrypoint, database sync, and data seeding
- `src/app.js` - Express app setup, middleware, and route registration
- `src/config/` - configuration and database connection
- `src/routes/` - API route definitions
- `src/controllers/` - controller logic for each resource
- `src/models/` - Sequelize models and associations
- `src/middlewares/` - authentication, authorization, file upload, and error handling middleware
- `src/utils/` - JWT, bcrypt, and response helper utilities
- `uploads/` - stored audio, avatar, and image files

## Environment Variables

Create a `.env` file in `musicstream-backend/` with the following values:

```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/musicstream
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Installation

```bash
cd musicstream-backend
npm install
```

## Running the Server

Start in development mode with nodemon:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The API will be available at `http://localhost:5000/api` by default.

## API Endpoints

### Auth

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive tokens
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users/me` - Get authenticated user profile
- `PUT /api/users/me` - Update user profile
- `PUT /api/users/me/avatar` - Upload/update avatar
- `DELETE /api/users/me` - Delete user account

### Songs

- `GET /api/songs` - Get all songs
- `GET /api/songs/search` - Search songs
- `GET /api/songs/:id` - Get song details
- `POST /api/songs` - Create a song (admin only)
- `PUT /api/songs/:id` - Update a song (admin only)
- `DELETE /api/songs/:id` - Delete a song (admin only)

### Playlists

- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create a playlist
- `GET /api/playlists/:id` - Get playlist details
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist

### Favorites

- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:songId` - Add favorite song
- `DELETE /api/favorites/:songId` - Remove favorite song

### Feedback

- `GET /api/feedback/song/:songId` - Get feedback for a song
- `POST /api/feedback/song/:songId` - Create feedback for a song
- `DELETE /api/feedback/:id` - Delete feedback

### Admin

Admin routes require authenticated admin access.

- `GET /api/admin/dashboard` - Admin dashboard summary
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user by ID
- `PATCH /api/admin/users/:id/toggle-active` - Toggle user active status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/songs` - List all songs for admin
- `GET /api/admin/stats/users-growth` - User growth metrics
- `GET /api/admin/stats/top-songs` - Top songs metrics
- `GET /api/admin/stats/genres` - Genre analytics
- `GET /api/admin/feedback` - List all feedback

## Notes

- Static uploads are served from `/uploads`
- Admin account and sample song data are seeded automatically on startup if missing
- This backend uses Sequelize for PostgreSQL ORM and migrations are handled via `sequelize.sync()` on startup

## License

This project is licensed under ISC.
