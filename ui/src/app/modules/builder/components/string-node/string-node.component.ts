import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { JsonAttributeNode } from '../../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

@Component({
    selector: 'app-string-node',
    templateUrl: './string-node.component.html',
    styleUrls: ['./string-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StringNodeComponent implements OnInit {
  values: string[] = [];
  trackBy = (index: number) => index;

  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode
  ) {}

  ngOnInit(): void {
    if (!Array.isArray(this.jsonAttributeNode.value)) {
      const currentVal = this.jsonAttributeNode.value as string;
      this.jsonAttributeNode.value = [currentVal];
    }

    this.values = this.jsonAttributeNode.value as string[];
  }
}
