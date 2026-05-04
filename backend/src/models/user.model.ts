import pool from '../config/database';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export const UserModel = {
  async create(data: CreateUserDto): Promise<User> {
    const result = await pool.query<User>(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.email, data.password]
    );
    return result.rows[0];
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async findById(id: number): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT id, name, email, created_at FROM users WHERE id = $1', [id]
    );
    return result.rows[0] || null;
  },
};