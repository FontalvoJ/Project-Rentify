import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { CarsVisitorsComponent } from './pages/home/cars-visitors/cars-visitors.component';

import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpUsersComponent } from './pages/auth/sign-up-users/sign-up-users.component';

import { DashboardAdminComponent } from './pages/admin/dashboard-admin/dashboard-admin.component';
import { ListCarsReservationsComponent } from './pages/admin/list-cars-reservations/list-cars-reservations.component';
import { AllReservationsComponent } from './pages/admin/all-reservations/all-reservations.component';

import { DashboardClientComponent } from './pages/client/dashboard-client/dashboard-client.component';
import { UpdateInfoComponent } from './pages/client/update-info/update-info.component';
import { CarsReservationComponent } from './pages/client/cars-reservation/cars-reservation.component';
import { ClientReservationsComponent } from './pages/client/client-reservations/client-reservations.component';

import { authGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Rutas públicas
  { path: 'home', component: HomeComponent },
  { path: 'cars-home', component: CarsVisitorsComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up-users', component: SignUpUsersComponent },

  // Admin rutas protegidas
  {
    path: '',
    canActivateChild: [authGuard],   // <-- se aplica a todas las rutas hijas
    data: { roles: ['admin'] },      // <-- solo admins
    children: [
      { path: 'dashboard-admin', component: DashboardAdminComponent },
      { path: 'cars-reservations', component: ListCarsReservationsComponent },
      { path: 'all-reservations', component: AllReservationsComponent },
      { path: '', redirectTo: 'dashboard-admin', pathMatch: 'full' }
    ]
  },

  // Cliente rutas protegidas
  {
    path: '',
    canActivateChild: [authGuard],   // <-- se aplica a todas las rutas hijas
    data: { roles: ['client'] },     // <-- solo clientes
    children: [
      { path: 'dashboard-client', component: DashboardClientComponent },
      { path: 'update-info', component: UpdateInfoComponent },
      { path: 'cars-to-reservation', component: CarsReservationComponent },
      { path: 'my-reservations', component: ClientReservationsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'home' }
];