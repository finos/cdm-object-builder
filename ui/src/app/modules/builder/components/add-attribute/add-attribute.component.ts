import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { de } from 'date-fns/locale';
import {
  BehaviorSubject,
  filter,
  first,
  map,
  Observable,
  ReplaySubject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  JsonAttributeNode,
  JsonNode,
  JsonValue,
  ModelAttribute,
  ModelType,
  RosettaBasicType,
} from '../../models/builder.model';
import { BuilderApiService } from '../../services/builder-api.service';
import { IdentityService } from '../../services/identity.service';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import { isAttributeExhausted } from '../../utils/node.util';
import {
  isJsonAttribute,
  isStructuredType,
} from '../../utils/type-guards.util';

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
})
export class AddAttributeComponent implements OnInit, OnDestroy {
  private _jsonNode!: JsonNode;
  private jsonNodeSubject$ = new BehaviorSubject<JsonNode | null>(null);
  private subscription: Subscription = new Subscription();

  availableAttributes = this.jsonNodeSubject$.pipe(
    filter((jsonNode): jsonNode is JsonNode => jsonNode !== null),
    switchMap(jsonNode => {
      return this.getAttributesForNode(jsonNode);
    })
  );

  hasAttributesToAdd = this.availableAttributes.pipe(
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
      value: this.getInitialJsonValue(definition),
    };

    const updatedNode = this.nodeDatabaseService.insertNode(
      this.jsonNode,
      newJsonAttributeNode
    );
    this.refreshNodeSubject();
    this.nodeSelectionService.selectAndScrollToNode(updatedNode);
  }

  private getInitialJsonValue(
    definition: ModelAttribute
  ): JsonValue | undefined {
    if (definition.type === RosettaBasicType.STRING) {
      return '';
    }

    return undefined;
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
