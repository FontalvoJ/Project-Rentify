import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCarsReservationsComponent } from './list-cars-reservations.component';

describe('ListCarsReservationsComponent', () => {
  let component: ListCarsReservationsComponent;
  let fixture: ComponentFixture<ListCarsReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCarsReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCarsReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
