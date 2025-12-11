import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { JsonAttributeNode } from '../../models/builder.model';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';

@Component({
    selector: 'app-delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    standalone: false
})
export class DeleteComponent implements OnInit {
  @Input()
  public jsonAttributeNode!: JsonAttributeNode;

  faTrashCan = faTrashCan;

  constructor(
    private nodeDatabaseService: NodeDatabaseService,
    private dialog: MatDialog,
    private nodeSelectionService: NodeSelectionService
  ) {}

  delete() {
    const ref = this.dialog.open(DeleteDialogueComponent, {
      width: '250px',
      data: { name: this.jsonAttributeNode.definition.name },
    });
    ref.afterClosed().subscribe((result) => {
      if (result === 'ok') {
        this.nodeDatabaseService.deleteNode(this.jsonAttributeNode);
        this.nodeSelectionService.deselectNodes();
      }
    });
  }

  ngOnInit(): void {}
}

@Component({
    selector: 'app-delete-dialogue',
    template: `<div mat-dialog-content>
      <p>
        Are you sure you want to delete
        <span class="name">{{ data.name }}</span
        >?
      </p>
    </div>
    <div mat-dialog-actions align="center">
      <button mat-button [mat-dialog-close]="'ok'">Ok</button>
      <button mat-button cdkFocusInitial [mat-dialog-close]="'cancel'">
        Cancel
      </button>
    </div>`,
    styles: ['.name {font-weight: bold; color: var(--primary-color)}'],
    standalone: false
})
export class DeleteDialogueComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}
