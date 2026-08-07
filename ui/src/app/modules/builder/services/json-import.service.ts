import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  JsonAttributeNode,
  JsonNode,
  JsonRootNode,
  ModelAttribute,
  StructuredType,
} from '../models/builder.model';
import { isListBasedBasicType } from '../utils/node.util';
import {
  LEGACY_VALUE_KEY,
  RUNE_DATA_KEY,
  RUNE_TYPE_KEY,
  isRuneMetaKey,
  runeQualifiedTypeName,
  unwrapRuneValue,
} from '../utils/rune-serialisation.util';
import {
  isChoiceType,
  isJsonAttribute,
  isJsonRootNode,
  isStructuredType,
} from '../utils/type-guards.util';
import { BuilderApiService } from './builder-api.service';
import { IdentityService } from './identity.service';

/**
 * Metadata keys of the pre-CDM-7 serialisation. Rune metadata is now `@`-prefixed
 * and handled by {@link isRuneMetaKey}, but these are still skipped so that
 * previously exported documents remain importable. `address` is also a genuine
 * CDM attribute, which is why these only apply to metadata-annotated nodes.
 */
const LEGACY_EXCLUDED_FIELDS = [
  'meta',
  'externalReference',
  'globalReference',
  'address',
];

@Injectable({
  providedIn: 'root',
})
export class JsonImportService {
  constructor(
    private builderApiService: BuilderApiService,
    private identityService: IdentityService
  ) {}

  async import(sourceJson: any, nodeType: StructuredType): Promise<JsonNode> {
    const importedJson: JsonNode = {
      type: nodeType,
      children: [],
    };

    await this.generateChildrenForNode(importedJson, sourceJson);

    return importedJson;
  }

  private async generateChildrenForNode(parentNode: JsonNode, sourceJson: any) {
    const sourceJsonAttributes = this.getJsonAttributesFromSource(
      sourceJson,
      parentNode
    );

    const parentNodeType = isJsonRootNode(parentNode)
      ? parentNode.type
      : parentNode.definition.type;

    if (!isStructuredType(parentNodeType)) {
      throw Error(
        'Parent node is not a structured type, you can only recurse down structured types'
      );
    }

    const attributesForTypes = await firstValueFrom(
      this.builderApiService.getAttributesForType(parentNodeType)
    );

    // Without `@type` the document is using the pre-CDM-7 form, where the option
    // is a key named after it and so resolves through the normal attribute lookup.
    if (isChoiceType(parentNodeType) && sourceJson?.[RUNE_TYPE_KEY]) {
      await this.generateChildForChoiceOption(
        parentNode,
        parentNodeType,
        sourceJson,
        attributesForTypes
      );
      return;
    }

    for (const [attributeName, attributeValue] of sourceJsonAttributes) {
      const modelAttribute = attributesForTypes.find(
        attr => attr.name === attributeName
      );

      if (!modelAttribute) {
        throw Error(
          `Could not find attribute ${JSON.stringify(
            attributeName
          )} in type ${JSON.stringify(parentNodeType)}`
        );
      }

      if (isStructuredType(modelAttribute.type)) {
        await this.generateChildForStructuredNode(
          modelAttribute,
          attributeValue,
          parentNode
        );
      } else {
        this.generateChildForUnstructuredNode(
          modelAttribute,
          attributeValue,
          parentNode
        );
      }
    }
  }

  /**
   * A choice value names its selected option with `@type` and inlines that
   * option's fields, so the option has to be resolved before the remaining keys
   * can be matched against a type's attributes. The builder models each option as
   * a named attribute of the choice, which is the node inserted here.
   */
  private async generateChildForChoiceOption(
    parentNode: JsonNode,
    parentNodeType: StructuredType,
    sourceJson: any,
    choiceOptions: ModelAttribute[]
  ) {
    const qualifiedTypeName = sourceJson[RUNE_TYPE_KEY];

    const selectedOption = choiceOptions.find(
      option =>
        isStructuredType(option.type) &&
        runeQualifiedTypeName(option.type) === qualifiedTypeName
    );

    if (!selectedOption) {
      throw Error(
        `Could not find option ${JSON.stringify(
          qualifiedTypeName
        )} in choice type ${parentNodeType.namespace}.${parentNodeType.name}`
      );
    }

    const optionNode: JsonAttributeNode = {
      definition: selectedOption,
      id: this.identityService.getId(),
    };

    await this.generateChildrenForNode(optionNode, sourceJson);

    this.addChildToParent(parentNode, optionNode);
  }

