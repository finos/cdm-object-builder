import { Injectable } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash-es';
import { filter, map, Observable, ReplaySubject } from 'rxjs';
import {
  JsonAttributeNode,
  JsonNode,
  JsonRootNode,
  RosettaBasicType,
} from '../models/builder.model';
import { isAttributeExhausted, isListBasedBasicType } from '../utils/node.util';
import { isJsonRootNode, isStringArray } from '../utils/type-guards.util';
import { IdentityService } from './identity.service';

export interface NodeDataChangeEvent {
  rootNode: JsonRootNode;
  nodeToExpand?: JsonAttributeNode;
}

@Injectable({
  providedIn: 'root',
})
export class NodeDatabaseService {
  nodeDataChange$ = new ReplaySubject<NodeDataChangeEvent>(1);

  private rootNode: NodeDataChangeEvent['rootNode'] | null = null;

  private parentLookupMap = new Map<number, JsonNode>();

  updateAllNodes(node: JsonRootNode) {
    this.rootNode = node;
    this.parentLookupMap.clear();
    this.updateParentLookupMap(node);
    this.nodeDataChange$.next({ rootNode: node });
  }

  insertNode(parent: JsonNode, newNode: JsonAttributeNode): JsonAttributeNode {
    if (this.rootNode === null) {
      throw Error('Root node can not be null when calling insertNode');
    }

    const matchingSiblingAttributeNode = this.findNodeInSiblings(
      newNode,
      parent.children
    );

    let updatedNode: JsonAttributeNode;

    if (isListBasedBasicType(newNode) && matchingSiblingAttributeNode) {
      this.addValueToExistingSiblingNode(newNode, matchingSiblingAttributeNode);
      updatedNode = matchingSiblingAttributeNode;
    } else {
      this.addNodeToParent(parent, newNode);
      updatedNode = newNode;
    }

    if (isJsonRootNode(parent)) {
      this.nodeDataChange$.next({
        rootNode: this.rootNode,
      });
    } else {
      this.nodeDataChange$.next({
        rootNode: this.rootNode,
        nodeToExpand: parent,
      });
    }
    return updatedNode;
  }

  addValueToExistingNode(
    existingNode: JsonAttributeNode,
    newValue: string | number
  ) {
    if (!this.rootNode) {
      throw Error('Unable to delete node when no root node is defined');
    }

    if (existingNode.value === null || existingNode.value === undefined) {
      existingNode.value = [];
    }

    if (!Array.isArray(existingNode.value)) {
      const currentValue = existingNode.value;
      existingNode.value = [currentValue] as any[];
    }

    existingNode.value = [...existingNode.value, newValue] as any[];

    this.nodeDataChange$.next({
      rootNode: this.rootNode,
    });
  }

  deleteNode(nodeToRemove: JsonAttributeNode, tree?: JsonAttributeNode[]) {
    if (!this.rootNode) {
      throw Error('Unable to delete node when no root node is defined');
    }

    const children = tree || this.rootNode?.children;

    if (!children) {
      throw Error('Unable to remove node from empty tree ');
    }

    if (children.find(n => n === nodeToRemove)) {
      children.splice(children.indexOf(nodeToRemove), 1);
      children.sort((a, b) =>
        a.definition.name.localeCompare(b.definition.name)
      );
      this.nodeDataChange$.next({
        rootNode: this.rootNode,
      });
    } else {
      children.forEach(n => {
        if (n.children) {
          this.deleteNode(nodeToRemove, n.children);
        }
      });
    }
  }

  removeValueFromExistingNode(
    nodeToUpdate: JsonAttributeNode,
    valueIndexToRemove: number
  ) {
    if (!this.rootNode) {
      throw Error('Unable to delete node when no root node is defined');
    }

    if (!nodeToUpdate.value || !Array.isArray(nodeToUpdate.value)) {
      throw Error('Can not remove values from node with no value array');
    }

    nodeToUpdate.value.splice(valueIndexToRemove, 1);

    this.nodeDataChange$.next({
      rootNode: this.rootNode,
    });
  }

