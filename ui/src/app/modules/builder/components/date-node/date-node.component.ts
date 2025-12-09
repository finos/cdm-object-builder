import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { format } from 'date-fns';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

export const MY_FORMATS = {
  parse: {
    dateInput: 'yyyy-MM-dd',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'yyyy-MM-dd',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
    selector: 'app-date-node',
    templateUrl: './date-node.component.html',
    styleUrls: ['./date-node.component.scss'],
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
    standalone: false
})
export class DateNodeComponent implements OnInit {
  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value !== null) {
      const date = event.value;
      this.jsonAttributeNode.value = format(date, 'yyyy-MM-dd');
    }
  }

  ngOnInit(): void {}
}
