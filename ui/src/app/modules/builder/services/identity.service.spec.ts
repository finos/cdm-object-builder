import { TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';

import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let service: IdentityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection({ ignoreChangesOutsideZone: true })],
    });
    service = TestBed.inject(IdentityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
