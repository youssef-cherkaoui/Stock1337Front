import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementManagement } from './departement-management';

describe('DepartementManagement', () => {
  let component: DepartementManagement;
  let fixture: ComponentFixture<DepartementManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartementManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartementManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
