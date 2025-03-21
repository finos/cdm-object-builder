import {
  EnumType,
  JsonAttributeNode,
  JsonNode,
  JsonRootNode,
  JsonValue,
  ModelType,
  RosettaBasicType,
  RosettaTypeCategory,
  StructuredType,
} from '../models/builder.model';

export function isBasicType(
  modelType: ModelType
): modelType is RosettaBasicType {
  return typeof modelType === 'string';
}

export function isEnumType(modelType: ModelType): modelType is EnumType {
  if (isBasicType(modelType)) {
    return false;
  }
  return modelType.typeCategory === RosettaTypeCategory.EnumType;
}

export function isStructuredType(
  modelType: ModelType
): modelType is StructuredType {
  if (isBasicType(modelType)) {
    return false;
  }
  return (
    modelType.typeCategory === RosettaTypeCategory.StructuredType ||
    modelType.typeCategory === RosettaTypeCategory.ChoiceType
  );
}

export function isJsonRootNode(node: JsonNode): node is JsonRootNode {
  return 'type' in node && !('definition' in node);
}

export function isJsonAttribute(node: JsonNode): node is JsonAttributeNode {
  return 'definition' in node && !('type' in node);
}

export function isStringArray(value: JsonValue | undefined): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.length === 0) {
    throw new Error('Can not determine type of empty array');
  }

  return typeof value[0] === 'string';
}

export function isNumberArray(value: JsonValue | undefined): value is number[] {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.length === 0) {
    throw new Error('Can not determine type of empty array');
  }

  return typeof value[0] === 'number';
}
