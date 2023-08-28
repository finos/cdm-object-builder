import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedNodeControlsComponent } from './stacked-node-controls.component';

describe('StackedNodeControlsComponent', () => {
  let component: StackedNodeControlsComponent;
  let fixture: ComponentFixture<StackedNodeControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StackedNodeControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackedNodeControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
