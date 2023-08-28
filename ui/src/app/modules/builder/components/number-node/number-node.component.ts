import { Component, Inject, OnInit } from '@angular/core';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

@Component({
  selector: 'app-number-node',
  templateUrl: './number-node.component.html',
  styleUrls: ['./number-node.component.scss'],
})
export class NumberNodeComponent implements OnInit {
  values: number[] = [];
  trackBy = (index: number) => index;

  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  ngOnInit(): void {
    if (!Array.isArray(this.jsonAttributeNode.value)) {
      const currentVal = this.jsonAttributeNode.value as number;
      this.jsonAttributeNode.value = [currentVal];
    }

    this.values = this.jsonAttributeNode.value as number[];
  }
}
