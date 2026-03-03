# EMG Project Dashboard

Client-facing project dashboard for Ethyl Merc Group (EMG), a New Zealand facilities maintenance company. Each project team gets scoped access to their project's updates, photos, documents, actions, and Q&A.

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Auth & Database:** Firebase (Auth, Firestore, Storage)
- **Styling:** CSS custom properties with utility classes
- **Icons:** Lucide React
- **Routing:** React Router v7 (HashRouter)

## Features

- **Multi-project dashboard** with Firestore-backed project data
- **Project-scoped access** — users only see projects they're assigned to
- **Role-based permissions** (admin, project_manager, stakeholder)
- **Admin panel** — create/edit projects, manage users, invite team members
- **Per-project tabs** — Overview, Updates, Photos, Documents, Actions, Q&A
- **File uploads** — photos and documents via Firebase Storage
- **Access request system** — users can request access, admins approve/deny
- **In-app notifications** — bell icon with real-time notification feed
- **User self-service** — change password, update profile
- **Pending invite system** — invite users before they sign up
- **Error boundary** — graceful error recovery

## Setup

```bash
# Clone the repo
git clone https://github.com/Christo-Brits/EMG-Dashboard-Prototype.git
cd EMG-Dashboard-Prototype

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your Firebase config values in .env

# Start dev server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

See `.env.example` for reference.

## Seeding Firestore

To bootstrap a fresh Firebase project with initial data:

```bash
npm install firebase-admin
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
node scripts/seed-firestore.js
```

## Project Structure

```
src/
  components/
    common/         # ErrorBoundary, ProtectedRoute, ProjectGuard, NotificationBell
    layout/         # Shell (header, footer, navigation)
    project/        # Tab components (Overview, Updates, Photos, etc.)
  config/
    firebase.js     # Firebase initialization
  context/
    AuthContext.jsx  # Authentication, user state, password management
    ProjectContext.jsx # Project data, Firestore subscriptions, CRUD
  pages/
    admin/          # CreateProject, EditProject, UserManagement
    GlobalDashboard.jsx
    ProjectDashboard.jsx
    ProjectSelect.jsx
    UserSettings.jsx
    Login.jsx
  data/
    mockData.js     # Legacy mock data (no longer used at runtime)
```

## Firestore Data Model

```
/users/{uid}              — User profile, role, allowedProjects
  /notifications/{id}     — Per-user notification feed
/projects/{projectId}     — Project metadata, teamMembers
  /updates/{id}           — Progress updates
  /actions/{id}           — Action items
  /qa/{id}                — Q&A threads with replies
  /photos/{id}            — Photo metadata
  /data/documents         — Document folder structure
/pending_invites/{id}     — Pre-signup user invitations
/access_requests/{id}     — User access requests
```

## Deployment

Currently configured for GitHub Pages via `gh-pages`:

```bash
npm run build
npm run deploy
```

## Security

- Firebase config loaded from environment variables
- Firestore rules enforce project-level access via `allowedProjects`
- Route protection via `ProtectedRoute` and `ProjectGuard` components
- Admin routes restricted with `adminOnly` flag
- User role stored in Firestore, not hardcoded
