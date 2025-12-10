import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StructuredTypeNodeComponent } from './structured-type-node.component';
import { NodeDatabaseService } from '../../services/node-database.service';
import { FileImportService } from '../../services/file-import.service';
import { NodeSelectionService } from '../../services/node-selection.service';

describe('StructuredTypeNodeComponent', () => {
  let component: StructuredTypeNodeComponent;
  let fixture: ComponentFixture<StructuredTypeNodeComponent>;

  let nodeDbSpy: jasmine.SpyObj<NodeDatabaseService>;
  let fileImportSpy: jasmine.SpyObj<FileImportService>;
  let nodeSelectionSpy: jasmine.SpyObj<NodeSelectionService>;

  beforeEach(async () => {
    nodeDbSpy = jasmine.createSpyObj(
      'NodeDatabaseService',
      ['duplicateSubTree'],
      { isNodeExhausted: () => of(false) }
    ) as any;
    fileImportSpy = jasmine.createSpyObj('FileImportService', ['importFile']);
    nodeSelectionSpy = jasmine.createSpyObj('NodeSelectionService', [
      'selectAndScrollToNode',
    ]);

    await TestBed.configureTestingModule({
      declarations: [StructuredTypeNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatMenuModule, MatSnackBarModule],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
        { provide: NodeDatabaseService, useValue: nodeDbSpy },
        { provide: FileImportService, useValue: fileImportSpy },
        { provide: NodeSelectionService, useValue: nodeSelectionSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StructuredTypeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('duplicate triggers node duplication and selection', () => {
    const duplicated = { id: 123, definition: (component as any).jsonAttributeNode.definition } as any;
    (nodeDbSpy.duplicateSubTree as jasmine.Spy).and.returnValue(duplicated);

    component.duplicate();

    expect(nodeDbSpy.duplicateSubTree).toHaveBeenCalled();
    expect(nodeSelectionSpy.selectAndScrollToNode).toHaveBeenCalledWith(
      duplicated
    );
  });

  it('onImportFileChange calls import service and resets input control', () => {
    const completed$ = new Subject<void>();
    fileImportSpy.importFile.and.returnValue(completed$.asObservable());

    const event = new Event('change');
    component.inputFormControl.setValue('something');
    component.onImportFileChange(event);

    // Not yet reset until finalize
    expect(component.inputFormControl.value).toBe('something');
    // emit then complete to satisfy first() and trigger finalize
    completed$.next();
    completed$.complete();
    expect(component.inputFormControl.value).toBeNull();
  });
});
