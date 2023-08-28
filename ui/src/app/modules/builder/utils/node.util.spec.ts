import { mockStructuredJsonAttributeNode } from '../mocks/model-mocks';
import {
  isAttributeExhausted,
  isInfiniteCardinality,
  isMultiCardinality,
} from './node.util';

describe('NodeUtil', () => {
  describe('isAttributeExhausted', () => {
    it('should always be false for infinite cardinality attributes', () => {
      const node1 = mockStructuredJsonAttributeNode(1, '*');
      const node2 = mockStructuredJsonAttributeNode(2, '*');
      const node3 = mockStructuredJsonAttributeNode(3, '*');

      const result = isAttributeExhausted(node1.definition, [
        node1,
        node2,
        node3,
      ]);

      expect(result).toBe(false);
    });

    it('should always be false for less then upper bound', () => {
      const node1 = mockStructuredJsonAttributeNode(1, '3');
      const node2 = mockStructuredJsonAttributeNode(2, '3');

      const result = isAttributeExhausted(node1.definition, [node1, node2]);

      expect(result).toBe(false);
    });

    it('should always be true for equal to the upper bound', () => {
      const node1 = mockStructuredJsonAttributeNode(1, '3');
      const node2 = mockStructuredJsonAttributeNode(2, '3');
      const node3 = mockStructuredJsonAttributeNode(3, '3');

      const result = isAttributeExhausted(node1.definition, [
        node1,
        node2,
        node3,
      ]);

      expect(result).toBe(true);
    });
  });

  describe('isInfiniteCardinality', () => {
    it('should recognise infinite upper bound', () => {
      const node = mockStructuredJsonAttributeNode(1, '*');
      const result = isInfiniteCardinality(node.definition);
      expect(result).toBe(true);
    });

    it('should return negative for non * values', () => {
      const node = mockStructuredJsonAttributeNode(1, '3');
      const result = isInfiniteCardinality(node.definition);
      expect(result).toBe(false);
    });
  });

  describe('isMultiCardinality', () => {
    it('should return false for single cardinality', () => {
      const node = mockStructuredJsonAttributeNode(1, '1');
      const result = isMultiCardinality(node.definition);
      expect(result).toBe(false);
    });

    it('should return true for greater than zero upper bounds', () => {
      const node = mockStructuredJsonAttributeNode(1, '3');
      const result = isMultiCardinality(node.definition);
      expect(result).toBe(true);
    });

    it('should return true for infinite upper bounds', () => {
      const node = mockStructuredJsonAttributeNode(1, '*');
      const result = isMultiCardinality(node.definition);
      expect(result).toBe(true);
    });
  });
});
