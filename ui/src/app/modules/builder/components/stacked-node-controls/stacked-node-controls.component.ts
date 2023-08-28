import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { faTrashCan, faPlus } from '@fortawesome/free-solid-svg-icons';
import { JsonAttributeNode } from '../../models/builder.model';
import { NodeDatabaseService } from '../../services/node-database.service';
import { isMultiCardinality } from '../../utils/node.util';

@Component({
  selector: 'app-stacked-node-controls',
  templateUrl: './stacked-node-controls.component.html',
  styleUrls: ['./stacked-node-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedNodeControlsComponent implements OnInit {
  @Input()
  jsonAttributeNode!: JsonAttributeNode;
  @Input()
  currentNodeIndex!: number;
  @Input()
  siblingCount!: number;

  faTrashCan = faTrashCan;
  faPlus = faPlus;
  isMultiCardinality = false;

  constructor(private nodeDatabaseService: NodeDatabaseService) {}

  deleteValue(index: number) {
    this.nodeDatabaseService.removeValueFromExistingNode(
      this.jsonAttributeNode,
      index
    );
  }

  addValue() {
    this.nodeDatabaseService.addValueToExistingNode(this.jsonAttributeNode, '');
  }

  ngOnInit(): void {
    this.isMultiCardinality =
      this.jsonAttributeNode &&
      isMultiCardinality(this.jsonAttributeNode.definition);
  }
}
