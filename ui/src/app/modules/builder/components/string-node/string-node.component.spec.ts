import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { StringNodeComponent } from './string-node.component';

describe('StringNodeComponent', () => {
  let component: StringNodeComponent;
  let fixture: ComponentFixture<StringNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StringNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StringNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('normalizes scalar value to array on init', () => {
    const provided = mockJsonAttributeNode();
    provided.value = 'hello' as any;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [StringNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(StringNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(Array.isArray(cmp.jsonAttributeNode.value)).toBeTrue();
    expect(cmp.jsonAttributeNode.value).toEqual(['hello']);
    expect(cmp.values).toEqual(['hello']);
  });

  it('keeps array values as-is on init', () => {
    const provided = mockJsonAttributeNode();
    provided.value = ['a', 'b'] as any;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [StringNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(StringNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.values).toEqual(['a', 'b']);
  });
});
