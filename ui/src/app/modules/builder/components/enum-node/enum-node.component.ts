import { Component, Inject, OnInit } from '@angular/core';
import { EnumType, JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

@Component({
    selector: 'app-enum-node',
    templateUrl: './enum-node.component.html',
    styleUrls: ['./enum-node.component.scss'],
    standalone: false
})
export class EnumNodeComponent implements OnInit {
  values: string[] = [];
  trackBy = (index: number) => index;

  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  enumType = this.jsonAttributeNode.definition.type as EnumType;

  ngOnInit(): void {
    if (!Array.isArray(this.jsonAttributeNode.value)) {
      const currentVal = this.jsonAttributeNode.value as string;
      this.jsonAttributeNode.value = [currentVal];
    }

    this.values = this.jsonAttributeNode.value as string[];
  }
}
