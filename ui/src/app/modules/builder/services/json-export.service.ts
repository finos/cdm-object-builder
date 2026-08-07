import { Injectable } from '@angular/core';
import { JsonAttributeNode, JsonRootNode } from '../models/builder.model';
import { isListBasedBasicType, isMultiCardinality } from '../utils/node.util';
import {
  RUNE_DATA_KEY,
  RUNE_MODEL_KEY,
  RUNE_TYPE_KEY,
  RUNE_VERSION_KEY,
  runeModelName,
  runeQualifiedTypeName,
} from '../utils/rune-serialisation.util';
import { isStructuredType } from '../utils/type-guards.util';

@Injectable({
  providedIn: 'root',
})
export class JsonExportService {
  constructor() {}

  /**
   * `modelVersion` is optional so that the export stays usable before the lazily
   * loaded model has resolved; when it is absent the `@version` key is left off
   * rather than emitted empty.
   */
  export(jsonRootNode: JsonRootNode, modelVersion?: string): any {
    const jsonObject: any = {
      [RUNE_MODEL_KEY]: runeModelName(jsonRootNode.type),
      [RUNE_TYPE_KEY]: runeQualifiedTypeName(jsonRootNode.type),
    };

    if (modelVersion) {
      jsonObject[RUNE_VERSION_KEY] = modelVersion;
    }

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
        this.isStructuredChoiceOption(jsonAttributeNode) &&
        jsonAttributeNode.children
      ) {
        this.buildChoiceOptionNode(jsonObject, jsonAttributeNode);
      } else if (
        isStructuredType(jsonAttributeNode.definition.type) &&
        jsonAttributeNode.children
      ) {
        this.buildIntermediateNode(
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
        return isMeta ? { [RUNE_DATA_KEY]: val } : val;
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
        ? { [RUNE_DATA_KEY]: jsonAttributeNode.value }
        : jsonAttributeNode.value;

      jsonObject[definitionName] = newValue;
    }
  }

  /**
   * A choice option the builder models as a named attribute (CollateralCriteria
   * has one attribute per option: AllCriteria, AssetType, IndexType, ...). Only
   * structured options are inlined here; the serialisation of a choice whose
   * selected option is an enum or a basic type is not covered by the CDM 7 sample
   * data, so those keep the option name as a key.
   */
  private isStructuredChoiceOption(jsonAttributeNode: JsonAttributeNode) {
    return (
      !!jsonAttributeNode.definition.attributeOfChoice &&
      isStructuredType(jsonAttributeNode.definition.type)
    );
  }

  /**
   * The Rune serialisation identifies the selected option of a choice with
   * `@type` and inlines that option's fields, rather than nesting them under a
   * key named after the option:
   *
   *   old: "collateralCriteria": { "AssetType": { "assetType": "Security" } }
   *   new: "collateralCriteria": { "@type": "cdm.base.staticdata.asset.common.AssetType",
   *                                "assetType": "Security" }
   */
  private buildChoiceOptionNode(
    jsonObject: any,
    jsonAttributeNode: JsonAttributeNode
  ) {
    const optionType = jsonAttributeNode.definition.type;
    if (!isStructuredType(optionType)) {
      throw Error('Choice options inlined with @type must be structured types');
    }

    jsonObject[RUNE_TYPE_KEY] = runeQualifiedTypeName(optionType);
    this.exportChildren(jsonAttributeNode.children!, jsonObject);
  }

  /**
   * Structured attributes carry no wrapper in the Rune serialisation, whether or
   * not they are annotated with metadata — any `@key`/`@ref` sits alongside the
   * attribute's own fields rather than around them.
   */
  private buildIntermediateNode(
    isArray: boolean,
    jsonObject: any,
    definitionName: string,
    jsonAttributeNode: JsonAttributeNode
  ) {
    if (!jsonAttributeNode.children) {
      throw Error('Intermediate nodes must have children');
    }
    const child = {};

    if (isArray) {
      jsonObject[definitionName].push(child);
    } else {
      jsonObject[definitionName] = child;
    }

    this.exportChildren(jsonAttributeNode.children, child);
  }
}
