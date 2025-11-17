import { Component, Inject, OnInit } from '@angular/core';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

@Component({
  selector: 'app-time-node',
  templateUrl: './time-node.component.html',
  styleUrls: ['./time-node.component.scss'],
})
export class TimeNodeComponent implements OnInit {
  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  // Ensure the input displays a valid time value (HH:mm or HH:mm:ss)
  get timeValue(): string | undefined {
    const v = this.jsonAttributeNode.value as string | undefined;
    if (!v) return undefined;
    // Accept both HH:mm and HH:mm:ss; if only HH:mm provided, return as-is
    const hhmm = /^\d{2}:\d{2}$/;
    const hhmmss = /^\d{2}:\d{2}:\d{2}$/;
    if (hhmm.test(v) || hhmmss.test(v)) {
      return v;
    }
    // Fallback: try to parse and normalize, otherwise undefined
    return undefined;
  }

  onTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value; // native time input returns HH:mm or HH:mm:ss depending on step
    if (value) {
      // Normalize to HH:mm:ss for consistency when seconds are omitted
      if (/^\d{2}:\d{2}$/.test(value)) {
        value = `${value}:00`;
      }
      this.jsonAttributeNode.value = value;
    }
  }

  ngOnInit(): void {}
}
