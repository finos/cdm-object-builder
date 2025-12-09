import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { IntNodeComponent } from './int-node.component';

describe('IntNodeComponent', () => {
  let component: IntNodeComponent;
  let fixture: ComponentFixture<IntNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IntNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IntNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preserves provided int value from injected node', () => {
    const provided = mockJsonAttributeNode();
    provided.definition.type = 'int' as any;
    provided.value = 42 as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [IntNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(IntNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.jsonAttributeNode.value).toBe(42 as any);
  });
});
