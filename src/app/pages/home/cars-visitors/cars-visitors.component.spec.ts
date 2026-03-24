import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsVisitorsComponent } from './cars-visitors.component';

describe('CarsVisitorsComponent', () => {
  let component: CarsVisitorsComponent;
  let fixture: ComponentFixture<CarsVisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsVisitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
