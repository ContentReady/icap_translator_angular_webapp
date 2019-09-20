import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatedVideoComponent } from './translated-video.component';

describe('TranslatedVideoComponent', () => {
  let component: TranslatedVideoComponent;
  let fixture: ComponentFixture<TranslatedVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranslatedVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslatedVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
