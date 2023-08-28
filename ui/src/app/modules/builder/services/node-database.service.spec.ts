import { TestBed } from '@angular/core/testing';
import {
  JsonAttributeNode,
  JsonRootNode,
  RosettaTypeCategory,
  StructuredType,
} from '../models/builder.model';
import {
  NodeDatabaseService,
  NodeDataChangeEvent,
} from './node-database.service';
import { addMatchers, hot, initTestScheduler } from 'jasmine-marbles';
import {
  mockJsonAttributeNode,
  mockStructuredJsonAttributeNode,
} from '../mocks/model-mocks';

describe('NodeDatabaseService', () => {
  let service: NodeDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeDatabaseService);
    initTestScheduler();
    addMatchers();
  });

  it('should send a change event when updating all nodes', () => {
    const rootNode: JsonRootNode = { type: getRootType(), children: [] };

    service.updateAllNodes(rootNode);

    const expectedChangeEvent: NodeDataChangeEvent = {
      rootNode,
    };

    const expected = hot('a', { a: expectedChangeEvent });

    expect(service.nodeDataChange$).toBeObservable(expected);
  });

  it('should insert a node and update', () => {
    const rootNode: JsonRootNode = {
      type: getRootType(),
      children: [mockStructuredJsonAttributeNode()],
    };

    service.updateAllNodes(rootNode);

    service.insertNode(rootNode.children[0], mockJsonAttributeNode());

    const expectedNodes: JsonAttributeNode[] = [
      mockStructuredJsonAttributeNode(),
    ];
    expectedNodes[0].children = [mockJsonAttributeNode()];

    const expectedChangeEvent: NodeDataChangeEvent = {
      rootNode,
      nodeToExpand: expectedNodes[0],
    };

    const expected = hot('a', { a: expectedChangeEvent });

    expect(service.nodeDataChange$).toBeObservable(expected);
  });

  it('should insert a node and update when parent is root node', () => {
    const rootNode: JsonRootNode = {
      type: getRootType(),
      children: [],
    };

    service.updateAllNodes(rootNode);

    service.insertNode(rootNode, mockStructuredJsonAttributeNode());

    const expectedChangeEvent: NodeDataChangeEvent = {
      rootNode,
    };

    const expected = hot('a', { a: expectedChangeEvent });

    expect(service.nodeDataChange$).toBeObservable(expected);
  });

  it('should remove nodes successfully', () => {
    const rootNode: JsonRootNode = {
      type: getRootType(),
      children: [],
    };

    const node1 = mockStructuredJsonAttributeNode(1);
    rootNode.children.push(node1);

    const node2 = mockStructuredJsonAttributeNode(2);
    node1.children = [node2];

    const node3 = mockStructuredJsonAttributeNode(3);
    node2.children = [node3];

    service.updateAllNodes(rootNode);

    service.deleteNode(node2);

    const expectedChangeEvent: NodeDataChangeEvent = {
      rootNode,
    };

    const expected = hot('a', { a: expectedChangeEvent });

    expect(service.nodeDataChange$).toBeObservable(expected);
  });

  function getRootType(): StructuredType {
    return {
      typeCategory: RosettaTypeCategory.StructuredType,
      name: 'RootType',
      namespace: 'root.namespace',
      description: 'Root type description',
    };
  }
});
