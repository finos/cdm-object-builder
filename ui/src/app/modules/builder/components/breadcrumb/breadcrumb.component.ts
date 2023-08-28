import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { finalize, first, map, Observable, of, switchMap, tap } from 'rxjs';
import { JsonAttributeNode, JsonNode } from '../../models/builder.model';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import { isJsonAttribute } from '../../utils/type-guards.util';
import { BuilderComponent } from '../builder/builder.component';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs$: Observable<JsonNode[]> = this.nodeSelectionService
    .getSelectedNode()
    .pipe(
      switchMap((node) => {
        if (node) {
          return of(this.nodeDatabaseService.getLineage(node));
        }
        return this.nodeDatabaseService.nodeDataChange$.pipe(
          map((changeEvent) => [changeEvent.rootNode])
        );
      })
    );

  breadcrumbClick(node: JsonAttributeNode) {
    this.breadcrumbs$
      .pipe(
        first(),
        tap((breadcrumbs) => {
          breadcrumbs.forEach((breadcrumb) => {
            if (isJsonAttribute(breadcrumb)) {
              this.builderComponent.expandNode(breadcrumb);
            }
          });
        }),
        finalize(() => {
          this.nodeSelectionService.selectAndScrollToNode(node);
        })
      )
      .subscribe();
  }

  constructor(
    private nodeDatabaseService: NodeDatabaseService,
    private nodeSelectionService: NodeSelectionService,
    private builderComponent: BuilderComponent
  ) {}

  ngOnInit(): void {}
}
