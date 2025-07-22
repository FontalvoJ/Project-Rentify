import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarHomeComponent } from './pages/Navbars/navbar-home/navbar-home.component';
import { NavbarAdminComponent } from './pages/Navbars/navbar-admin/navbar-admin.component';
import { NavbarClientComponent } from './pages/Navbars/navbar-client/navbar-client.component';
import { FooterGeneralComponent } from './pages/Footer/footer-general/footer-general.component';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { HomeComponent } from './pages/home/home/home.component';
import { DashboardAdminComponent } from './pages/admin/dashboard-admin/dashboard-admin.component';
import { DashboardClientComponent } from './pages/client/dashboard-client/dashboard-client.component';

import { TokenInterceptorService } from './services/token-interceptor/token-interceptor.service';

import { ListCarsReservationsComponent } from './pages/admin/list-cars-reservations/list-cars-reservations.component';
import { DetailsCardsComponent } from './pages/admin/details-cards/details-cards.component';
import { CarsComponent } from './pages/home/cars/cars.component';

import { UpdateInfoComponent } from './pages/client/update-info/update-info.component';
import { CarsReservationComponent } from './pages/client/cars-reservation/cars-reservation.component';
import { ClientReservationsComponent } from './pages/client/client-reservations/client-reservations.component';
import { AllReservationsComponent } from './pages/admin/all-reservations/all-reservations.component';
import { SignUpUsersComponent } from './pages/auth/sign-up-users/sign-up-users.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarHomeComponent,
    NavbarAdminComponent,
    NavbarClientComponent,
    FooterGeneralComponent,
    SignInComponent,
    HomeComponent,
    DashboardAdminComponent,
    ListCarsReservationsComponent,
    DetailsCardsComponent,
    DashboardClientComponent,
    DetailsCardsComponent,
    CarsComponent,
    UpdateInfoComponent,
    CarsReservationComponent,
    ClientReservationsComponent,
    AllReservationsComponent,
    SignUpUsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }