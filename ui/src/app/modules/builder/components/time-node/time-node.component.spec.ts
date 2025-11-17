import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { TimeNodeComponent } from './time-node.component';

describe('TimeNodeComponent', () => {
  let component: TimeNodeComponent;
  let fixture: ComponentFixture<TimeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('timeValue should reflect valid time formats and ignore invalid ones', () => {
    // Invalid
    component.jsonAttributeNode.value = 'not-a-time' as any;
    expect(component.timeValue).toBeUndefined();

    // HH:mm
    component.jsonAttributeNode.value = '12:34' as any;
    expect(component.timeValue).toBe('12:34');

    // HH:mm:ss
    component.jsonAttributeNode.value = '23:59:58' as any;
    expect(component.timeValue).toBe('23:59:58');
  });

  it('onTimeChange should normalize HH:mm to HH:mm:ss and set value as-is for HH:mm:ss', () => {
    // HH:mm -> HH:mm:ss
    const event1 = { target: { value: '09:05' } } as unknown as Event;
    component.onTimeChange(event1);
    expect(component.jsonAttributeNode.value).toBe('09:05:00');

    // HH:mm:ss remains unchanged
    const event2 = { target: { value: '09:05:07' } } as unknown as Event;
    component.onTimeChange(event2);
    expect(component.jsonAttributeNode.value).toBe('09:05:07');
  });
});
