import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { JsonNode, ModelType } from '../models/builder.model';
import { isJsonRootNode, isStructuredType } from '../utils/type-guards.util';
import { JsonImportService } from './json-import.service';
import { NodeDatabaseService } from './node-database.service';

const incorrectTypeErrorMessage = (nodeType: ModelType) =>
  `Cannot import node of type ${nodeType} as it is not a structured type`;

const fileReadErrorMessage = 'Error reading file';

const noFileOnEventErrorMessage = 'No file found on event';

const jsonImportErrorMessage = (message: any) =>
  `JSON Import Error: ${message}`;

@Injectable({
  providedIn: 'root',
})
export class FileImportService {
  constructor(
    private jsonImportService: JsonImportService,
    private snackBar: MatSnackBar,
    private nodeDatabaseService: NodeDatabaseService
  ) {}

  importFile(event: Event, jsonNode: JsonNode): Observable<void> {
    const target = event.target as HTMLInputElement;

    return new Observable((subscriber) => {
      if (target.files && target.files.length) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          if (e.target) {
            const contents = JSON.parse(e.target.result as string);

            const isParentRootNode = isJsonRootNode(jsonNode);

            const nodeType = isParentRootNode
              ? jsonNode.type
              : jsonNode.definition.type;

            if (!isStructuredType(nodeType)) {
              throw Error(incorrectTypeErrorMessage(nodeType));
            }

            this.jsonImportService
              .import(contents, nodeType)
              .then((importedNode) => {
                if (isParentRootNode) {
                  jsonNode.children = importedNode.children || [];
                  this.nodeDatabaseService.updateAllNodes(jsonNode);
                } else {
                  this.nodeDatabaseService.overwriteNodeChildren(
                    jsonNode,
                    importedNode.children || []
                  );
                }

                subscriber.complete();
              })
              .catch((error) => {
                this.snackBar.open(
                  jsonImportErrorMessage(error.message),
                  'OK',
                  {
                    duration: 0,
                  }
                );
                subscriber.error(error.message);
              });
          }
        };

        reader.onerror = () => {
          const message = fileReadErrorMessage;
          this.snackBar.open(message, 'OK', { duration: 5000 });
          subscriber.error(message);
        };

        reader.readAsText(file);
      } else {
        subscriber.error(noFileOnEventErrorMessage);
      }
    });
  }
}
