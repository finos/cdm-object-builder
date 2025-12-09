import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { ZonedDateTimeNodeComponent } from './zoned-date-time-node.component';

describe('ZonedDateTimeNodeComponent', () => {
  let component: ZonedDateTimeNodeComponent;
  let fixture: ComponentFixture<ZonedDateTimeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZonedDateTimeNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ZonedDateTimeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates jsonAttributeNode.value when dateControl changes (debounced)', fakeAsync(() => {
    const provided = mockJsonAttributeNode();
    provided.value = undefined;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ZonedDateTimeNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: provided },
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(ZonedDateTimeNodeComponent);
    const cmp = fix.componentInstance;
    fix.detectChanges();

    // Set a concrete Date and advance time past debounce
    const date = new Date(2023, 0, 5, 9, 10, 11);
    cmp.dateControl.setValue(date);
    tick(350);

    // Expect an ISO-like string; avoid timezone fragility by checking shape
    expect(typeof cmp.jsonAttributeNode.value).toBe('string');
    expect((cmp.jsonAttributeNode.value as string)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  }));
});
