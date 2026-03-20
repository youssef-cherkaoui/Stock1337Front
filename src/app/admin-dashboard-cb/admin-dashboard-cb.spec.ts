import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardCb } from './admin-dashboard-cb';

describe('AdminDashboardCb', () => {
  let component: AdminDashboardCb;
  let fixture: ComponentFixture<AdminDashboardCb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardCb],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardCb);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
