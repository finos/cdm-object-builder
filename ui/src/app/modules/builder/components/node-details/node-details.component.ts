import { Component, Input, OnInit } from '@angular/core';
import { JsonAttributeNode, ModelType } from '../../models/builder.model';
import {
  isBasicType,
  isEnumType,
  isStructuredType,
} from '../../utils/type-guards.util';

@Component({
    selector: 'app-node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.scss'],
    standalone: false
})
export class NodeDetailsComponent implements OnInit {
  private _jsonAttributeNode!: JsonAttributeNode;

  @Input()
  set jsonAttributeNode(value: JsonAttributeNode) {
    if (value) {
      this._jsonAttributeNode = value;
      this.typeName = this.getTypeName(value.definition.type);
    }
  }

  @Input()
  displayDescription = false;

  @Input()
  compactView = false;

  get jsonAttributeNode() {
    return this._jsonAttributeNode;
  }

  typeName!: string;

  constructor() {}

  private getTypeName(type: ModelType): string {
    if (isBasicType(type)) {
      return type;
    }

    if (isEnumType(type)) {
      return type.name;
    }

    if (isStructuredType(type)) {
      return type.name;
    }

    throw Error(`No matching types found for ${type}`);
  }

  ngOnInit(): void {}
}
