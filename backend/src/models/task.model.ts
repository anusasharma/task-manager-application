import pool from '../config/database';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  created_at: Date;
  updated_at: Date;
}

function formatDateString(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export const TaskModel = {
  async findAllByUser(userId: number): Promise<Task[]> {
    const result = await pool.query<any>(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(task => ({ ...task, due_date: formatDateString(task.due_date) }));
  },

  async findById(id: number, userId: number): Promise<Task | null> {
    const result = await pool.query<any>(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    const task = result.rows[0];
    return task ? { ...task, due_date: formatDateString(task.due_date) } : null;
  },

  async create(userId: number, data: CreateTaskDto): Promise<Task> {
    const result = await pool.query<any>(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        userId,
        data.title,
        data.description || null,
        data.status || 'todo',
        data.priority || 'medium',
        data.due_date || null
      ]
    );
    const task = result.rows[0];
    return { ...task, due_date: formatDateString(task.due_date) };
  },

  async update(id: number, userId: number, data: UpdateTaskDto): Promise<Task | null> {
    const result = await pool.query<any>(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        data.title ?? null,
        data.description ?? null,
        data.status ?? null,
        data.priority ?? null,
        data.due_date ?? null,
        id,
        userId
      ]
    );
    const task = result.rows[0];
    return task ? { ...task, due_date: formatDateString(task.due_date) } : null;
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  },
};