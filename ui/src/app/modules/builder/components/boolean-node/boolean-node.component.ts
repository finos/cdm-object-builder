import { Component, Inject, OnInit } from '@angular/core';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

@Component({
  selector: 'app-boolean-node',
  templateUrl: './boolean-node.component.html',
  styleUrls: ['./boolean-node.component.scss'],
})
export class BooleanNodeComponent implements OnInit {
  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  ngOnInit(): void {}
}
