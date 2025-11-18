import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { of, ReplaySubject } from 'rxjs';
import { mockJsonAttributeNode, mockStructuredJsonAttributeNode } from '../../mocks/model-mocks';
import { BuilderApiService } from '../../services/builder-api.service';
import { IdentityService } from '../../services/identity.service';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';

import { AddAttributeComponent } from './add-attribute.component';

describe('AddAttributeComponent', () => {
  let component: AddAttributeComponent;
  let fixture: ComponentFixture<AddAttributeComponent>;

  let builderApiServiceSpy: jasmine.SpyObj<BuilderApiService>;
  let nodeDbSpy: jasmine.SpyObj<NodeDatabaseService>;
  let identitySpy: jasmine.SpyObj<IdentityService>;
  let nodeSelectionSpy: jasmine.SpyObj<NodeSelectionService>;

  beforeEach(async () => {
    builderApiServiceSpy = jasmine.createSpyObj('BuilderApiService', [
      'getAttributesForType',
    ]);
    // Default to empty list to satisfy template subscriptions; individual tests will override.
    (builderApiServiceSpy.getAttributesForType as jasmine.Spy).and.returnValue(of([]));
    nodeDbSpy = jasmine.createSpyObj(
      'NodeDatabaseService',
      ['insertNode'],
      { nodeDataChange$: new ReplaySubject(1) as any }
    );
    identitySpy = jasmine.createSpyObj('IdentityService', ['getId']);
    nodeSelectionSpy = jasmine.createSpyObj('NodeSelectionService', [
      'selectAndScrollToNode',
    ]);

    await TestBed.configureTestingModule({
      declarations: [AddAttributeComponent],
      imports: [MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BuilderApiService, useValue: builderApiServiceSpy },
        { provide: NodeDatabaseService, useValue: nodeDbSpy },
        { provide: IdentityService, useValue: identitySpy },
        { provide: NodeSelectionService, useValue: nodeSelectionSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAttributeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.jsonNode = mockStructuredJsonAttributeNode();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('hasAttributesToAdd emits true when there are attributes to add', done => {
    component.jsonNode = mockStructuredJsonAttributeNode();
    fixture.detectChanges();
    const attrs = [
      {
        name: 'a',
        description: 'A',
        type: (component.jsonNode as any).definition.type,
        cardinality: { lowerBound: '0', upperBound: '*' },
      },
    ];
    builderApiServiceSpy.getAttributesForType.and.returnValue(of(attrs as any));

    component.hasAttributesToAdd.subscribe(v => {
      expect(v).toBeTrue();
      done();
    });
  });

  it('addAttribute inserts node with initial value for string and selects it', () => {
    component.jsonNode = mockStructuredJsonAttributeNode();
    fixture.detectChanges();
    const attr = {
      name: 'str',
      description: 'string',
      type: 'string',
      cardinality: { lowerBound: '0', upperBound: '*' },
    } as any;
    identitySpy.getId.and.returnValue(999);
    const updatedNode = { id: 999, definition: attr } as any;
    nodeDbSpy.insertNode.and.returnValue(updatedNode);

    component.addAttribute(attr);

    expect(identitySpy.getId).toHaveBeenCalled();
    expect(nodeDbSpy.insertNode).toHaveBeenCalled();
    const passed = nodeDbSpy.insertNode.calls.mostRecent().args[1];
    expect(passed.value).toEqual('');
    expect(nodeSelectionSpy.selectAndScrollToNode).toHaveBeenCalledWith(
      updatedNode
    );
  });

  it('addMandatoryAttributes inserts only mandatory missing attributes and re-selects current node', () => {
    const jsonNode = mockStructuredJsonAttributeNode(1, '*');
    component.jsonNode = jsonNode as any;
    fixture.detectChanges();

    const mandatoryA = {
      name: 'A',
      type: (jsonNode as any).definition.type,
      description: 'A',
      cardinality: { lowerBound: '2', upperBound: '*' },
    } as any;
    const mandatoryB = {
      name: 'B',
      type: (jsonNode as any).definition.type,
      description: 'B',
      cardinality: { lowerBound: '1', upperBound: '*' },
    } as any;

    // One existing child for A already present
    (component.jsonNode as any).children = [
      { id: 10, definition: { ...mandatoryA } },
    ];

    builderApiServiceSpy.getAttributesForType.and.returnValue(
      of([mandatoryA, mandatoryB])
    );

    nodeDbSpy.insertNode.and.callFake((_parent: any, newNode: any) => newNode);

    component.addMandatoryAttributes();

    // Should add A (once) and B (once)
    expect(nodeDbSpy.insertNode.calls.count()).toBe(2);
    const defs = nodeDbSpy.insertNode.calls.allArgs().map(a => a[1].definition);
    expect(defs).toEqual([mandatoryA, mandatoryB]);
    expect(nodeSelectionSpy.selectAndScrollToNode).toHaveBeenCalledWith(
      component.jsonNode as any
    );
  });

  it('addAttribute with refresh=false does not select or refresh', () => {
    component.jsonNode = mockStructuredJsonAttributeNode();
    fixture.detectChanges();
    const attr = {
      name: 's',
      description: 'string',
      type: 'string',
      cardinality: { lowerBound: '0', upperBound: '*' },
    } as any;
    identitySpy.getId.and.returnValue(1);
    nodeDbSpy.insertNode.and.callFake((_p: any, n: any) => n);

    component.addAttribute(attr, false);

    expect(nodeDbSpy.insertNode).toHaveBeenCalled();
    expect(nodeSelectionSpy.selectAndScrollToNode).not.toHaveBeenCalled();
  });

  it("availableAttributes$ errors for non-structured type", done => {
    // Set a non-structured attribute node
    const nonStructured = mockJsonAttributeNode();
    // @ts-ignore
    component.jsonNode = nonStructured as any;
    // Intentionally DO NOT call fixture.detectChanges() here to avoid template async pipe subscribing.
    component.availableAttributes$.subscribe({
      next: () => done.fail('expected error'),
      error: err => {
        expect(String(err)).toContain("Can't get attributes for non-structured type");
        done();
      },
    });
  });
});
