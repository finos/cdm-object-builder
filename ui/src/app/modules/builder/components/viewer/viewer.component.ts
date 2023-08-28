import { Component } from '@angular/core';
import { first, map, tap } from 'rxjs';
import { JsonExportService } from '../../services/json-export.service';
import { NodeDatabaseService } from '../../services/node-database.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent {
  cdmJson: any = {};

  constructor(
    private jsonExportService: JsonExportService,
    private nodeDatabaseService: NodeDatabaseService
  ) {}

  refreshViewer() {
    this.nodeDatabaseService.nodeDataChange$
      .pipe(
        first(),
        map((nodeDataChange) => nodeDataChange.rootNode),
        tap((rootNode) => {
          this.cdmJson = this.jsonExportService.export(rootNode);
        })
      )
      .subscribe();
  }
}
