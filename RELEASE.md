# _Fix: Allow multiple selections for multi‑cardinality enums in Object Builder_

## Background

As outlined in issue [#131](https://github.com/finos/cdm-object-builder/issues/131), the Object Builder UI did not allow selecting more than one value for enumeration fields whose upper bound is greater than 1. This prevented users from correctly modelling CDM objects that require multiple enum values.

## User impact

- Affected area: Object Builder UI → enum fields with upper bound > 1.
- Symptom: Only a single value could be chosen from the dropdown; there was no mechanism to add additional values.
- Effect: Users could not construct valid objects when the model expects multiple enum values.

## Reproduction

1. Navigate to an enum with multiple cardinality in the Object Builder, e.g.:
   `LegalAgreement -> agreementTerms -> agreement -> creditSupportAgreementElections -> conditionsPrecedent -> specifiedCondition -> partyElection -> specifiedCondition`
2. Attempt to add more than one value.

Expected: A mechanism exists to add multiple values (e.g., an Add button or repeatable tiles).

Actual: Only one value can be selected from the dropdown.

## What’s changed

Added handlers in the node data services to make them aware of multi cardinality enum nodes, and updated the UI to support multiple values.

Files modified:

- `ui/src/app/modules/builder/services/node-database.service.ts`
- `ui/src/app/modules/builder/utils/node.util.ts`
- `ui/src/app/modules/builder/utils/type-guards.util.ts`
