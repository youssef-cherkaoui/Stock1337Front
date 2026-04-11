import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserStatusManagement } from './admin-user-status-management';

describe('AdminUserStatusManagement', () => {
  let component: AdminUserStatusManagement;
  let fixture: ComponentFixture<AdminUserStatusManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserStatusManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserStatusManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
