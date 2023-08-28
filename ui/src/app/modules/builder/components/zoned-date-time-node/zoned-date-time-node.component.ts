import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { formatISO } from 'date-fns';
import { debounceTime, filter, Subscription, tap } from 'rxjs';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

export const MY_FORMATS = {
  parse: {
    dateInput: "yyyy-MM-dd'T'hh:mm:ssz",
  },
  display: {
    dateInput: "yyyy-MM-dd'T'hh:mm:ssz",
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: "yyyy-MM-dd'T'hh:mm:ssz",
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

// TODO: this should use a real date time picker and format the date nicely for the user.
@Component({
  selector: 'app-zoned-date-time-node',
  templateUrl: './zoned-date-time-node.component.html',
  styleUrls: ['./zoned-date-time-node.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class ZonedDateTimeNodeComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode,
    private cdr: ChangeDetectorRef
  ) {}

  private subscription = new Subscription();
  dateControl = new FormControl();

  ngOnInit(): void {
    this.dateControl.setValue(this.jsonAttributeNode.value);

    this.subscription.add(
      this.dateControl.valueChanges
        .pipe(
          filter((value) => !!value),
          debounceTime(300),
          tap((value) => {
            this.jsonAttributeNode.value = formatISO(value);
            this.cdr.markForCheck();
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
