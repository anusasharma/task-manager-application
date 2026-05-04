import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, CreateTaskDto } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` });
  }

  private get noCacheHeaders(): HttpHeaders {
    return this.headers
      .set('Cache-Control', 'no-cache')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { headers: this.noCacheHeaders });
  }

  createTask(data: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, data, { headers: this.headers });
  }

  updateTask(id: number, data: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, data, { headers: this.headers });
  }

deleteTask(id: number): Observable<unknown> {
  return this.http.delete(`${this.apiUrl}/${id}`, { 
    headers: this.headers,
    responseType: 'text'
  });
}
}