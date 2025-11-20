import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { NumberNodeComponent } from './number-node.component';

describe('NumberNodeComponent', () => {
  let component: NumberNodeComponent;
  let fixture: ComponentFixture<NumberNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('normalizes scalar number to array on init', () => {
    const provided = mockJsonAttributeNode();
    provided.definition.type = 'number' as any;
    provided.value = 3.14 as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [NumberNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(NumberNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(Array.isArray(cmp.jsonAttributeNode.value)).toBeTrue();
    expect(cmp.jsonAttributeNode.value).toEqual([3.14] as any);
    expect(cmp.values).toEqual([3.14]);
  });

  it('keeps array number values as-is on init', () => {
    const provided = mockJsonAttributeNode();
    provided.definition.type = 'number' as any;
    provided.value = [1, 2, 3] as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [NumberNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(NumberNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.values).toEqual([1, 2, 3]);
  });
});
