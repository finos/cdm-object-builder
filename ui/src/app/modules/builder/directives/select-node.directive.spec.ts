import { NodeSelectionService } from '../services/node-selection.service';
import { SelectNodeDirective } from './select-node.directive';

describe('SelectNodeDirective', () => {
  it('should create an instance', () => {
    const directive = new SelectNodeDirective(
      new NodeSelectionService(window.document)
    );
    expect(directive).toBeTruthy();
  });
});
