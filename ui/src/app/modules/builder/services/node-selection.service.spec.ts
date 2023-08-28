import { TestBed } from '@angular/core/testing';

import { NodeSelectionService } from './node-selection.service';

describe('NodeSelectionService', () => {
  let service: NodeSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
