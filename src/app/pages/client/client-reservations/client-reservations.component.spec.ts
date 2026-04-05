import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientReservationsComponent } from './client-reservations.component';

describe('ClientReservationsComponent', () => {
  let component: ClientReservationsComponent;
  let fixture: ComponentFixture<ClientReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
