import { ModelAttribute, StructuredType } from '../models/builder.model';
import { attributesJson, rootTypesJson } from './builder-api.model';

function getAttributesForType(type: StructuredType): ModelAttribute[] {
  const key = `${type.namespace}.${type.name}`;
  return (attributesJson as Record<string, ModelAttribute[]>)[key];
}

function getRootTypes(): StructuredType[] {
  return (rootTypesJson as StructuredType[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function getEligibleCollateralSpecificationRootType(): StructuredType {
  const eligibleCollateralSpecification = getRootTypes().find(
    (t) => t.name === 'EligibleCollateralSpecification'
  );
  if (eligibleCollateralSpecification == undefined) {
    throw Error('Can not find EligibleCollateralSpecification');
  }
  return eligibleCollateralSpecification;
}

function findAttributeInType(
  type: StructuredType,
  attributeName: string
): ModelAttribute {
  const attributes = getAttributesForType(type);
  const attribute = attributes.find((a) => a.name === attributeName);
  if (attribute === undefined) {
    throw Error(`Can not find ${attributeName} in type ${type}`);
  }
  return attribute;
}

export const testDataUtil = {
  getAttributesForType,
  getRootTypes,
  getEligibleCollateralSpecificationRootType,
  findAttributeInType,
};
