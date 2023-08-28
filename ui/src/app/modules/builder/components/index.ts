import { SelectNodeDirective } from '../directives/select-node.directive';
import { NodeInjectorPipe } from '../utils/node-injector.pipe';
import { NodeTypeSwitchPipe } from '../utils/node-type-switch.pipe';
import { AddAttributeComponent } from './add-attribute/add-attribute.component';
import { BooleanNodeComponent } from './boolean-node/boolean-node.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BuilderComponent } from './builder/builder.component';
import { DateNodeComponent } from './date-node/date-node.component';
import {
  DeleteComponent,
  DeleteDialogueComponent,
} from './delete/delete.component';
import { EnumNodeComponent } from './enum-node/enum-node.component';
import { IntNodeComponent } from './int-node/int-node.component';
import { MainComponent } from './main/main.component';
import { NodeDetailsComponent } from './node-details/node-details.component';
import { NumberNodeComponent } from './number-node/number-node.component';
import { StackedNodeControlsComponent } from './stacked-node-controls/stacked-node-controls.component';
import { StringNodeComponent } from './string-node/string-node.component';
import { StructuredTypeNodeComponent } from './structured-type-node/structured-type-node.component';
import { TabularViewComponent } from './tabular-view/tabular-view.component';
import { ViewerComponent } from './viewer/viewer.component';
import { ZonedDateTimeNodeComponent } from './zoned-date-time-node/zoned-date-time-node.component';

export const components = [
  SelectNodeDirective,
  BreadcrumbComponent,
  BuilderComponent,
  NodeTypeSwitchPipe,
  NodeInjectorPipe,
  StringNodeComponent,
  StackedNodeControlsComponent,
  StructuredTypeNodeComponent,
  DateNodeComponent,
  EnumNodeComponent,
  ZonedDateTimeNodeComponent,
  IntNodeComponent,
  NumberNodeComponent,
  DeleteComponent,
  DeleteDialogueComponent,
  AddAttributeComponent,
  BooleanNodeComponent,
  NodeDetailsComponent,
  ViewerComponent,
  MainComponent,
  TabularViewComponent,
];
