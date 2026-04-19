import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySidebar } from './property-sidebar';

describe('PropertySidebar', () => {
  let component: PropertySidebar;
  let fixture: ComponentFixture<PropertySidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertySidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertySidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
