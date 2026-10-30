import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TabularViewComponent } from './tabular-view.component';

describe('TabularViewComponent', () => {
  let component: TabularViewComponent;
  let fixture: ComponentFixture<TabularViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabularViewComponent],
      schemas:[NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TabularViewComponent);
    component = fixture.componentInstance;
    component.cdmJson = sampleJson;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render EligibleCollateralSpecification with Money attribute without row spillover', () => {
    const eligibleCollateralWithMoney = {
      '@model': 'cdm',
      '@type': 'cdm.product.collateral.EligibleCollateralSpecification',
      '@version': '7.0.0',
      criteria: [
        {
          collateralCriteria: {
            '@type': 'cdm.base.staticdata.asset.common.AssetType',
            assetType: 'SECURITY',
          },
          treatment: {
            concentrationLimit: [
              {
                valueLimit: {
                  upperBound: {
                    inclusive: true,
                    money: {
                      unit: {
                        currency: {
                          '@data': 'USD',
                        },
                      },
                      value: 15000000,
                    },
                  },
                },
              },
            ],
            isIncluded: true,
          },
        },
      ],
    };

    component.cdmJson = eligibleCollateralWithMoney;

    expect(component.gridData.style).toEqual({
      'grid-template-columns': 'repeat(9, 1fr)',
      'grid-auto-flow': 'row',
    });

    const itemsByName = (name: string) =>
      component.gridData.items.filter(item => item.name === name);

    expect(itemsByName('criteria')[0].style).toEqual({
      'grid-column': 'span 1 / auto',
      'grid-row': 'span 5 / auto',
    });
    expect(itemsByName('money')[0].style).toEqual({
      'grid-column': 'span 1 / auto',
      'grid-row': 'span 2 / auto',
    });
    expect(itemsByName('unit')[0].style).toEqual({
      'grid-column': 'span 1 / auto',
      'grid-row': 'span 1 / auto',
    });
    expect(itemsByName('currency')[0].style).toEqual({
      'grid-column': 'span 1 / auto',
      'grid-row': 'span 1 / auto',
    });
    expect(itemsByName('USD')[0]).toEqual(
      jasmine.objectContaining({
        leaf: true,
        depth: 9,
        columnIndex: 9,
        style: {
          'grid-column': 'span 1 / auto',
          'grid-row': 'span 1 / auto',
        },
      })
    );
    expect(itemsByName('value')[0].style).toEqual({
      'grid-column': 'span 2 / auto',
      'grid-row': 'span 1 / auto',
    });
    expect(itemsByName(15000000 as any)[0]).toEqual(
      jasmine.objectContaining({
        leaf: true,
        depth: 8,
        columnIndex: 9,
        style: {
          'grid-column': 'span 1 / auto',
          'grid-row': 'span 1 / auto',
        },
      })
    );
  });

  it('should swap row and column spans when transposed', () => {
    component.toggleTranspose();
    expect(component.gridData.style).toEqual({
      'grid-template-rows': 'repeat(6, 1fr)',
      'grid-auto-flow': 'column',
    });
  });

  const sampleJson = {
    meta: {
      externalKey: 'party2',
      globalKey: '490e5f44',
    },
    name: {
      value: 'Party B',
    },
    partyId: [
      {
        identifier: {
          meta: {
            scheme: 'http://www.fpml.org/coding-scheme/external/iso17442',
          },
          value: '48750084UKLVTR22DS78',
        },
        identifierType: 'LEI',
        meta: {
          globalKey: 'de31bddc',
        },
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
              meta: {
                globalKey: 'baeb8c0d',
              },
            },
          },
        ],
      },
    ],
  };
});
