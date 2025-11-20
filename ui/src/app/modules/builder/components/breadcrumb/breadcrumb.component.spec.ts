import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, ReplaySubject } from 'rxjs';
import { JsonAttributeNode } from '../../models/builder.model';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import { BuilderComponent } from '../builder/builder.component';

import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  let nodeDbSpy: jasmine.SpyObj<NodeDatabaseService>;
  let nodeSelectionSpy: jasmine.SpyObj<NodeSelectionService>;
  let builderSpy: jasmine.SpyObj<BuilderComponent>;

  beforeEach(async () => {
    nodeDbSpy = jasmine.createSpyObj(
      'NodeDatabaseService',
      ['getLineage'],
      { nodeDataChange$: new ReplaySubject(1) as any }
    );
    nodeSelectionSpy = jasmine.createSpyObj('NodeSelectionService', [
      'getSelectedNode',
      'selectAndScrollToNode',
    ]);
    builderSpy = jasmine.createSpyObj('BuilderComponent', ['expandNode']);

    // Default to no selection to avoid undefined pipe errors during component init
    (nodeSelectionSpy.getSelectedNode as jasmine.Spy).and.returnValue(of(null));

    await TestBed.configureTestingModule({
      declarations: [BreadcrumbComponent],
      providers: [
        { provide: NodeDatabaseService, useValue: nodeDbSpy },
        { provide: NodeSelectionService, useValue: nodeSelectionSpy },
        { provide: BuilderComponent, useValue: builderSpy },
      ],
      imports: [MatSnackBarModule],
    }).compileComponents();

    // Defer component creation to individual tests so spies can be tailored
  });

  it('should create', () => {
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('breadcrumbClick expands lineage and selects the clicked node', (done) => {
    const child: JsonAttributeNode = {
      id: 2,
      definition: {
        name: 'child',
        description: 'child',
        cardinality: { lowerBound: '0', upperBound: '*' },
        type: 'string' as any,
      },
    };
    const parent: JsonAttributeNode = {
      id: 1,
      definition: {
        name: 'parent',
        description: 'parent',
        cardinality: { lowerBound: '0', upperBound: '*' },
        type: 'string' as any,
      },
    };

    nodeSelectionSpy.getSelectedNode.and.returnValue(of(child));
    const root = { type: { name: 'RootType', namespace: 'ns' } } as any; // JsonRootNode shape for template
    nodeDbSpy.getLineage.and.returnValue([root, parent, child]);

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Access observable to ensure it is connected
    const sub = component.breadcrumbs$.subscribe(() => {
      // click on child should expand parent and child, then select child
      component.breadcrumbClick(child);
      expect(builderSpy.expandNode).toHaveBeenCalledWith(parent);
      expect(builderSpy.expandNode).toHaveBeenCalledWith(child);
      // finalize runs after onComplete, in this sync test it should be queued microtask
      setTimeout(() => {
        expect(nodeSelectionSpy.selectAndScrollToNode).toHaveBeenCalledWith(
          child
        );
        sub.unsubscribe();
        done();
      });
    });
  });
});
