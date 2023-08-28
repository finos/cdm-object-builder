import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockJsonAttributeNode } from '../../mocks/model-mocks';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../../tokens';

import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StructuredTypeNodeComponent } from './structured-type-node.component';

describe('StructuredTypeNodeComponent', () => {
  let component: StructuredTypeNodeComponent;
  let fixture: ComponentFixture<StructuredTypeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructuredTypeNodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatMenuModule, MatSnackBarModule],
      providers: [
        {
          provide: JSON_ATTRIBUTE_NODE_TOKEN,
          useValue: mockJsonAttributeNode(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StructuredTypeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
