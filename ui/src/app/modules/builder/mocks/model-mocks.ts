import {
  JsonAttributeNode,
  RosettaBasicType,
  RosettaTypeCategory,
} from '../models/builder.model';

export function mockJsonAttributeNode(id = 1): JsonAttributeNode {
  return {
    id,
    definition: {
      name: 'name',
      type: RosettaBasicType.STRING,
      description: 'description',
      cardinality: { lowerBound: '1', upperBound: '*' },
    },
  };
}

export function mockStructuredJsonAttributeNode(
  id: number = 2,
  upperBound: string = '*'
): JsonAttributeNode {
  return {
    id,
    definition: {
      name: 'name',
      type: {
        typeCategory: RosettaTypeCategory.StructuredType,
        name: 'typeName',
        namespace: 'type namespace',
        description: 'type description',
      },
      description: 'description',
      cardinality: { lowerBound: '1', upperBound },
    },
  };
}
