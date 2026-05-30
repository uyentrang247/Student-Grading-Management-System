import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseClassList } from './course-class-list';

describe('CourseClassList', () => {
  let component: CourseClassList;
  let fixture: ComponentFixture<CourseClassList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseClassList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseClassList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
