import { Component, Inject, OnInit } from '@angular/core';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

// TODO: need to handle validation errors when user puts in number instead of int
@Component({
    selector: 'app-int-node',
    templateUrl: './int-node.component.html',
    styleUrls: ['./int-node.component.scss'],
    standalone: false
})
export class IntNodeComponent implements OnInit {
  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  ngOnInit(): void {}
}
