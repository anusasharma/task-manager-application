import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, CreateTaskDto } from '../../models/task.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  showModal = false;
  saving = false;
  formError = '';
  editingTask: Task | null = null;
  form: CreateTaskDto = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  };

  columns = [
    { status: 'todo', label: 'To Do', dotClass: 'todo-dot' },
    { status: 'in-progress', label: 'In Progress', dotClass: 'inprogress-dot' },
    { status: 'done', label: 'Done', dotClass: 'done-dot' },
  ];

  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
  ) {}

  get user() {
    return this.authService.currentUser;
  }
  get initials() {
    return (
      this.user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U'
    );
  }
  get todoCount() {
    return this.tasks.filter((t) => t.status === 'todo').length;
  }
  get inProgressCount() {
    return this.tasks.filter((t) => t.status === 'in-progress').length;
  }
  get doneTasks() {
    return this.tasks.filter((t) => t.status === 'done').length;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    console.log('[TaskFlow] Loading tasks...');

    this.taskService
      .getTasks()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (tasks) => {
          console.log(`[TaskFlow] Loaded ${tasks.length} tasks`);

          this.tasks = [...tasks];
        },
        error: () => {
          console.error('[TaskFlow] Failed to load tasks:');

          this.tasks = [];
        },
      });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  openModal(): void {
    this.form = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' };
    this.editingTask = null;
    this.formError = '';
    this.showModal = true;
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.form = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
    };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTask = null;
  }

  saveTask(): void {
    console.log('[TaskFlow] Saving task:', this.form);

    if (!this.form.title?.trim()) {
      this.formError = 'Title is required';
      return;
    }

    this.saving = true;
    this.formError = '';

    const obs = this.editingTask
      ? this.taskService.updateTask(this.editingTask.id, this.form)
      : this.taskService.createTask(this.form);

    obs
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (task) => {
          if (this.editingTask) {
            this.tasks = this.tasks.map((t) => (t.id === task.id ? task : t));
          } else {
            this.tasks = [task, ...this.tasks];
          }

          this.showModal = false;
          this.editingTask = null;
        },
        error: (err) => {
          this.formError = err.error?.error || 'Failed to save';
        },
      });
  }

  moveTask(task: Task, status: 'todo' | 'in-progress' | 'done'): void {
    console.log(`[TaskFlow] Moving task ${task.id} to ${status}`);

    const oldStatus = task.status;
    task.status = status;

    this.taskService.updateTask(task.id, { status }).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) => (t.id === updated.id ? updated : t));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);

        // Roll back if API fails
        task.status = oldStatus;
      },
    });
  }

  confirmDelete(task: Task): void {
    console.log(`[TaskFlow] Deleting task ${task.id}`);

    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
