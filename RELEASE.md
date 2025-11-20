# _Fix — Rendering of Time Fields in Builder_

_Background_

As outlined in issue [#132](https://github.com/finos/cdm-object-builder/issues/132), the `time` type (e.g. `hourMinuteTime`) was renders incorrectly on the Object Builder screen. Users navigating to a Time field see an empty box without the ability to add a time value.

_What is being released?_

- Fixes the UI rendering so Time fields display the correct input control and accept values as expected.
- Ensures the `hourMinuteTime` node is recognized and handled by the builder.
- Adds/updates component logic and template bindings to properly render and validate `time` inputs.
- Improves test coverage around Time node rendering and interactions.

_Affected files_

- `ui/src/app/modules/builder/components/time-node/time-node.component.ts`
- `ui/src/app/modules/builder/components/time-node/time-node.component.html`
- `ui/src/app/modules/builder/components/time-node/time-node.component.spec.ts`
- `ui/src/app/modules/builder/components/node-details/node-details.component.ts`
- `ui/src/app/modules/builder/components/node-details/node-details.component.html`

_Review Directions_

1) Follow the steps above to navigate to `hourMinuteTime`.
2) Confirm a time input renders, allowing entry/selection of a time value.
3) Ensure the value is persisted and correctly reflected in the node details.
