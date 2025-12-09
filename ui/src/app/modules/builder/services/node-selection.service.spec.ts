import { TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';

import { NodeSelectionService } from './node-selection.service';

describe('NodeSelectionService', () => {
  let service: NodeSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection({ ignoreChangesOutsideZone: true })],
    });
    service = TestBed.inject(NodeSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
