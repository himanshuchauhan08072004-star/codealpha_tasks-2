# ConnectHub — Real-Time Communication & Collaboration App

CodeAlpha Full Stack Development Internship — **Task 2**.
A working multi-user video meeting app: real WebRTC calls, screen share, live chat,
collaborative whiteboard, and file sharing, built on the MERN stack + Socket.IO.

## Live Demo

- **App:** https://codealpha-tasks-2-three.vercel.app
- **API:** https://codealpha-tasks-2-hfoj.onrender.com

Backend is on Render's free tier — it sleeps after inactivity, so the first request
after idle can take 30-60s to wake up.

## Screenshots

![Landing page](docs/screenshots/landing.png)
![Dashboard](docs/screenshots/dashboard.png)
![Meeting room](docs/screenshots/meeting-room.png)
![Whiteboard](docs/screenshots/whiteboard.png)

## Features

- User authentication (JWT, bcrypt password hashing)
- Create/join meetings by ID, meeting lobby with camera preview
- Real multi-user video calling — actual WebRTC peer connections, not mocked video
- Mute/unmute mic, camera on/off, join muted/camera-off
- Screen sharing via `getDisplayMedia`
- Real-time chat (Socket.IO, persisted to MongoDB)
- Collaborative whiteboard (Canvas + pointer events, synced drawing ops, late-joiner sync)
- File sharing with upload/download, size + MIME type validation
- Participant panel with host indicator, mic/cam state
- Host can end meeting; disconnect/leave cleans up peers and Socket.IO rooms

## Tech Stack

**Frontend:** React 18, Vite, TypeScript, React Router, Tailwind CSS, Axios, Socket.IO-client, native WebRTC APIs, Canvas API.

**Backend:** Node.js, Express, TypeScript, Socket.IO, JWT, bcryptjs, Mongoose, Helmet, CORS, express-rate-limit, Multer.

**Database:** MongoDB (Atlas or local).

## Architecture
