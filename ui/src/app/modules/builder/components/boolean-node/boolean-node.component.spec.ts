import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { BooleanNodeComponent } from './boolean-node.component';

describe('BooleanNodeComponent', () => {
  let component: BooleanNodeComponent;
  let fixture: ComponentFixture<BooleanNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BooleanNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BooleanNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('binds and exposes boolean value from injected node', () => {
    const provided = mockJsonAttributeNode();
    provided.definition.type = 'boolean' as any;
    provided.value = true as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [BooleanNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(BooleanNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.jsonAttributeNode.value).toBeTrue();
  });
});
