import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzLayoutModule,
    NzDropDownModule
  ],
  template: `
    <nz-layout class="app-layout">
      <nz-sider
        nzCollapsible
        [(nzCollapsed)]="isCollapsed"
        [nzTrigger]="null"
        class="app-sider"
      >
        <div class="logo">Workly</div>

        <ul nz-menu nzMode="inline" nzTheme="light">
          <li nz-submenu nzTitle="Gente" nzIcon="user">
            <ul>
              <li
                nz-menu-item
                [routerLink]="['/gente/personal']"
                routerLinkActive="ant-menu-item-selected"
              >
                Personal
              </li>

              <li
                nz-menu-item
                [routerLink]="['/gente/organigrama']"
                routerLinkActive="ant-menu-item-selected"
              >
                Organigrama
              </li>

              <li
                nz-menu-item
                [routerLink]="['/gente/cargos']"
                routerLinkActive="ant-menu-item-selected"
              >
                Cargos
              </li>
            </ul>
          </li>

          <li
            nz-menu-item
            [routerLink]="['/company']"
            routerLinkActive="ant-menu-item-selected"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <nz-icon nzType="shop" />
            <span>Compañía</span>
          </li>

          <li
            nz-menu-item
            [routerLink]="['/nomina']"
            routerLinkActive="ant-menu-item-selected"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <nz-icon nzType="dollar" />
            <span>Nómina</span>
          </li>
        </ul>
      </nz-sider>

      <nz-layout class="app-main-layout">
        <nz-header class="app-header">
          <div class="header-content">
            <nz-icon
              class="trigger"
              [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"
              (click)="isCollapsed = !isCollapsed"
            />

            <div class="header-right">
              <div
                class="user-dropdown-trigger"
                nz-dropdown
                [nzDropdownMenu]="userMenu"
                [nzTrigger]="'click'"
                [nzPlacement]="'bottomRight'"
              >
                <div class="user-info">
                  <div class="user-name">
                    {{ user()?.fullName }}
                  </div>
                  <div class="user-role">
                    {{ user()?.role || 'Sin rol' }}
                  </div>
                </div>

                <nz-icon nzType="down" class="user-dropdown-icon" />
              </div>
            </div>

            <nz-dropdown-menu #userMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item (click)="logout()">
                  Cerrar sesión
                </li>
              </ul>
            </nz-dropdown-menu>
          </div>
        </nz-header>

        <nz-content class="app-content">
          <nz-breadcrumb nzAutoGenerate></nz-breadcrumb>
          <div class="content-scroll">
            <div class="inner-content">
              <router-outlet />
            </div>
          </div>
        </nz-content>

        <nz-footer class="app-footer">
          Workly ©{{ year }} Hecho en Nicaragua
        </nz-footer>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .app-layout {
      height: 100%;
      overflow: hidden;
    }

    .app-sider {
      background: #fff !important;
      border-right: 1px solid #f0f0f0;
    }

    .app-main-layout {
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    .trigger {
      font-size: 18px;
      line-height: 64px;
      padding: 0 24px;
      cursor: pointer;
      transition: color 0.3s;
    }

    .trigger:hover {
      color: #1890ff;
    }

    .logo {
      height: 32px;
      margin: 16px;
      border-radius: 8px;
      background: #f5f5f5;
      color: #262626;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .app-header {
      background: #fff;
      padding: 0 16px 0 0;
      border-bottom: 1px solid #f0f0f0;
      flex: 0 0 auto;
    }


    .header-content {
      height: 64px;
      display: flex;
      align-items: center;
    }

    .header-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 0 0 auto;
    }

    .user-dropdown-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      cursor: pointer;
      padding: 0 4px 0 16px;
      flex: 0 0 auto;
      width: max-content;
      min-width: max-content;
    }

   

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  line-height: 1.2;
}
    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .user-role {
      font-size: 13px;
      color: #8c8c8c;
      text-transform: uppercase;
    }

    .user-dropdown-icon {
      font-size: 12px;
      color: #8c8c8c;
    }

    .app-content {
      margin: 0 16px;
      background: #f0f2f5;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .content-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding-bottom: 16px;
    }

    nz-breadcrumb {
      margin: 16px 0;
    }

    .inner-content {
      padding: 24px;
      background: #fff;
      min-height: 360px;
      border-radius: 12px;
      box-sizing: border-box;
    }

    .app-footer {
      text-align: center;
      background: #f0f2f5;
      flex: 0 0 auto;
      border-top: 1px solid #f0f0f0;
    }

    .ant-layout-footer {
      padding: 8px 50px;
      color: rgba(0, 0, 0, .85);
      font-size: 14px;
      background: #f0f2f5;
    }
  `]
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.me;

  isCollapsed = false;
  year = new Date().getFullYear();

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login')
    });
  }
}