import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateDepartmentDto {
  parentId: string | null;
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  parentId: string | null;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class OrganigramaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/department';

  getDepartments(): Observable<DepartmentApiDto[]> {
    return this.http.get<DepartmentApiDto[]>(`${this.apiUrl}/company`, {
      withCredentials: true
    });
  }

  createDepartment(payload: CreateDepartmentDto): Observable<DepartmentApiDto> {
    return this.http.post<DepartmentApiDto>(this.apiUrl, payload, {
      withCredentials: true
    });
  }

  updateDepartment(id: string, payload: UpdateDepartmentDto): Observable<DepartmentApiDto> {
    return this.http.put<DepartmentApiDto>(`${this.apiUrl}/${id}`, payload, {
      withCredentials: true
    });
  }
}