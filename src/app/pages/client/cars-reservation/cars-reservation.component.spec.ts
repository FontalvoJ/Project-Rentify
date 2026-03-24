import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsReservationComponent } from './cars-reservation.component';

describe('CarsReservationComponent', () => {
  let component: CarsReservationComponent;
  let fixture: ComponentFixture<CarsReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
