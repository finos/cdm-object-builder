import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { BuilderApiServiceMock } from '../../mocks/builder-api.service.mock';
import { mockStructuredJsonAttributeNode } from '../../mocks/model-mocks';
import { BuilderApiService } from '../../services/builder-api.service';

import { AddAttributeComponent } from './add-attribute.component';

describe('AddAttributeComponent', () => {
  let component: AddAttributeComponent;
  let fixture: ComponentFixture<AddAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddAttributeComponent],
      imports: [MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BuilderApiService, useClass: BuilderApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAttributeComponent);
    component = fixture.componentInstance;
    component.jsonNode = mockStructuredJsonAttributeNode();

    fixture.detectChanges();
  });

  it('should create', () => {
    component.jsonNode = mockStructuredJsonAttributeNode();
    expect(component).toBeTruthy();
  });
});
