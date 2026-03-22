import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashboardCb } from './user-dashboard-cb';

describe('UserDashboardCb', () => {
  let component: UserDashboardCb;
  let fixture: ComponentFixture<UserDashboardCb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardCb],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardCb);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
