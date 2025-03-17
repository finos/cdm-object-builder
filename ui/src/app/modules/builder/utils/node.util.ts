import { isEqual } from 'lodash-es';
import {
  JsonAttributeNode,
  ModelAttribute,
  RosettaBasicType,
} from '../models/builder.model';
import { isEnumType, isStructuredType } from './type-guards.util';

export function isAttributeExhausted(
  attr: ModelAttribute,
  children: JsonAttributeNode[]
): boolean {
  const upperBound = attr.cardinality.upperBound;

  if (attr.attributeOfChoice) {
    const matchingChoiceAttributes = children.filter(
      child => child.definition.attributeOfChoice == attr.attributeOfChoice
    );

    return matchingChoiceAttributes.length > 0;
  }

  if (!isInfiniteCardinality(attr)) {
    const matchingChildren = children.filter(child =>
      isEqual(child.definition, attr)
    );

    return matchingChildren.length >= parseInt(upperBound);
  }

  return false;
}

export function isInfiniteCardinality(attr: ModelAttribute): boolean {
  return attr.cardinality.upperBound === '*';
}

export function isMultiCardinality(attr: ModelAttribute): boolean {
  return (
    isInfiniteCardinality(attr) || parseInt(attr.cardinality.upperBound) > 1
  );
}

export function getCardinalityUpperBound(attr: ModelAttribute): number {
  return parseInt(attr.cardinality.upperBound);
}

const listBasedBasicTypes: RosettaBasicType[] = [
  RosettaBasicType.STRING,
  RosettaBasicType.NUMBER,
];

export function isListBasedBasicType(
  nodeOrAttribute: JsonAttributeNode | ModelAttribute
): boolean {
  const modelType =
    'definition' in nodeOrAttribute
      ? nodeOrAttribute.definition.type
      : nodeOrAttribute.type;

  if (isStructuredType(modelType)) {
    return false;
  }

  if (isEnumType(modelType)) {
    return true;
  }

  return listBasedBasicTypes.includes(modelType);
}
