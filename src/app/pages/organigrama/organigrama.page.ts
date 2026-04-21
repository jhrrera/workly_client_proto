import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  NzFormatEmitEvent,
  NzTreeComponent,
  NzTreeModule,
  NzTreeNode,
  NzTreeNodeOptions
} from 'ng-zorro-antd/tree';
import { OrganigramaService } from './organigrama.service';
import { AuthService } from '../../auth/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

type EditorMode = 'empty' | 'create' | 'edit';

interface DepartmentRecord {
  key: string;
  parentKey: string;
  name: string;
  code?: string;
  description?: string;
  staffCount?: number;
}

type DepartmentTreeNode = NzTreeNodeOptions & {
  record?: DepartmentRecord;
  children?: DepartmentTreeNode[];
};

@Component({
  selector: 'app-organizational-structure-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzEmptyModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzTreeModule,
    NzTooltipModule,
    NzSpinModule
  ],
  template: `
    <section class="org-page">
      <header class="page-header">
        <div>
          <h1>Estructura organizacional</h1>
          <p>Gestiona las relaciones jerárquicas entre departamentos.</p>
        </div>

        <button nz-button nzType="primary" (click)="startCreate()">
          + Nuevo Departamento
        </button>
      </header>

      <div class="page-grid">
        <nz-card class="tree-panel">
          <div class="panel-top">
            <span class="panel-label">MAPA JERÁRQUICO</span>

            <div class="panel-links">
              <button nz-button nzType="link" type="button" (click)="expandAll()">
                Expandir todo
              </button>
              <button nz-button nzType="link" type="button" (click)="collapseAll()">
                Colapsar todo
              </button>
            </div>
          </div>

          <div class="tree-area">
  <nz-spin [nzSpinning]="isTreeLoading" nzTip="Cargando departamentos...">
    <ng-container *ngIf="!isTreeLoading">
      <nz-tree
        #treeRef
        [nzData]="treeData"
        [nzBlockNode]="true"
        [nzExpandedKeys]="expandedKeys"
        [nzSelectedKeys]="selectedKeys"
        [nzTreeTemplate]="treeNodeTpl"
        (nzClick)="onTreeNodeClick($event)"
        (nzExpandChange)="onExpandChange($event)"
      ></nz-tree>
    </ng-container>

    <ng-template #treeNodeTpl let-node let-origin="origin">
      <span
        nz-tooltip
        [nzTooltipTitle]="origin['record']?.description || origin.title"
        nzTooltipPlacement="right"
      >
        {{ origin.title }}
      </span>
    </ng-template>
  </nz-spin>
</div>
        </nz-card>

        <nz-card class="editor-panel">
          <div class="editor-wrap">
            <div class="editor-header">
              <div>
                <div class="editor-title-row">
                  <h3>{{ panelTitle }}</h3>

                  <nz-tag *ngIf="editorMode === 'create'" nzColor="processing">
                    Creando
                  </nz-tag>

                  <nz-tag *ngIf="editorMode === 'edit'" nzColor="blue">
                    Editando
                  </nz-tag>
                </div>
              </div>

              <button nz-button nzType="text" class="close-btn" (click)="closeEditor()">
                ×
              </button>
            </div>

            <ng-container *ngIf="editorMode !== 'empty'; else emptyState">
              <form nz-form nzLayout="vertical" [formGroup]="departmentForm" class="editor-form">
                <nz-form-item>
                  <nz-form-label nzRequired nzFor="parentKey">
                    Departamento padre
                  </nz-form-label>
                  <nz-form-control>
                    <nz-select id="parentKey" formControlName="parentKey">
                      <nz-option
                        *ngFor="let option of parentOptions"
                        [nzLabel]="option.label"
                        [nzValue]="option.value"
                      ></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label nzRequired nzFor="name">
                    Nombre del departamento
                  </nz-form-label>
                  <nz-form-control nzErrorTip="Department name is required">
                    <input
                      id="name"
                      nz-input
                      formControlName="name"
                      placeholder="Nombre del departamento"
                    />
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label nzFor="code">Codigo</nz-form-label>
                  <nz-form-control>
                    <input
                      id="code"
                      nz-input
                      formControlName="code"
                      placeholder="DEPT-120"
                    />
                    <div class="field-hint">Identificador único administrador por el sistema.</div>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label nzFor="description">Descripción</nz-form-label>
                  <nz-form-control>
                    <textarea
                      id="description"
                      nz-input
                      rows="4"
                      formControlName="description"
                      placeholder="Descripción del departamento"
                    ></textarea>
                  </nz-form-control>
                </nz-form-item>

                <div class="form-actions">
                  <button nz-button type="button" (click)="cancelEditor()">
                    Cancelar
                  </button>

                  <button nz-button nzType="primary" type="button" (click)="saveDepartment()">
                    {{ editorMode === 'create' ? 'Crear Departamentos' : 'Guardar cambios' }}
                  </button>
                </div>
              </form>
            </ng-container>

            <ng-template #emptyState>
              <div class="empty-editor">
                <nz-empty nzNotFoundContent="Selecciona un departamento o crea uno"></nz-empty>
              </div>
            </ng-template>
          </div>

          
        </nz-card>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .org-page {
      padding: 8px;
      min-height: 100%;
      box-sizing: border-box;
      color: rgba(0, 0, 0, 0.88);
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 600;
    }

    .page-header p {
      margin: 4px 0 0;
      color: rgba(0, 0, 0, 0.45);
      font-size: 13px;
    }

    .page-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 310px;
      gap: 16px;
      align-items: stretch;
    }

    .tree-panel,
    .editor-panel {
      border-radius: 4px;
    }

    .panel-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 12px;
    }

    .panel-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: rgba(0, 0, 0, 0.85);
    }

    .panel-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tree-area {
      min-height: 590px;
      padding-top: 4px;
    }

    .editor-panel {
      display: flex;
      flex-direction: column;
      min-height: 690px;
    }

    .editor-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .editor-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
    }

    .editor-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .editor-title-row h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .close-btn {
      min-width: auto;
      padding-inline: 6px;
      font-size: 18px;
      line-height: 1;
      color: rgba(0, 0, 0, 0.45);
    }

    .editor-form {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-right: 2px;
    }

    .field-hint {
      margin-top: 4px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid #f0f0f0;
    }

    .empty-editor {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 480px;
    }

    .editor-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      padding: 12px 16px;
      margin: 0 -24px -24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      font-size: 12px;
      color: #1677ff;
    }

    .footer-label {
      color: rgba(0, 0, 0, 0.65);
    }

    @media (max-width: 992px) {
      .page-grid {
        grid-template-columns: 1fr;
      }

      .tree-area {
        min-height: 360px;
      }

      .editor-panel {
        min-height: 520px;
      }
    }
  `]
})
export class OrganigramaPage implements AfterViewInit, OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(OrganigramaService);
  private readonly authService = inject(AuthService);
  isTreeLoading = false;

  @ViewChild('treeRef') treeComponent?: NzTreeComponent;

  companyRootKey = "";
  companyName = ""

  editorMode: EditorMode = 'empty';
  selectedKeys: string[] = [];
  expandedKeys: string[] = [];

  private codeSequence = 121;

