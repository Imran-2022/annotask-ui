# Frontend Setup Instructions

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Register page
│   └── tasks/page.tsx     # Main task management page
├── components/
│   ├── Board.tsx          # Kanban board component
│   ├── Column.tsx         # Kanban column component
│   ├── TaskCard.tsx       # Individual task card
│   ├── TaskModal.tsx      # Task creation/edit modal
│   └── DateSelector.tsx   # Date picker component
├── store/
│   ├── authStore.ts       # Authentication state (Zustand)
│   └── taskStore.ts       # Task state (Zustand)
├── services/
│   ├── apiClient.ts       # Axios instance with interceptors
│   ├── authService.ts     # Auth API calls
│   └── taskService.ts     # Task API calls
└── types/
    └── index.ts           # TypeScript types
```

## Features

- **Login/Register**: User authentication with email and password
- **Task Management**: Create, read, update, delete tasks
- **Kanban Board**: Drag-and-drop tasks between columns
- **Date Filtering**: View and manage tasks by date
- **Priority Levels**: Low, Medium, High
- **Task Tags**: Organize tasks with tags
- **Status Tracking**: To Do, In Progress, Done

## Technologies Used

- **Next.js 14**: React framework
- **React**: UI library
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **Axios**: HTTP client
- **react-beautiful-dnd**: Drag and drop
- **date-fns**: Date manipulation
