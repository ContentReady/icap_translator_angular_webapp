import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FontpickerComponent } from './fontpicker.component';

describe('FontpickerComponent', () => {
  let component: FontpickerComponent;
  let fixture: ComponentFixture<FontpickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FontpickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FontpickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
