import { TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { FileImportService } from './file-import.service';

describe('FileImportService', () => {
  let service: FileImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [provideZoneChangeDetection({ ignoreChangesOutsideZone: true })],
    });
    service = TestBed.inject(FileImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
