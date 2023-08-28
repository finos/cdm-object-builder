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
import { isJsonRootNode, isStructuredType } from '../utils/type-guards.util';
import { BuilderApiService } from './builder-api.service';
import { IdentityService } from './identity.service';

const EXCLUDED_FIELDS = [
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
  ) { }

  async import(sourceJson: any, nodeType: StructuredType): Promise<JsonNode> {
    const importedJson: JsonNode = {
      type: nodeType,
      children: [],
    };

    await this.generateChildrenForNode(importedJson, sourceJson);

    return importedJson;
  }

  private async generateChildrenForNode(parentNode: JsonNode, sourceJson: any) {
    const sourceJsonAttributes = this.getJsonAttributesFromSource(sourceJson);

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

    for (const [attributeName, attributeValue] of sourceJsonAttributes) {
      const modelAttribute = attributesForTypes.find(
        (attr) => attr.name === attributeName
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
          throw Error(`Attribute [${modelAttribute.name}] has multiple values when only one is expected.`);
        }
        attributeValues.push(...attributeValue);
      }
      else {
        attributeValues.push(attributeValue);
      }
    }

    if (isListBasedBasicType(modelAttribute)) {
      const newValues = attributeValues.map((val) =>
        modelAttribute.metaField ? val.value : val
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
          value: modelAttribute.metaField ? val.value : val,
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

  //TODO: expanding 'value' fields is not a great solution, it could blow up if we have a genuine field called 'value', need to work out a better way to do this
  private getJsonAttributesFromSource(json: any): [string, any][] {
    return Object.keys(json)
      .filter((key) => !EXCLUDED_FIELDS.includes(key))
      .flatMap((key) =>
        key !== 'value'
          ? [[key, json[key]]]
          : this.getJsonAttributesFromSource(json[key])
      );
  }
}
