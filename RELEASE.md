# _Fix — Correct Time type rendering on the Builder screen_

_Background_

As outlined in issue [#132](https://github.com/finos/cdm-object-builder/issues/132), the Time type (e.g. `hourMinuteTime`) was rendering incorrectly on the Object Builder screen. Users navigating to a Time field saw an empty box without the ability to add a time value.

Steps to reproduce (summary):

- Add a `LegalAgreement` as a root type, then navigate via:
  `agreementTerms → agreement → creditSupportAgreementElections → calculationAndTiming → notificationTime → partyElections → notificationTime → hourMinuteTime`.
- Expected: an empty time input with the ability to add a time value.
- Actual: a blank square with no option to enter time.

_What is being released?_

- Fixes the UI rendering so Time fields display the correct input control and accept values as expected.
- Ensures the `hourMinuteTime` node is recognized and handled by the builder.
- Adds/updates component logic and template bindings to properly render and validate Time inputs.
- Improves test coverage around Time node rendering and interactions.

_Files/areas touched_

- `ui/src/app/modules/builder/components/time-node/time-node.component.ts`
- `ui/src/app/modules/builder/components/time-node/time-node.component.html`
- `ui/src/app/modules/builder/components/time-node/time-node.component.spec.ts`
- `ui/src/app/modules/builder/components/node-details/node-details.component.ts`
- `ui/src/app/modules/builder/components/node-details/node-details.component.html`

_Verification_

1) Follow the steps above to navigate to `hourMinuteTime`.
2) Confirm a time input renders, allowing entry/selection of a time value.
3) Ensure the value is persisted and correctly reflected in the node details.
