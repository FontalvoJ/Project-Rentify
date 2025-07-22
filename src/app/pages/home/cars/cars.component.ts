import { Component, OnInit } from '@angular/core';
import { CarService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  cars: any[] = [];  
  Loading: boolean = true;  
  errorMessage: string = '';  

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.loadCars();  
  }

  loadCars(): void {
    this.carService.getAllCarsForEveryone().subscribe(
      (response) => {
        this.cars = response.cars;  
        this.Loading = false;  
      },
      (error) => {
        console.error('Error fetching cars:', error);
        this.errorMessage = 'Failed to load cars. Please try again later.';
        this.Loading = false;  
      }
    );
  }
}
