import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';

import { DateNodeComponent } from './date-node.component';

describe('DateNodeComponent', () => {
  let component: DateNodeComponent;
  let fixture: ComponentFixture<DateNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DateNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onDateChange formats date to yyyy-MM-dd', () => {
    const event = { value: new Date(2023, 0, 5) } as MatDatepickerInputEvent<Date>;
    component.onDateChange(event);
    expect(component.jsonAttributeNode.value).toBe('2023-01-05' as any);
  });
});
