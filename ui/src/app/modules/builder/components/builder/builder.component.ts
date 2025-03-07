import { FlatTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import {
  faChevronDown,
  faChevronRight,
  faEraser,
  faFileExport,
  faFileImport,
} from '@fortawesome/free-solid-svg-icons';
import {
  finalize,
  first,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  JsonAttributeNode,
  JsonRootNode,
  StructuredType,
} from '../../models/builder.model';
import { BuilderApiService } from '../../services/builder-api.service';
import { FileImportService } from '../../services/file-import.service';
import { JsonExportService } from '../../services/json-export.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import { isStructuredType } from '../../utils/type-guards.util';

interface FlatJsonNode {
  expandable: boolean;
  jsonNode: JsonAttributeNode;
  level: number;
}

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  inputFormControl = new FormControl();

  jsonRootNode$ = this.nodeDatabaseService.nodeDataChange$.pipe(
    map(event => event.rootNode)
  );

  faFileImport = faFileImport;
  faFileExport = faFileExport;
  faEraser = faEraser;

  private _selectedRootType!: StructuredType;

  set selectedRootType(value: StructuredType) {
    this._selectedRootType = value;

    const storedNode = this.localStorage.getItem<JsonRootNode>(
      `rootNode:${value.name}`
    );

    const rootNode = storedNode
      ? storedNode
      : {
          type: this.selectedRootType,
          children: [],
        };

    this.nodeDatabaseService.updateAllNodes(rootNode);
    this.nodeSelectionService.deselectNodes();
  }

  get selectedRootType(): StructuredType {
    return this._selectedRootType;
  }

  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;

  isStructuredType = isStructuredType;

  treeControl = new FlatTreeControl<FlatJsonNode, number>(
    node => node.level,
    node => node.expandable,
    { trackBy: node => node.jsonNode.id }
  );

  private _transformer = (jsonNode: JsonAttributeNode, level: number) => {
    return {
      expandable: !!jsonNode.children && jsonNode.children.length > 0,
      jsonNode,
      level: level,
    };
  };

  treeFlattener = new MatTreeFlattener<JsonAttributeNode, FlatJsonNode, number>(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  rootTypes: Observable<StructuredType[]> =
    this.builderApiService.getRootTypes();

  hasChild = (_: number, node: FlatJsonNode) => node.expandable;

  ngOnInit(): void {
    this.subscription.add(
      this.nodeDatabaseService.nodeDataChange$.subscribe(
        nodeDataChangeEvent => {
          this.dataSource.data = nodeDataChangeEvent.rootNode.children;
          if (nodeDataChangeEvent.nodeToExpand) {
            this.expandNode(nodeDataChangeEvent.nodeToExpand);
          }

          this.localStorage.setItem<JsonRootNode>(
            `rootNode:${nodeDataChangeEvent.rootNode.type.name}`,
            nodeDataChangeEvent.rootNode
          );
        }
      )
    );

    this.rootTypes
      .pipe(
        first(),
        tap(rootTypes => {
          //TODO - parametise the default model root type and use it rather then take the first in the list
          this.selectedRootType = rootTypes[0];
        })
      )
      .subscribe();
  }

  onImportFileChange(event: Event) {
    this.jsonRootNode$
      .pipe(
        first(),
        switchMap(jsonRootNode =>
          this.fileImportService.importFile(event, jsonRootNode)
        ),
        finalize(() => {
          this.inputFormControl.reset();
          this.nodeSelectionService.deselectNodes();
        })
      )
      .subscribe();
  }

  clear() {
    this.nodeDatabaseService.updateAllNodes({
      type: this.selectedRootType,
      children: [],
    });
    this.nodeSelectionService.deselectNodes();
  }

  export() {
    this.jsonRootNode$
      .pipe(
        first(),
        tap(jsonRootNode => {
          const jsonContents = this.jsonExportService.export(jsonRootNode);
          const blob = new Blob([JSON.stringify(jsonContents, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'export.json';
          link.click();
        })
      )
      .subscribe();
  }

  expandNode(node: JsonAttributeNode) {
    const flatNode = this.treeControl.dataNodes.find(
      flatNode => flatNode.jsonNode.id === node.id
    );
    if (flatNode) {
      this.treeControl.expand(flatNode);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  constructor(
    private nodeDatabaseService: NodeDatabaseService,
    private builderApiService: BuilderApiService,
    private fileImportService: FileImportService,
    private jsonExportService: JsonExportService,
    private localStorage: LocalStorageService,
    private nodeSelectionService: NodeSelectionService
  ) {}
}
