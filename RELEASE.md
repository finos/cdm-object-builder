# _Fix - Add multiple cardinality enums_

_Background_

As outlined in issue [#131](https://github.com/finos/cdm-object-builder/issues/131) there is a bug where we are not able to add more than one enum even when it's upper bound is greater than 1.

_What is being released?_

Fixed the following TypeScript files to respect multiple cardinality enums:

- `ui/src/app/modules/builder/services/node-database.service.ts`
- `ui/src/app/modules/builder/utils/node.util.ts`
- `ui/src/app/modules/builder/utils/type-guards.util.ts`