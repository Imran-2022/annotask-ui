# Task Management + Image Annotation Frontend

## Local Setup

### Requirements
- Node 20.20.2+
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Optional environment variables
Create a `.env` file in the frontend root if you want to override the backend API URL.
```env
VITE_API_URL=http://localhost:8000/api
```
If no `.env` file is provided, the app defaults to `http://localhost:8000/api`.

### 3. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Pages
- `/login` — login page
- `/register` — register page
- `/tasks` — task management Kanban board with date filtering
- `/annotate` — image annotation page with upload and polygon annotation support

## Features
- Email/password login with JWT-based auth
- Task board with "To Do", "In Progress", and "Done" columns
- Date selector for daily task filtering
- Add/edit/delete tasks via modal
- Drag and drop tasks between columns
- Task persistence through Django backend APIs
- Image upload and annotation storage
- Polygon drawing and annotation management

## Project structure
```
frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TasksPage.tsx
│   │   └── AnnotatePage.tsx
│   ├── components/
│   │   ├── Board.tsx
│   │   ├── Column.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskModal.tsx
│   │   ├── DateSelector.tsx
│   │   ├── AnnotateTopToolbar.tsx
│   │   └── AnnotationsSidebar.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── TaskContext.tsx
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── medicalService.ts
│   │   └── wsCollaborationService.ts
│   └── hooks/
│       └── useMedicalAnnotation.ts
```

## Technologies used
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- @hello-pangea/dnd
- Konva / react-konva
- date-fns

## Notes
- Frontend is built with Vite, not Next.js.
- The app is aligned with the 404 project requirements: login, tasks page, daily task filtering, Kanban drag-and-drop, and image annotation.
- Use `/tasks` after login to manage tasks, and `/annotate` for image annotation.
