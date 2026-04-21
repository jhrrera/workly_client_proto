interface DepartmentApiDto {
  id: string;
  companyId: string;
  parentId: string | null;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  code?: string;
  description?: string;
  staffCount?: number;
}