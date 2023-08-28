import { Injectable } from '@angular/core';
import { from, map, Observable, shareReplay } from 'rxjs';
import { ModelAttribute, StructuredType } from '../models/builder.model';

interface ModelData {
  modelName: string;
  modelVersion: string;
  rootTypesJson: StructuredType[];
  attributesJson: Record<string, ModelAttribute[]>;
}

@Injectable({
  providedIn: 'root',
})
export class BuilderApiService {
  private modelData = from(import('./builder-api.model')).pipe(
    map<any, ModelData>((modelImports) => modelImports),
    shareReplay(1)
  );

  getRootTypes(): Observable<StructuredType[]> {
    return this.modelData.pipe(
      map((modelImports) => modelImports.rootTypesJson),
      map((rootTypes) => rootTypes.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  getAttributesForType(type: StructuredType): Observable<ModelAttribute[]> {
    return this.modelData.pipe(
      map((modelImports) => modelImports.attributesJson),
      map((attributes) => attributes[`${type.namespace}.${type.name}`])
    );
  }

  getModelName(): Observable<string> {
    return this.modelData.pipe(
      map((modelImports) => modelImports.modelName),
      map((name) => name.toUpperCase())
    );
  }

  getModelVersion(): Observable<string> {
    return this.modelData.pipe(
      map((modelImports) => modelImports.modelVersion)
    );
  }
}
