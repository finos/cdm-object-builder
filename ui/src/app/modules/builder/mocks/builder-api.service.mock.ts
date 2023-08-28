import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StructuredType, ModelAttribute } from '../models/builder.model';

@Injectable({
  providedIn: 'root',
})
export class BuilderApiServiceMock {
  getRootTypes(): Observable<StructuredType[]> {
    return of([]);
  }

  getAttributesForType(type: StructuredType): Observable<ModelAttribute[]> {
    return of([]);
  }

  getModelName(): Observable<string> {
    return of('model-name');
  }

  getModelVersion(): Observable<string> {
    return of('1.2.3');
  }
}
