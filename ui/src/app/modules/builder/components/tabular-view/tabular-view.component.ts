import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

interface GridDataItem {
  style: object;
  name: string;
  leaf: boolean;
  depth: number;
  columnIndex: number;
}

interface GridData {
  items: GridDataItem[];
  style: object;
}

const EXCLUDED_NODES = [
  'meta',
  'externalReference',
  'globalReference',
  'address',
];

@Component({
    selector: 'app-tabular-view',
    templateUrl: './tabular-view.component.html',
    styleUrls: ['./tabular-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TabularViewComponent implements OnInit {
  private _jsonStructure: any;
  private transposed = false;

  @Input()
  set cdmJson(jsonStructure: any) {
    if (jsonStructure !== undefined && jsonStructure !== null) {
      this.gridData = this.convertJsonStructureToGrid(jsonStructure);
    }
    this._jsonStructure = jsonStructure;
  }

  constructor() {}

  gridData!: GridData;

  public toggleTranspose() {
    this.transposed = !this.transposed;
    this.gridData = this.convertJsonStructureToGrid(this._jsonStructure);
  }

  private convertJsonStructureToGrid(jsonStructure: {}): GridData {
    const gridDepth = this.getGridDepth(1, jsonStructure);
    const items = this.createGridItemsForAny(gridDepth, 1, jsonStructure);

    return {
      items: items,
      style: this.getGridStyle(gridDepth, this.transposed),
    };
  }

  private getGridDepth(depth: number, data: any): number {
    if (!(data instanceof Object)) {
      return depth;
    }
    let currentMaxDepth = depth;
    for (const value of Object.values(data)) {
      const currentDepth = this.getGridDepth(depth + 1, value);
      if (currentDepth > currentMaxDepth) {
        currentMaxDepth = currentDepth;
      }
    }
    return currentMaxDepth;
  }

  private createGridItemsForAny(
    maxColumn: number,
    currentDepth: number,
    jsonStructure: any
  ): GridDataItem[] {
    if (!(jsonStructure instanceof Object)) {
      return [this.createLeafNode(jsonStructure, currentDepth, maxColumn)];
    }

    const gridDataItems: GridDataItem[] = [];

    for (const childJsonKey of Object.keys(jsonStructure)) {
      if (EXCLUDED_NODES.includes(childJsonKey)) {
        continue;
      }

      let childJsonStructure = jsonStructure[childJsonKey];

      if (Array.isArray(childJsonStructure)) {
        for (let i = 0; i < childJsonStructure.length; i++) {
          gridDataItems.push(
            ...this.createGridItems(
              maxColumn,
              currentDepth,
              childJsonStructure.length == 1
                ? childJsonKey
                : childJsonKey + ' ' + (i + 1),
              childJsonStructure[i]
            )
          );
        }
      } else {
        gridDataItems.push(
          ...this.createGridItems(
            maxColumn,
            currentDepth,
            childJsonKey,
            childJsonStructure
          )
        );
      }
    }

    return gridDataItems;
  }

  private createLeafNode(
    data: any,
    currentDepth: number,
    maxColumn: number
  ): GridDataItem {
    return {
      name: data,
      style: { ...this.getColSpanStyle(1), ...this.getRowSpanStyle(1) },
      leaf: true,
      depth: currentDepth,
      columnIndex: maxColumn,
    };
  }

  private createGridItems(
    maxColumn: number,
    currentDepth: number,
    jsonKey: string,
    jsonStructure: any
  ) {
    let childGridItems = this.createChildGridItems(
      maxColumn,
      currentDepth,
      jsonStructure
    );

    const xSpan =
      1 + this.directChildColumnDepthDiff(childGridItems, currentDepth);
    const ySpan = childGridItems.filter(c => c.leaf).length;
    let columnIndex = currentDepth;

    let gridDataItems = [
      this.createIntermediateNode(
        xSpan,
        ySpan,
        jsonKey,
        currentDepth,
        columnIndex
      ),
      ...childGridItems,
    ];
    return gridDataItems;
  }

  private createIntermediateNode(
    xSpan: number,
    ySpan: number,
    jsonKey: string,
    currentDepth: number,
    columnIndex: number
  ): GridDataItem {
    return {
      style: !this.transposed
        ? {
            ...this.getColSpanStyle(xSpan),
            ...this.getRowSpanStyle(ySpan),
          }
        : {
            ...this.getColSpanStyle(ySpan),
            ...this.getRowSpanStyle(xSpan),
          },
      name: jsonKey,
      leaf: false,
      depth: currentDepth,
      columnIndex: columnIndex,
    };
  }

  private directChildColumnDepthDiff(
    childGridItems: GridDataItem[],
    currentDepth: number
  ) {
    const directChildGridItems = childGridItems.filter(
      c => c.depth === currentDepth + 1
    );

    const directChildColumnDepthDiffs = directChildGridItems.map(
      c => c.columnIndex - c.depth
    );
    const directChildColumnDepthDiff = Math.max(...directChildColumnDepthDiffs);
    return directChildColumnDepthDiff;
  }

  private createChildGridItems(
    maxColumn: number,
    currentDepth: number,
    childJsonStructure: any
  ) {
    let childGridItems: GridDataItem[];

    if (childJsonStructure instanceof Object) {
      childGridItems = this.getGridItemsForObject(
        maxColumn,
        currentDepth + 1,
        childJsonStructure
      );
    } else {
      childGridItems = this.createGridItemsForAny(
        maxColumn,
        currentDepth + 1,
        childJsonStructure
      );
    }
    return childGridItems;
  }

  private getGridItemsForObject(
    maxColumn: number,
    currentDepth: number,
    childValue: object
  ) {
    const childGridItems: GridDataItem[] = [];
    Object.entries(childValue).forEach(([nestedKey, nestedValue]) => {
      childGridItems.push(
        ...this.createGridItemsForAny(maxColumn, currentDepth, {
          [nestedKey]: nestedValue,
        })
      );
    });
    return childGridItems;
  }

  getColSpanStyle(colSpan: number): {} {
    return { 'grid-column': `span ${colSpan} / auto` };
  }

  getRowSpanStyle(rowSpan: number): {} {
    return { 'grid-row': `span ${rowSpan} / auto` };
  }

  getGridStyle(gridDepth: number, transposed: boolean): {} {
    return !transposed
      ? {
          'grid-template-columns': `repeat(${gridDepth}, 1fr)`,
          'grid-auto-flow': 'row',
        }
      : {
          'grid-template-rows': `repeat(${gridDepth}, 1fr)`,
          'grid-auto-flow': 'column',
        };
  }

  ngOnInit(): void {}
}
