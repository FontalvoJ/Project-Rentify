import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpUsersComponent } from './sign-up-users.component';

describe('SignUpUsersComponent', () => {
  let component: SignUpUsersComponent;
  let fixture: ComponentFixture<SignUpUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
