import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  faCopy,
  faEllipsisVertical,
  faFileImport,
} from '@fortawesome/free-solid-svg-icons';
import { finalize, first } from 'rxjs';
import { JsonAttributeNode } from '../../models/builder.model';
import { FileImportService } from '../../services/file-import.service';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { isMultiCardinality } from '../../utils/node.util';

@Component({
  selector: 'app-structured-type-node',
  templateUrl: './structured-type-node.component.html',
  styleUrls: ['./structured-type-node.component.scss'],
})
export class StructuredTypeNodeComponent {
  constructor(
    @Inject(JSON_ATTRIBUTE_NODE_TOKEN)
    public jsonAttributeNode: JsonAttributeNode,
    private nodeDatabaseService: NodeDatabaseService,
    private fileImportService: FileImportService,
    private nodeSelectionService: NodeSelectionService
  ) {}

  inputFormControl = new FormControl();

  faEllipsisVertical = faEllipsisVertical;
  faCopy = faCopy;
  faFileImport = faFileImport;

  isNodeExhausted$ = this.nodeDatabaseService.isNodeExhausted(
    this.jsonAttributeNode
  );

  duplicate() {
    const newNode = this.nodeDatabaseService.duplicateSubTree(
      this.jsonAttributeNode
    );
    this.nodeSelectionService.selectAndScrollToNode(newNode);
  }

  isMultiCardinality = isMultiCardinality(this.jsonAttributeNode.definition);

  onImportFileChange(event: Event) {
    this.fileImportService
      .importFile(event, this.jsonAttributeNode)
      .pipe(
        first(),
        finalize(() => {
          this.inputFormControl.reset();
        })
      )
      .subscribe();
  }
}
