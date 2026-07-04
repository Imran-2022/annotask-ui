export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  tags: string;
  tags_list?: string[];
  created_at: string;
  updated_at: string;
  order: number;
}

export interface AnnotationShapePoint {
  x: number;
  y: number;
}

export type AnnotationShape = {
  id: string;
  points: AnnotationShapePoint[];
  label?: string;
  color?: string;
};

export type ShapeType = 'polygon' | 'circle' | 'rectangle' | 'line' | 'freehand' | 'point';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type LabelClass = 'tumor' | 'healthy' | 'artifact' | 'other';

export interface AnnotationProject {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AnnotationLayer {
  id: number;
  name: string;
  is_visible: boolean;
}

export interface AnnotationComment {
  id: number;
  annotation: number;
  author_email: string;
  text: string;
  created_at: string;
}

export interface AnnotationHistory {
  id: number;
  annotation: number;
  changed_at: string;
  changes: Record<string, any>;
}

export interface UserPresence {
  id: number;
  user_email: string;
  last_seen: string;
}

export interface Annotation {
  id: number;
  user: number;
  image_url?: string;
  image_file?: string;
  image_file_url?: string;
  annotation_data?: {
    shapes?: AnnotationShape[];
    [key: string]: any;
  };
  project?: number;
  label_class?: string;
  creator_email?: string;
  review_status?: ReviewStatus;
  is_locked?: boolean;
  locked_by?: string;
  color?: string;
  opacity?: number;
  stroke_width?: number;
  shape_type?: ShapeType;
  shape_data?: {
    points?: AnnotationShapePoint[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, password2: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export interface TaskState {
  tasks: Task[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  
  fetchTasks: (date: Date) => Promise<void>;
  fetchTasksByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => Promise<void>;
  updateTask: (id: number, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  changeTaskStatus: (taskId: number, newStatus: Task['status']) => Promise<void>;
  setError: (error: string | null) => void;
}

export interface AnnotationState {
  currentProject: AnnotationProject | null;
  annotations: Annotation[];
  layers: AnnotationLayer[];
  activeUsers: UserPresence[];
  selectedAnnotations: Annotation[];
  isLoading: boolean;
  error: string | null;
  
  fetchProject: (projectId: number) => Promise<void>;
  fetchAnnotations: (projectId: number) => Promise<void>;
  fetchLayers: (projectId: number) => Promise<void>;
  addAnnotation: (annotation: Partial<Annotation>) => Promise<void>;
  updateAnnotation: (id: number, annotation: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: number) => Promise<void>;
  lockAnnotation: (id: number) => Promise<void>;
  unlockAnnotation: (id: number) => Promise<void>;
  reviewAnnotation: (id: number, status: ReviewStatus) => Promise<void>;
  selectAnnotation: (annotation: Annotation) => void;
  deselectAnnotation: (id: number) => void;
  clearSelection: () => void;
  setError: (error: string | null) => void;
}
