# AbleConnect

A job platform for jobseekers, employers, and admins, built with accessibility and responsiveness.

## Features

- Role-based dashboards (jobseeker, employer, admin)
- Accessible text-to-speech reader
- Responsive design for mobile and tablet
- Dark mode and high-contrast mode support
- Authentication with username or email

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Dependencies**: react-router-dom, react-hot-toast

## Setup

1. Clone the repo: `git clone https://github.com/Kimrensca/ableconnect.git`
2. Install frontend dependencies: `cd ableconnect && npm install`
3. Install backend dependencies: `cd backend && npm install`
4. Create `backend/.env` with your database URI and secrets
5. Start backend: `cd backend && npm start`
6. Start frontend: `cd .. && npm start`

## Scripts

- `npm start`: Run frontend (Vite)
- `npm test`: Run tests (if configured)
