import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';
import { RosettaTypeCategory } from '../../models/builder.model';

import { EnumNodeComponent } from './enum-node.component';

describe('EnumNodeComponent', () => {
  let component: EnumNodeComponent;
  let fixture: ComponentFixture<EnumNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnumNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnumNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('normalizes scalar value to array and exposes enumType', () => {
    const provided = mockJsonAttributeNode();
    provided.definition.type = {
      typeCategory: RosettaTypeCategory.EnumType,
      name: 'Colours',
      values: [{ name: 'RED', displayName: 'Red' }],
    } as any;
    provided.value = 'RED' as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [EnumNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(EnumNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.values).toEqual(['RED']);
    expect(cmp.enumType.name).toBe('Colours');
  });

  it('keeps enum array values unchanged', () => {
    const provided = mockJsonAttributeNode();
    provided.definition.type = {
      typeCategory: RosettaTypeCategory.EnumType,
      name: 'Colours',
      values: [{ name: 'RED', displayName: 'Red' }],
    } as any;
    provided.value = ['RED', 'BLUE'] as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [EnumNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(EnumNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.values).toEqual(['RED', 'BLUE']);
  });
});
