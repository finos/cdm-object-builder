import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockStructuredJsonAttributeNode } from '../../mocks/model-mocks';

import { NodeDetailsComponent } from './node-details.component';

describe('NodeDetailsComponent', () => {
  let component: NodeDetailsComponent;
  let fixture: ComponentFixture<NodeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NodeDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NodeDetailsComponent);
    component = fixture.componentInstance;
    component.jsonAttributeNode = mockStructuredJsonAttributeNode();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
