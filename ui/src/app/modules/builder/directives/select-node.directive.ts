import {
  Directive,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { JsonAttributeNode } from '../models/builder.model';
import { NodeSelectionService } from '../services/node-selection.service';

@Directive({
    selector: '[appSelectNode]',
    standalone: false
})
export class SelectNodeDirective implements OnInit, OnDestroy {
  @Input('appSelectNode')
  node: JsonAttributeNode | null = null;

  constructor(private nodeSelectionService: NodeSelectionService) {}

  private subscription = new Subscription();

  @HostListener('click') onClick() {
    if (this.node) {
      this.nodeSelected = true;
      this.nodeHover = false;
      this.nodeSelectionService.updateSelectedNode(this.node);
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.nodeHover = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.nodeHover = false;
  }

  @HostBinding('class.node-hover') nodeHover: boolean = false;

  @HostBinding('class.node-selected') nodeSelected: boolean = false;

  ngOnInit(): void {
    this.subscription.add(
      this.nodeSelectionService.getSelectedNode().subscribe((selectedNode) => {
        this.nodeSelected =
          selectedNode !== null && selectedNode.id === this.node?.id;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
