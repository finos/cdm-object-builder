import { Injectable } from '@angular/core';
import { JsonAttributeNode, JsonRootNode } from '../models/builder.model';
import { isListBasedBasicType, isMultiCardinality } from '../utils/node.util';
import { isStructuredType } from '../utils/type-guards.util';

@Injectable({
  providedIn: 'root',
})
export class JsonExportService {
  constructor() {}

  export(jsonRootNode: JsonRootNode): any {
    const jsonObject = {};
    this.exportChildren(jsonRootNode.children, jsonObject);
    return jsonObject;
  }

  private exportChildren(
    jsonAttributeNodes: JsonAttributeNode[],
    jsonObject: any
  ) {
    jsonAttributeNodes.forEach((jsonAttributeNode) => {
      const definitionName = jsonAttributeNode.definition.name;
      const isMeta = jsonAttributeNode.definition.metaField || false;
      let isArray = false;

      if (isMultiCardinality(jsonAttributeNode.definition)) {
        if (!jsonObject[definitionName]) {
          jsonObject[definitionName] = [];
        }
        isArray = true;
      }

      if (
        isStructuredType(jsonAttributeNode.definition.type) &&
        jsonAttributeNode.children
      ) {
        this.buildIntermediateNode(
          isMeta,
          isArray,
          jsonObject,
          definitionName,
          jsonAttributeNode
        );
      } else {
        this.buildLeafNode(
          isMeta,
          jsonAttributeNode,
          jsonObject,
          definitionName
        );
      }
    });
  }

  private buildLeafNode(
    isMeta: boolean,
    jsonAttributeNode: JsonAttributeNode,
    jsonObject: any,
    definitionName: string
  ) {
    if (
      isListBasedBasicType(jsonAttributeNode) &&
      Array.isArray(jsonAttributeNode.value)
    ) {
      const newValues = jsonAttributeNode.value.map((val) => {
        return isMeta ? { value: val } : val;
      });

      const fieldIsMultiCardinality = isMultiCardinality(
        jsonAttributeNode.definition
      );

      if (!fieldIsMultiCardinality && newValues.length > 1) {
        throw Error('Single cardinality field has multiple values');
      }

      jsonObject[definitionName] = fieldIsMultiCardinality
        ? newValues
        : newValues[0];
    } else {
      const newValue = isMeta
        ? { value: jsonAttributeNode.value }
        : jsonAttributeNode.value;

      jsonObject[definitionName] = newValue;
    }
  }

  private buildIntermediateNode(
    isMeta: boolean,
    isArray: boolean,
    jsonObject: any,
    definitionName: string,
    jsonAttributeNode: JsonAttributeNode
  ) {
    if (!jsonAttributeNode.children) {
      throw Error('Intermediate nodes must have children');
    }
    const child = isMeta ? { value: {} } : {};

    if (isArray) {
      jsonObject[definitionName].push(child);
    } else {
      jsonObject[definitionName] = child;
    }

    this.exportChildren(
      jsonAttributeNode.children,
      isMeta ? child.value : child
    );
  }
}
