import { TestBed } from '@angular/core/testing';
import {
  JsonRootNode,
  ModelAttribute,
  RosettaTypeCategory,
  StructuredType,
} from '../models/builder.model';

import { isStructuredType } from '../utils/type-guards.util';
import { JsonExportService } from './json-export.service';
import { testDataUtil } from './test-data.uti';

describe('JsonExportService', () => {
  let service: JsonExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should export correctly', () => {
    const service = new JsonExportService();

    // Input
    const partyType: StructuredType = {
      name: 'Party',
      namespace: 'cdm.base.staticdata.party',
      description: 'Party Description',
      typeCategory: RosettaTypeCategory.StructuredType,
    };

    const partyNameAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(partyType, 'name');

    const partyIdentifierType: StructuredType = {
      name: 'PartyIdentifier',
      namespace: 'cdm.base.staticdata.party',
      description:
        'Comprises an identifier and a source. The associated metadata key denotes the ability to associate a hash value to the PartyIdentifier instantiations for the purpose of model cross-referencing, in support of functionality such as the event effect and the lineage.',
      typeCategory: RosettaTypeCategory.StructuredType,
    };

    const partyIdAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(partyType, 'partyId');

    const partyIdentifierTypeAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(partyIdentifierType, 'identifierType');

    const identifierAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(partyIdentifierType, 'identifier');

    const naturalPersonType: StructuredType = {
      name: 'NaturalPerson',
      namespace: 'cdm.base.staticdata.party',
      description:
        'A class to represent the attributes that are specific to a natural person.',
      typeCategory: RosettaTypeCategory.StructuredType,
    };

    const partyPersonAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(partyType, 'person');

    const naturalPersonFirstNameAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(naturalPersonType, 'firstName');

    const naturalPersonSurnameAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(naturalPersonType, 'surname');

    const naturalPersonDateOfBirthAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(naturalPersonType, 'dateOfBirth');

    const naturalPersonPersonIdAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(naturalPersonType, 'personId');

    const personIdentifierType: StructuredType = {
      name: 'PersonIdentifier',
      namespace: 'cdm.base.staticdata.party',
      description:
        'Comprises an identifier and a source. The associated metadata key denotes the ability to associate a hash value to the PersonIdentifier instantiations for the purpose of model cross-referencing, in support of functionality such as the event effect and the lineage.',
      typeCategory: RosettaTypeCategory.StructuredType,
    };

    const personIdentifierIdentifierAttributeDefinition: ModelAttribute =
      testDataUtil.findAttributeInType(personIdentifierType, 'identifier');

    const inputJsonRootNode: JsonRootNode = {
      type: partyType,
      children: [
        {
          id: 12345,
          definition: partyNameAttributeDefinition,
          value: 'Party B',
        },
        {
          id: 12345,
          definition: partyIdAttributeDefinition,
          children: [
            {
              id: 12345,
              definition: identifierAttributeDefinition,
              value: '48750084UKLVTR22DS78',
            },
            {
              id: 12345,
              definition: partyIdentifierTypeAttributeDefinition,
              value: 'LEI',
            },
          ],
        },
        {
          id: 12345,
          definition: partyPersonAttributeDefinition,
          children: [
            {
              id: 12345,
              definition: naturalPersonFirstNameAttributeDefinition,
              value: 'John',
            },
            {
              id: 12345,
              definition: naturalPersonSurnameAttributeDefinition,
              value: 'Doe',
            },
            {
              id: 12345,
              definition: naturalPersonDateOfBirthAttributeDefinition,
              value: '1980-01-01',
            },
            {
              id: 12345,
              definition: naturalPersonPersonIdAttributeDefinition,
              children: [
                {
                  id: 12345,
                  definition: personIdentifierIdentifierAttributeDefinition,
                  value: 'jdoe',
                },
              ],
            },
          ],
        },
        {
          id: 12345,
          definition: partyPersonAttributeDefinition,
          children: [
            {
              id: 12345,
              definition: naturalPersonFirstNameAttributeDefinition,
              value: 'Jane',
            },
            {
              id: 12345,
              definition: naturalPersonSurnameAttributeDefinition,
              value: 'Doe',
            },
          ],
        },
      ],
    };

    // Expected
    const expectedJsonOutput = {
      name: {
        value: 'Party B',
      },
      partyId: [
        {
          identifier: {
            value: '48750084UKLVTR22DS78',
          },
          identifierType: 'LEI',
        },
      ],
      person: [
        {
          firstName: 'John',
          surname: 'Doe',
          dateOfBirth: '1980-01-01',
          personId: [
            {
              value: {
                identifier: {
                  value: 'jdoe',
                },
              },
            },
          ],
        },
        { firstName: 'Jane', surname: 'Doe' },
      ],
    };

    const exported = service.export(inputJsonRootNode);

    expect(exported).toEqual(expectedJsonOutput);
  });

  xit('should export primitive arrays correctly', () => {
    const eligibleCollateralScheduleType: StructuredType =
      testDataUtil.getEligibleCollateralSpecificationRootType();

    const eligibleCollateralCriteriaAttr =
      testDataUtil.findStructuredAttributeInType(
        eligibleCollateralScheduleType,
        'criteria'
      );

    const issuerCriteriaAttr = testDataUtil.findStructuredAttributeInType(
      eligibleCollateralCriteriaAttr.type,
      'issuer'
    );

    const issuerCountryOfOriginAttr = testDataUtil.findAttributeInType(
      issuerCriteriaAttr.type,
      'issuerCountryOfOrigin'
    );

    const inputJsonRootNode: JsonRootNode = {
      type: eligibleCollateralScheduleType,
      children: [
        {
          definition: eligibleCollateralCriteriaAttr,
          id: 1,
          children: [
            {
              definition: issuerCriteriaAttr,
              id: 3,
              children: [
                {
                  definition: issuerCountryOfOriginAttr,
                  id: 4,
                  value: ['UK', 'US', 'FR'],
                },
              ],
            },
          ],
        },
      ],
    };

    const expectedJsonOutput = {
      criteria: [
        {
          issuer: [
            {
              issuerCountryOfOrigin: [
                {
                  value: 'UK',
                },
                {
                  value: 'US',
                },
                {
                  value: 'FR',
                },
              ],
            },
          ],
        },
      ],
    };

    const exported = service.export(inputJsonRootNode);

    expect(exported).toEqual(expectedJsonOutput);
  });

  it('should export optional values as single cardinality objects', () => {
    const eligibleCollateralSpecification: StructuredType =
      testDataUtil.getEligibleCollateralSpecificationRootType();

    const eligibleCollateralCriteria =
      testDataUtil.findStructuredAttributeInType(
        eligibleCollateralSpecification,
        'criteria'
      );

    const collateralCriteria = testDataUtil.findStructuredAttributeInType(
      eligibleCollateralCriteria.type,
      'collateralCriteria'
    );

    const assetCollateralAssetType = testDataUtil.findStructuredAttributeInType(
      collateralCriteria.type,
      'AssetType'
    );

    const assetTypeEquityType = testDataUtil.findAttributeInType(
      assetCollateralAssetType.type,
      'equityType'
    );

    const inputJsonRootNode: JsonRootNode = {
      type: eligibleCollateralSpecification,
      children: [
        {
          definition: eligibleCollateralCriteria,
          id: 1,
          children: [
            {
              definition: collateralCriteria,
              id: 2,
              children: [
                {
                  definition: assetCollateralAssetType,
                  id: 3,
                  children: [
                    {
                      definition: assetTypeEquityType,
                      id: 4,
                      value: ['ORDINARY'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const expectedJsonOutput = {
      criteria: [
        {
          collateralCriteria: {
            AssetType: {
              equityType: 'ORDINARY',
            },
          },
        },
      ],
    };

    const exported = service.export(inputJsonRootNode);

    expect(exported).toEqual(expectedJsonOutput);
  });
});
