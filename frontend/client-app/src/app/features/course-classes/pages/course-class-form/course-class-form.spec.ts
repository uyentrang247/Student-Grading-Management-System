import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseClassForm } from './course-class-form';

describe('CourseClassForm', () => {
  let component: CourseClassForm;
  let fixture: ComponentFixture<CourseClassForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseClassForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseClassForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
