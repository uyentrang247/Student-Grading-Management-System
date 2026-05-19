import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetakeList } from './retake-list';

describe('RetakeList', () => {
  let component: RetakeList;
  let fixture: ComponentFixture<RetakeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetakeList],
    }).compileComponents();

    fixture = TestBed.createComponent(RetakeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