  private generateChildForUnstructuredNode(
    modelAttribute: ModelAttribute,
    attributeValue: any,
    parentNode: JsonNode
  ) {
    const newJsonAttributes: JsonAttributeNode[] = [];
    const attributeValues = [];

    if (
      this.isCardinalityUpperBoundMultiple(
        modelAttribute.cardinality.upperBound
      )
    ) {
      attributeValues.push(...attributeValue);
    } else {
      if (Array.isArray(attributeValue)) {
        if (attributeValue.length !== 1) {
          throw Error(
            `Attribute [${modelAttribute.name}] has multiple values when only one is expected.`
          );
        }
        attributeValues.push(...attributeValue);
      } else {
        attributeValues.push(attributeValue);
      }
    }

    if (isListBasedBasicType(modelAttribute)) {
      const newValues = attributeValues.map(val =>
        modelAttribute.metaField ? unwrapRuneValue(val) : val
      );

      const newJsonAttribute: JsonAttributeNode = {
        definition: modelAttribute,
        value: newValues.length === 1 ? newValues[0] : newValues,
        id: this.identityService.getId(),
      };
      newJsonAttributes.push(newJsonAttribute);
    } else {
      for (const val of attributeValues) {
        const newJsonAttribute: JsonAttributeNode = {
          definition: modelAttribute,
          value: modelAttribute.metaField ? unwrapRuneValue(val) : val,
          id: this.identityService.getId(),
        };
        newJsonAttributes.push(newJsonAttribute);
      }
    }
    this.addChildToParent(parentNode, newJsonAttributes);
  }

  private async generateChildForStructuredNode(
    modelAttribute: ModelAttribute,
    attributeValue: any,
    parentNode: JsonNode
  ) {
    const attributeValueArray = this.isCardinalityUpperBoundMultiple(
      modelAttribute.cardinality.upperBound
    )
      ? attributeValue
      : [attributeValue];
    for (const attributeArrayElement of attributeValueArray) {
      const newJsonAttribute: JsonAttributeNode = {
        definition: modelAttribute,
        id: this.identityService.getId(),
      };

      await this.generateChildrenForNode(
        newJsonAttribute,
        attributeArrayElement
      );

      this.addChildToParent(parentNode, newJsonAttribute);
    }
  }

  private addChildToParent(
    parentNode: JsonRootNode | JsonAttributeNode,
    newJsonAttribute: JsonAttributeNode | JsonAttributeNode[]
  ) {
    if (!parentNode.children) {
      parentNode.children = [];
    }

    const newJsonAttributeNodes = Array.isArray(newJsonAttribute)
      ? newJsonAttribute
      : [newJsonAttribute];

    parentNode.children.push(...newJsonAttributeNodes);
  }

  private isCardinalityUpperBoundMultiple(upperBound: string): boolean {
    if (upperBound === '*') {
      return true;
    }

    return parseInt(upperBound) > 1;
  }

  private getJsonAttributesFromSource(
    json: any,
    jsonNode: JsonNode
  ): [string, any][] {
    return Object.keys(json)
      .filter(key => this.preserveJsonField(key, jsonNode))
      .flatMap(key =>
        this.expandValueNode(key, jsonNode)
          ? this.getJsonAttributesFromSource(json[key], jsonNode)
          : [[key, json[key]]]
      );
  }

  private preserveJsonField(currentKey: string, jsonNode: JsonNode): boolean {
    // `@data` carries the value and is unwrapped by expandValueNode; every other
    // Rune metadata key (`@scheme`, `@key`, `@ref`, and the envelope keys
    // `@model`/`@type`/`@version`) describes the document rather than the model.
    if (isRuneMetaKey(currentKey)) {
      return currentKey === RUNE_DATA_KEY;
    }
    if (currentKey === 'meta') {
      return false;
    }
    const isMetaField = isJsonAttribute(jsonNode)
      ? !!jsonNode.definition.metaField
      : false;
    const isReservedName = LEGACY_EXCLUDED_FIELDS.includes(currentKey);

    return !isReservedName || !isMetaField;
  }

  private expandValueNode(currentKey: string, jsonNode: JsonNode): boolean {
    if (!isJsonAttribute(jsonNode)) {
      return false;
    }
    const isMetaField = !!jsonNode.definition.metaField;
    return (
      (currentKey === RUNE_DATA_KEY || currentKey === LEGACY_VALUE_KEY) &&
      isMetaField
    );
  }
}
