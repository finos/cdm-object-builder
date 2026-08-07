import { Component } from '@angular/core';
import { first, map, switchMap, tap } from 'rxjs';
import { BuilderApiService } from '../../services/builder-api.service';
import { JsonExportService } from '../../services/json-export.service';
import { NodeDatabaseService } from '../../services/node-database.service';

@Component({
    selector: 'app-viewer',
    templateUrl: './viewer.component.html',
    styleUrls: ['./viewer.component.scss'],
    standalone: false
})
export class ViewerComponent {
  cdmJson: any = {};

  constructor(
    private jsonExportService: JsonExportService,
    private nodeDatabaseService: NodeDatabaseService,
    private builderApiService: BuilderApiService
  ) {}

  refreshViewer() {
    this.nodeDatabaseService.nodeDataChange$
      .pipe(
        first(),
        map((nodeDataChange) => nodeDataChange.rootNode),
        switchMap((rootNode) =>
          this.builderApiService
            .getModelVersion()
            .pipe(
              first(),
              map((modelVersion) =>
                this.jsonExportService.export(rootNode, modelVersion)
              )
            )
        ),
        tap((cdmJson) => (this.cdmJson = cdmJson))
      )
      .subscribe();
  }
}
