import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },

  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gente/personal' },

      {
        path: 'gente',
        data: { breadcrumb: 'Gente' },
        children: [
          {
            path: 'personal',
            title: 'Personal',
            data: { breadcrumb: 'Personal' },
            loadComponent: () =>
              import('./pages/personal/personal.page').then(m => m.PersonalPage)
          },
          {
            path: 'organigrama',
            title: 'Organigrama',
            data: { breadcrumb: 'Organigrama' },
            loadComponent: () =>
              import('./pages/organigrama/organigrama.page').then(m => m.OrganigramaPage)
          },
          {
            path: 'cargos',
            title: 'Cargos',
            data: { breadcrumb: 'Cargos' },
            loadComponent: () =>
              import('./pages/cargos/cargos.page').then(m => m.CargosPage)
          }
        ]
      },

      {
        path: 'company',
        title: 'Compañía',
        data: { breadcrumb: 'Compañía' },
        loadComponent: () =>
          import('./pages/company/company.page').then(m => m.CompanyPage)
      },
      {
        path: 'nomina',
        title: 'Nómina',
        data: { breadcrumb: 'Nómina' },
        loadComponent: () =>
          import('./pages/nomina/nomina.page').then(m => m.NominaPage)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];