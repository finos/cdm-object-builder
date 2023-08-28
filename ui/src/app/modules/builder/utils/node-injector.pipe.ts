import { Pipe, PipeTransform, Injector } from '@angular/core';
import { JsonAttributeNode } from '../models/builder.model';
import { JSON_ATTRIBUTE_NODE_TOKEN } from '../tokens';

@Pipe({ name: 'nodeInjector' })
export class NodeInjectorPipe implements PipeTransform {
  constructor(private injector: Injector) {}
  transform(value: JsonAttributeNode): Injector {
    return Injector.create({
      providers: [{ provide: JSON_ATTRIBUTE_NODE_TOKEN, useValue: value }],
      parent: this.injector,
    });
  }
}