  duplicateSubTree(nodeToDuplicate: JsonAttributeNode): JsonAttributeNode {
    const parent = this.parentLookupMap.get(nodeToDuplicate.id);
    if (!parent) {
      throw Error(`No parent found for node ${nodeToDuplicate}`);
    }

    if (!parent.children) {
      throw Error('Illegal state, cant duplicate child node with no parent');
    }

    const newNode = this.cloneNodeSubTree(nodeToDuplicate);

    parent.children.push(newNode);

    this.updateAllNodes(this.rootNode!);

    return newNode;
  }

  isNodeExhausted(node: JsonAttributeNode): Observable<boolean> {
    return this.nodeDataChange$.pipe(
      filter(({ rootNode }) => rootNode !== null),
      map(() => {
        return this.parentLookupMap.get(node.id);
      }),
      filter(Boolean),
      map(parent => {
        if (!parent.children) {
          return false;
        }
        return isAttributeExhausted(node.definition, parent.children);
      })
    );
  }

  overwriteNodeChildren(parent: JsonNode, newChildren: JsonAttributeNode[]) {
    if (!this.rootNode) {
      throw Error(
        'Unable to overwriteNodeChildren when no root node is defined'
      );
    }

    parent.children = newChildren;

    this.nodeDataChange$.next({
      rootNode: this.rootNode,
      nodeToExpand: !isJsonRootNode(parent) ? parent : undefined,
    });
  }

  getLineage(node: JsonNode, results: JsonNode[] = []): JsonNode[] {
    if (isJsonRootNode(node)) {
      results.unshift(node);
      return results;
    }

    const parent = this.parentLookupMap.get(node.id);

    if (!parent) {
      throw Error('Unable to find parent node');
    }

    results.unshift(node);
    return this.getLineage(parent, results);
  }

  constructor(private identityService: IdentityService) {}

  private findNodeInSiblings(
    node: JsonAttributeNode,
    siblings: JsonAttributeNode[] | undefined
  ): JsonAttributeNode | undefined {
    if (!siblings) {
      return undefined;
    }

    return siblings.find(s => isEqual(s.definition, node.definition));
  }

  private addValueToExistingSiblingNode(
    newJsonAttribute: JsonAttributeNode,
    matchingSiblingAttributeNode: JsonAttributeNode
  ) {
    if (newJsonAttribute === undefined) {
      throw new Error('Attempt to add undefined value to sibling');
    }

    switch (newJsonAttribute.definition.type) {
      case RosettaBasicType.STRING:
        const newValue = (newJsonAttribute.value || '') as string;
        if (isStringArray(matchingSiblingAttributeNode.value)) {
          matchingSiblingAttributeNode.value.push(newValue);
        } else if (typeof matchingSiblingAttributeNode.value === 'string') {
          const newValues = [newValue, matchingSiblingAttributeNode.value];
          matchingSiblingAttributeNode.value = newValues;
        }
        break;
      default:
        throw new Error(
          `Adding value ${newJsonAttribute.value} to matchingSiblingAttributeNode.value ${matchingSiblingAttributeNode.value} is not supported`
        );
    }
  }

  private addNodeToParent(parent: JsonNode, newNode: JsonAttributeNode) {
    if (parent.children === undefined) {
      parent.children = [];
    }

    parent.children.push(newNode);
    parent.children.sort((a, b) =>
      a.definition.name.localeCompare(
        b.definition.name,
        navigator.languages[0] || navigator.language,
        {
          numeric: true,
          ignorePunctuation: true,
        }
      )
    );

    this.parentLookupMap.set(newNode.id, parent);
  }

  private updateParentLookupMap(parent: JsonNode) {
    if (!parent.children) {
      return;
    }
    const children = parent.children;
    children.forEach(child => {
      this.parentLookupMap.set(child.id, parent);
    });

    for (const child of children) {
      this.updateParentLookupMap(child);
    }
  }

  private cloneNodeSubTree(node: JsonAttributeNode): JsonAttributeNode {
    const clone = cloneDeep(node);
    this.regenerateKeysForSubTree(clone);
    return clone;
  }

  private regenerateKeysForSubTree(node: JsonAttributeNode) {
    node.id = this.identityService.getId();
    if (node.children) {
      for (const child of node.children) {
        this.regenerateKeysForSubTree(child);
      }
    }
  }
}
