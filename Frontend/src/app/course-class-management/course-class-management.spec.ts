import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseClassManagement } from './course-class-management';

describe('CourseClassManagement', () => {
  let component: CourseClassManagement;
  let fixture: ComponentFixture<CourseClassManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseClassManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseClassManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