treeData: DepartmentTreeNode[] = [
  {
    key: this.companyRootKey,
    title: this.companyName,
    selectable: false,
    children: []
  }
];

  departmentForm = this.fb.group({
    parentKey: [this.companyRootKey, Validators.required],
    name: ['', Validators.required],
    code: [{ value: '', disabled: true }],
    description: ['']
  });

  constructor() {
  }
  ngOnInit(): void {
    this.loadDepartments();
    const me: AuthMeResponse | null = this.authService.me();
    if (me != null) {
      this.companyRootKey = me.companyId?.toString();
      this.companyName = me.companyName?.toString();
    }
  }

private loadDepartments(): void {
  this.isTreeLoading = true;

  this.service.getDepartments()
    .subscribe({
      next: (items) => {
        this.isTreeLoading = false;
        const records = items
          .filter(item => item.active)
          .map(item => this.mapApiToRecord(item));

        this.treeData = this.buildTreeFromFlat(records);
        this.expandedKeys = this.getAllKeys(this.treeData);

        this.cdr.detectChanges();
        this.syncTreeExpansion();
      },
      error: (error) => {
        console.error('Error cargando departamentos', error);
      }
    });
}

private buildTreeFromFlat(records: DepartmentRecord[]): DepartmentTreeNode[] {
  const root: DepartmentTreeNode = {
    key: this.companyRootKey,
    title: this.companyName,
    selectable: false,
    children: []
  };

  const map = new Map<string, DepartmentTreeNode>();

  for (const record of records) {
    map.set(record.key, this.makeDepartmentNode(record, []));
  }

  for (const record of records) {
    const node = map.get(record.key)!;

    if (!record.parentKey || record.parentKey === this.companyRootKey) {
      root.children!.push(node);
      continue;
    }

    const parentNode = map.get(record.parentKey);
    if (parentNode) {
      parentNode.children = parentNode.children ?? [];
      parentNode.children.push(node);
    } else {
      root.children!.push(node);
    }
  }

  return [root];
}
private mapApiToRecord(dto: DepartmentApiDto): DepartmentRecord {
  return {
    key: dto.id,
    parentKey: dto.parentId ?? this.companyRootKey,
    name: dto.name,
    code: dto.code,
    description: dto.description,
    staffCount: dto.staffCount
  };
}
  ngAfterViewInit(): void {
    this.syncTreeExpansion();
  }

  get panelTitle(): string {
    return 'Administrando';
  }

  get selectedDepartment(): DepartmentRecord | null {
    const key = this.selectedKeys[0];
    if (!key) return null;

    const node = this.findNodeByKey(this.treeData, key);
    return node?.['record'] ?? null;
  }

  get footerStaff(): string | number {
    if (this.editorMode === 'edit' && this.selectedDepartment) {
      return this.selectedDepartment.staffCount || 0;
    }
    return '--';
  }

  get footerSubDepartments(): string | number {
    if (this.editorMode === 'edit' && this.selectedKeys[0]) {
      const node = this.findNodeByKey(this.treeData, this.selectedKeys[0]);
      return node?.children?.length ?? 0;
    }
    return '--';
  }

  get parentOptions(): Array<{ label: string; value: string }> {
    const blockedKeys = new Set<string>();

    if (this.editorMode === 'edit' && this.selectedKeys[0]) {
      blockedKeys.add(this.selectedKeys[0]);
      const currentNode = this.findNodeByKey(this.treeData, this.selectedKeys[0]);
      if (currentNode) {
        this.collectDescendantKeys(currentNode, blockedKeys);
      }
    }

    const departmentOptions = this.flattenDepartments(this.treeData)
      .filter(item => !blockedKeys.has(item.key))
      .map(item => ({
        label: item.name,
        value: item.key
      }));

    return [
      { label: this.companyName, value: this.companyRootKey },
      ...departmentOptions
    ];
  }

  onTreeNodeClick(event: NzFormatEmitEvent): void {
  const clickedKey = String(event.node?.key ?? '');
  if (!clickedKey) return;

  const clickedNode = this.findNodeByKey(this.treeData, clickedKey);
  if (!clickedNode?.['record']) return;

  this.openEdit(clickedNode['record'].key);
}

  onExpandChange(event: NzFormatEmitEvent): void {
    const key = String(event.node?.key ?? '');
    if (!key) return;

    if (event.node?.isExpanded) {
      this.expandedKeys = [...new Set([...this.expandedKeys, key])];
    } else {
      this.expandedKeys = this.expandedKeys.filter(k => k !== key);
    }
  }

  startCreate(): void {
    const selectedParentKey = this.selectedKeys[0] || this.companyRootKey;

    this.editorMode = 'create';

    this.departmentForm.reset({
      parentKey: selectedParentKey,
      name: '',
      code: '',
      description: ''
    });

    this.departmentForm.controls.code.disable({ emitEvent: false });
  }

  openEdit(key: string): void {
    const node = this.findNodeByKey(this.treeData, key);
    if (!node?.['record']) return;

    this.editorMode = 'edit';
    this.selectedKeys = [key];

    this.departmentForm.reset({
      parentKey: node['record'].parentKey,
      name: node['record'].name,
      code: node['record'].code,
      description: node['record'].description
    });

    this.departmentForm.controls.code.disable({ emitEvent: false });
  }

  cancelEditor(): void {
    /**
     *  if (this.editorMode === 'edit' && this.selectedKeys[0]) {
      this.openEdit(this.selectedKeys[0]);
      return;
    }
     * 
     */
    this.closeEditor();
  }

  closeEditor(): void {
    console.log("closing?");
    this.editorMode = 'empty';
    this.selectedKeys = [];
    this.departmentForm.reset({
      parentKey: this.companyRootKey,
      name: '',
      code: '',
      description: ''
    });
    this.departmentForm.controls.code.disable({ emitEvent: false });
  }

  saveDepartment(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    if (this.editorMode === 'create') {
      this.createDepartment();
      return;
    }

    if (this.editorMode === 'edit') {
      this.updateDepartment();
    }
    console.log(this.departmentForm);
  }

  expandAll(): void {
    this.expandedKeys = this.getAllKeys(this.treeData);
    this.syncTreeExpansion();
  }

  collapseAll(): void {
    this.expandedKeys = [];
    this.syncTreeExpansion();
  }

  private createDepartment(): void {
    const raw = this.departmentForm.getRawValue();
    const newKeyBase = this.slugify(raw.name || 'department');
    const newCode = `DEPT-${this.codeSequence++}`;
    const finalKey = `${newKeyBase}-${Date.now()}`;

    const newRecord: DepartmentRecord = {
      key: finalKey,
      parentKey: raw.parentKey || this.companyRootKey,
      name: raw.name || '',
      code: newCode,
      description: raw.description || '',
      staffCount: 0
    };

    const newNode = this.makeDepartmentNode(newRecord);

    this.attachNodeToParent(newNode, newRecord.parentKey);
    this.refreshTreeState();
    this.expandPathTo(finalKey);
    this.openEdit(finalKey);
  }

  private updateDepartment(): void {
    const currentKey = this.selectedKeys[0];
    if (!currentKey) return;

    const currentNode = this.findNodeByKey(this.treeData, currentKey);
    if (!currentNode?.['record']) return;

    const raw = this.departmentForm.getRawValue();
    const nextParentKey = raw.parentKey || this.companyRootKey;

    currentNode['record'] = {
      ...currentNode['record'],
      name: raw.name || currentNode['record'].name,
      description: raw.description || '',
      parentKey: nextParentKey
    };

    currentNode.title = currentNode['record'].name;

    const currentParentKey = this.findActualParentKey(this.treeData, currentKey);

    if (currentParentKey && currentParentKey !== nextParentKey) {
      const detachedNode = this.detachNode(currentKey, this.treeData);
      if (detachedNode) {
        detachedNode['record'] = currentNode['record'];
        detachedNode.title = currentNode['record'].name;
        this.attachNodeToParent(detachedNode, nextParentKey);
      }
    }

    this.refreshTreeState();
    this.expandPathTo(currentKey);
    this.openEdit(currentKey);
  }

  private refreshTreeState(): void {
    this.treeData = [...this.treeData];
    this.cdr.detectChanges();
    this.syncTreeExpansion();
  }

  private syncTreeExpansion(): void {
    if (!this.treeComponent) return;

    const nodes = this.treeComponent.getTreeNodes();
    const expandedSet = new Set(this.expandedKeys);

    this.applyExpandedState(nodes, expandedSet);
  }

  private applyExpandedState(nodes: NzTreeNode[], expandedSet: Set<string>): void {
    for (const node of nodes) {
      const key = String(node.key ?? '');
      node.setExpanded(expandedSet.has(key));

      const children = node.getChildren();
      if (children?.length) {
        this.applyExpandedState(children, expandedSet);
      }
    }
  }

  private expandPathTo(targetKey: string): void {
    const path = this.findPathToKey(this.treeData, targetKey);
    if (!path.length) return;

    this.expandedKeys = [...new Set(path.filter(key => key !== targetKey))];
    this.cdr.detectChanges();
    this.syncTreeExpansion();
  }

  private findPathToKey(
    nodes: DepartmentTreeNode[],
    targetKey: string,
    currentPath: string[] = []
  ): string[] {
    for (const node of nodes) {
      const nodeKey = String(node.key ?? '');
      const nextPath = nodeKey ? [...currentPath, nodeKey] : [...currentPath];

      if (node['record']?.key === targetKey || nodeKey === targetKey) {
        return nextPath;
      }

      if (node.children?.length) {
        const found = this.findPathToKey(node.children, targetKey, nextPath);
        if (found.length) {
          return found;
        }
      }
    }

    return [];
  }

  private attachNodeToParent(node: DepartmentTreeNode, parentKey: string): void {
    if (parentKey === this.companyRootKey) {
      const root = this.treeData[0];
      root.children = [...(root.children ?? []), node];
      return;
    }

    const parentNode = this.findNodeByKey(this.treeData, parentKey);
    if (!parentNode) return;

    parentNode.children = [...(parentNode.children ?? []), node];
  }

  private detachNode(key: string, nodes: DepartmentTreeNode[]): DepartmentTreeNode | null {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];

      if (node['record']?.key === key) {
        nodes.splice(index, 1);
        return node;
      }

      if (node.children?.length) {
        const found = this.detachNode(key, node.children);
        if (found) return found;
      }
    }

    return null;
  }

  private findActualParentKey(nodes: DepartmentTreeNode[], childKey: string): string | null {
    for (const node of nodes) {
      if (node.children?.some(child => child['record']?.key === childKey)) {
        return (node['record']?.key ?? String(node.key ?? '')) || null;
      }

      if (node.children?.length) {
        const found = this.findActualParentKey(node.children, childKey);
        if (found) return found;
      }
    }

    return null;
  }

  private flattenDepartments(nodes: DepartmentTreeNode[]): DepartmentRecord[] {
    const result: DepartmentRecord[] = [];

    for (const node of nodes) {
      if (node['record']) {
        result.push(node['record']);
      }

      if (node.children?.length) {
        result.push(...this.flattenDepartments(node.children));
      }
    }

    return result;
  }

  private collectDescendantKeys(node: DepartmentTreeNode, bucket: Set<string>): void {
    for (const child of node.children ?? []) {
      if (child['record']?.key) {
        bucket.add(child['record'].key);
      }
      this.collectDescendantKeys(child, bucket);
    }
  }

  private getAllKeys(nodes: DepartmentTreeNode[]): string[] {
    const keys: string[] = [];

    for (const node of nodes) {
      if (node.key) {
        keys.push(String(node.key));
      }

      if (node.children?.length) {
        keys.push(...this.getAllKeys(node.children));
      }
    }

    return keys;
  }

  private findNodeByKey(nodes: DepartmentTreeNode[], key: string): DepartmentTreeNode | undefined {
    for (const node of nodes) {
      if (node['record']?.key === key || String(node.key) === key) {
        return node;
      }

      if (node.children?.length) {
        const found = this.findNodeByKey(node.children, key);
        if (found) return found;
      }
    }

    return undefined;
  }

  private slugify(value: string): string {
    return (
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'department'
    );
  }

  private makeDepartmentNode(
    record: DepartmentRecord,
    children: DepartmentTreeNode[] = []
  ): DepartmentTreeNode {
    return {
      key: record.key,
      title: record.name,
      selectable: true,
      record,
      children
    };
  }
}