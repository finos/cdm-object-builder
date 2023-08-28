export enum RosettaBasicType {
  STRING = 'string',
  INT = 'int',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  TIME = 'time',
  DATE = 'date',
  ZONED_DATE_TIME = 'zonedDateTime',
}

export enum RosettaTypeCategory {
  EnumType = 'EnumType',
  StructuredType = 'StructuredType',
}

interface RosettaType {
  typeCategory: RosettaTypeCategory;
}
export interface EnumType extends RosettaType {
  name: string;
  values: EnumTypeValue[];
}

export interface EnumTypeValue {
  name: string;
  displayName: string;
  description?: string;
}
export interface StructuredType extends RosettaType {
  name: string;
  namespace: string;
  description?: string;
}

export type ModelType = RosettaBasicType | EnumType | StructuredType;

export interface ModelAttribute {
  name: string;
  type: ModelType;
  description?: string;
  cardinality: Cardinality;
  metaField?: boolean;
}

export interface Cardinality {
  upperBound: string;
  lowerBound: string;
}

export interface JsonRootNode {
  type: StructuredType;
  children: JsonAttributeNode[];
}
export interface JsonAttributeNode {
  id: number;
  definition: ModelAttribute;
  children?: JsonAttributeNode[];
  value?: JsonValue;
}

export type JsonNode = JsonRootNode | JsonAttributeNode;

export type JsonValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];
