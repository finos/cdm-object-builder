import { InjectionToken } from '@angular/core';
import { JsonAttributeNode } from './models/builder.model';

export const JSON_ATTRIBUTE_NODE_TOKEN = new InjectionToken<JsonAttributeNode>(
  'JsonAttributeNode'
);
