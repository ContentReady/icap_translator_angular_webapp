import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatedComponent } from './translated.component';

describe('TranslatedComponent', () => {
  let component: TranslatedComponent;
  let fixture: ComponentFixture<TranslatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranslatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
