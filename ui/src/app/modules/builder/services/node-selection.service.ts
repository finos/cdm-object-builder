import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { JsonAttributeNode } from '../models/builder.model';

@Injectable({
  providedIn: 'root',
})
export class NodeSelectionService {
  private selectedNode = new ReplaySubject<JsonAttributeNode | null>(1);

  constructor(@Inject(DOCUMENT) private document: Document) {}

  updateSelectedNode(node: JsonAttributeNode) {
    this.selectedNode.next(node);
  }

  selectAndScrollToNode(node: JsonAttributeNode) {
    const el = this.document.getElementById(node.id.toLocaleString());
    requestAnimationFrame(() => {
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => {
        this.updateSelectedNode(node);
      });
    });
  }

  deselectNodes() {
    this.selectedNode.next(null);
  }

  getSelectedNode(): Observable<JsonAttributeNode | null> {
    return this.selectedNode.asObservable();
  }
}
