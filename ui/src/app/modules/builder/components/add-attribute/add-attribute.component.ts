import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  BehaviorSubject,
  filter,
  first,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  JsonAttributeNode,
  JsonNode,
  ModelAttribute,
  StructuredType,
} from '../../models/builder.model';
import { BuilderApiService } from '../../services/builder-api.service';
import { IdentityService } from '../../services/identity.service';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import {
  getInitialJsonValue,
  getRequiredJsonAttributes,
  isAttributeExhausted,
} from '../../utils/node.util';
import {
  isJsonAttribute,
  isStructuredType,
} from '../../utils/type-guards.util';
import { isEqual } from 'lodash-es';

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
})
export class AddAttributeComponent implements OnInit, OnDestroy {
  private _jsonNode!: JsonNode;
  private jsonNodeSubject$ = new BehaviorSubject<JsonNode | null>(null);
  private subscription: Subscription = new Subscription();

  availableAttributes$ = this.jsonNodeSubject$.pipe(
    filter((jsonNode): jsonNode is JsonNode => jsonNode !== null),
    switchMap(jsonNode => {
      return this.getAttributesForNode(jsonNode);
    })
  );

  availableMandatoryAttributes$ = this.availableAttributes$.pipe(
    map(modelAttributes => {
      return this.getMandatoryAvailableAttributes(modelAttributes);
    })
  );

  hasAttributesToAdd = this.availableAttributes$.pipe(
    map(attributes => attributes?.length > 0)
  );

  @Input()
  set jsonNode(value: JsonNode) {
    this._jsonNode = value;
    this.jsonNodeSubject$.next(value);
  }

  get jsonNode() {
    return this._jsonNode;
  }

  faPlus = faPlus;

  constructor(
    private builderApiService: BuilderApiService,
    private nodeDatabaseService: NodeDatabaseService,
    private identityService: IdentityService,
    private nodeSelectionService: NodeSelectionService
  ) {}

  private getAttributesForNode(
    jsonNode: JsonNode
  ): Observable<ModelAttribute[]> {
    const type = isJsonAttribute(jsonNode)
      ? jsonNode.definition.type
      : jsonNode.type;

    if (!isStructuredType(type)) {
      throw Error("Can't get attributes for non-structured type");
    }

    return this.builderApiService
      .getAttributesForType(type)
      .pipe(
        map(attributes => this.removeExhaustedAttributes(attributes, jsonNode))
      );
  }

  addAttribute(definition: ModelAttribute) {
    const newJsonAttributeNode: JsonAttributeNode = {
      definition,
      id: this.identityService.getId(),
      value: getInitialJsonValue(definition),
    };

    const updatedNode = this.nodeDatabaseService.insertNode(
      this.jsonNode,
      newJsonAttributeNode
    );
    this.refreshNodeSubject();
    this.nodeSelectionService.selectAndScrollToNode(updatedNode);
  }

  private addStructuredType(definition: ModelAttribute, type: StructuredType) {
    this.builderApiService
      .getAttributesForType(type)
      .pipe(
        first(),
        tap(attributes => {
          const newJsonAttributeNode: JsonAttributeNode = {
            definition,
            id: this.identityService.getId(),
            value: getInitialJsonValue(definition),
            children: getRequiredJsonAttributes(
              attributes,
              this.identityService
            ),
          };

          const updatedNode = this.nodeDatabaseService.insertNode(
            this.jsonNode,
            newJsonAttributeNode
          );
          this.refreshNodeSubject();
          this.nodeSelectionService.selectAndScrollToNode(updatedNode);
        })
      )
      .subscribe();
  }

  private getMandatoryAvailableAttributes(
    attributes: ModelAttribute[]
  ): ModelAttribute[] {
    return attributes
      .filter(attribute => {
        return parseInt(attribute.cardinality.lowerBound) > 0;
      })
      .filter(attribute => {
        const matchingChildren = (this.jsonNode.children ?? []).filter(child =>
          isEqual(child.definition, attribute)
        );
        return (
          matchingChildren.length < parseInt(attribute.cardinality.lowerBound)
        );
      });
  }

  private removeExhaustedAttributes(
    attributes: ModelAttribute[],
    jsonNode: JsonNode
  ): ModelAttribute[] {
    if (jsonNode.children === undefined) {
      return attributes;
    }

    return attributes.filter(
      attr => !isAttributeExhausted(attr, jsonNode.children!)
    );
  }

  private refreshNodeSubject() {
    this.jsonNodeSubject$.next(this.jsonNodeSubject$.value);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.nodeDatabaseService.nodeDataChange$.subscribe(() => {
        this.refreshNodeSubject();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
