import { Pipe, PipeTransform, Type } from '@angular/core';
import { BooleanNodeComponent } from '../components/boolean-node/boolean-node.component';
import { DateNodeComponent } from '../components/date-node/date-node.component';
import { EnumNodeComponent } from '../components/enum-node/enum-node.component';
import { IntNodeComponent } from '../components/int-node/int-node.component';
import { NumberNodeComponent } from '../components/number-node/number-node.component';
import { TimeNodeComponent } from '../components/time-node/time-node.component';
import { StringNodeComponent } from '../components/string-node/string-node.component';
import { StructuredTypeNodeComponent } from '../components/structured-type-node/structured-type-node.component';
import { ZonedDateTimeNodeComponent } from '../components/zoned-date-time-node/zoned-date-time-node.component';
import { ModelType, RosettaBasicType } from '../models/builder.model';
import { isEnumType, isStructuredType } from './type-guards.util';

@Pipe({ name: 'nodeTypeSwitch' })
export class NodeTypeSwitchPipe implements PipeTransform {
  transform(value: ModelType): Type<any> {
    if (value === RosettaBasicType.STRING) {
      return StringNodeComponent;
    } else if (value === RosettaBasicType.BOOLEAN) {
      return BooleanNodeComponent;
    } else if (value === RosettaBasicType.INT) {
      return IntNodeComponent;
    } else if (value === RosettaBasicType.NUMBER) {
      return NumberNodeComponent;
    } else if (value === RosettaBasicType.TIME) {
      return TimeNodeComponent;
    } else if (value === RosettaBasicType.DATE) {
      return DateNodeComponent;
    } else if (value === RosettaBasicType.ZONED_DATE_TIME) {
      return ZonedDateTimeNodeComponent;
    } else if (isEnumType(value)) {
      return EnumNodeComponent;
    } else if (isStructuredType(value)) {
      return StructuredTypeNodeComponent;
    } else {
      throw Error(`Unknown node type: ${value}`);
    }
  }
}
