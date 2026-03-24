import { Component } from '@angular/core';
import { NavbarClientComponent } from "../../../layouts/navbar-client/navbar-client.component";
import { UpdateInfoComponent } from "../update-info/update-info.component";

@Component({
  selector: 'app-dashboard-client',
  imports: [NavbarClientComponent, UpdateInfoComponent],
  templateUrl: './dashboard-client.component.html',
  styleUrl: './dashboard-client.component.css'
})
export class DashboardClientComponent {

}
