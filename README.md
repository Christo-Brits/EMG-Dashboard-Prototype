# EMG Project Portal

Client-facing project dashboard for **Ethyl Merc Group (EMG)**, a New Zealand facilities maintenance company. Each project team gets scoped access to their project's updates, photos, documents, actions, Q&A, and financials.

This is the first module of a broader Integrated Management System (IMS).

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Styling:** CSS custom properties + utility classes
- **Icons:** Lucide React
- **Routing:** React Router v7

## Features

- **Multi-project dashboard** with role-based access control
- **Per-project roles:** Admin, Project Manager, Stakeholder, Viewer
- **Project tabs:** Overview, Progress Updates, Site Photos, Documents, Financials, Actions, Q&A
- **Milestone timeline** with visual progress tracking
- **Financials tab:** Contract summary, variations register with approval workflow, invoice tracker
- **Bulk photo upload** with drag-and-drop, HEIC/HEIF conversion
- **In-app notifications** with bell icon and real-time updates
- **User management:** Invite users, assign projects, manage roles
- **Access request system** for self-service project access
- **Export/reporting:** CSV export for actions and variations, printable project summary reports
- **Audit logging** for all write operations
- **Route protection** with auth guards and project-level access enforcement
- **Firestore security rules** enforcing per-user project access

## Setup

### Prerequisites

- Node.js 18+
- A Firebase project with Auth, Firestore, and Storage enabled

### Installation

```bash
git clone https://github.com/Christo-Brits/EMG-Dashboard-Prototype.git
cd EMG-Dashboard-Prototype
npm install
```

### Environment Variables

Copy the example env file and fill in your Firebase config:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Seed Data (Optional)

Bootstrap Firestore with sample project data:

```bash
# Set up service account credentials first
export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json

# Seed projects only
node scripts/seed-firestore.js

# Seed projects + sample updates, actions, Q&A
node scripts/seed-firestore.js --with-sample-data

# Promote a user to admin
node scripts/promote-admin.js christo@emgroup.co.nz
```

## Architecture

```
src/
  config/firebase.js          # Firebase initialization
  context/
    AuthContext.jsx            # Auth state, user roles, project role resolution
    ProjectContext.jsx         # Firestore subscriptions, CRUD, audit logging
    NotificationContext.jsx    # In-app notification system
  hooks/
    useProjectPermissions.js   # Per-project role-based permission flags
  utils/
    permissions.js             # Role hierarchy and permission definitions
    exportHelpers.js           # CSV/report export utilities
  components/
    common/                    # ProtectedRoute, ProjectGuard, ErrorBoundary, NotificationBell
    layout/Shell.jsx           # App shell with header navigation
    project/                   # Tab components (Overview, Updates, Photos, etc.)
  pages/
    Login.jsx                  # Authentication
    ProjectSelect.jsx          # Project selection (filtered by access)
    GlobalDashboard.jsx        # Admin overview
    ProjectDashboard.jsx       # Project detail with tab navigation
    UserSettings.jsx           # Profile and password management
    admin/                     # User management, project creation
  data/mockData.js             # Reference data (not used at runtime)
```

### Firestore Structure

```
/users/{uid}                   # User profiles, roles, project assignments
  /notifications/{id}          # In-app notifications
/projects/{projectId}          # Project metadata, milestones, team members
  /updates/{id}                # Progress updates
  /actions/{id}                # Action items
  /qa/{id}                     # Q&A threads with replies
  /photos/{id}                 # Photo metadata (files in Storage)
  /data/documents              # Document folder structure
  /financials/summary          # Contract summary
  /variations/{id}             # Change orders with approval workflow
  /invoices/{id}               # Invoice tracking
  /audit_log/{id}              # Write operation audit trail
/pending_invites/{id}          # Pending user invitations
/access_requests/{id}          # Self-service access requests
```

## Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| Admin | Global | Full access, create projects, manage all users |
| Project Manager | Per-project | Post updates, manage actions, upload files, edit project |
| Stakeholder | Per-project | Upload files, ask questions, approve variations |
| Viewer | Per-project | Read-only access |

## License

Proprietary - Ethyl Merc Group Ltd.
