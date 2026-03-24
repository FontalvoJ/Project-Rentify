import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCardsComponent } from './details-cards.component';

describe('DetailsCardsComponent', () => {
  let component: DetailsCardsComponent;
  let fixture: ComponentFixture<DetailsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
