import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsersManagement } from './admin-users-management';

describe('AdminUsersManagement', () => {
  let component: AdminUsersManagement;
  let fixture: ComponentFixture<AdminUsersManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
