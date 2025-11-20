import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';
import { DeleteComponent } from './delete.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NodeDatabaseService } from '../../services/node-database.service';
import { NodeSelectionService } from '../../services/node-selection.service';
import { of } from 'rxjs';

describe('DeleteComponent', () => {
  let component: DeleteComponent;
  let fixture: ComponentFixture<DeleteComponent>;

  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let nodeDbSpy: jasmine.SpyObj<NodeDatabaseService>;
  let nodeSelectionSpy: jasmine.SpyObj<NodeSelectionService>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    nodeDbSpy = jasmine.createSpyObj('NodeDatabaseService', ['deleteNode']);
    nodeSelectionSpy = jasmine.createSpyObj('NodeSelectionService', [
      'deselectNodes',
    ]);
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [DeleteComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NodeDatabaseService, useValue: nodeDbSpy },
        { provide: NodeSelectionService, useValue: nodeSelectionSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delete confirms and triggers node deletion and deselection', () => {
    (dialogSpy.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of('ok'),
    } as any);

    component.jsonAttributeNode = mockJsonAttributeNode();
    component.delete();

    expect(nodeDbSpy.deleteNode).toHaveBeenCalledWith(
      component.jsonAttributeNode
    );
    expect(nodeSelectionSpy.deselectNodes).toHaveBeenCalled();
  });

  it('delete cancel does nothing', () => {
    (dialogSpy.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of('cancel'),
    } as any);

    component.jsonAttributeNode = mockJsonAttributeNode();
    component.delete();

    expect(nodeDbSpy.deleteNode).not.toHaveBeenCalled();
    expect(nodeSelectionSpy.deselectNodes).not.toHaveBeenCalled();
  });
});
