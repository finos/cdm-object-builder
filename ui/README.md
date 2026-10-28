# Ui

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Dependency overrides

`package.json` uses npm `overrides` to pin `uuid` to `11.1.1` for `sockjs` only. `sockjs` is pulled in by `webpack-dev-server` (via `@angular-devkit/build-angular`) and still requests `uuid@^8`, which is no longer supported. `sockjs` only calls `uuid.v4()`, which is unchanged in 11.x, and it is a dev-tooling dependency that does not end up in the application bundle.

Note that `overrides` is npm-specific. If this project ever moves to another package manager, this needs to be translated (`resolutions` for Yarn, `pnpm.overrides` for pnpm).

### Reviewing the override at the next Angular major

This pin is a workaround, not a permanent fix. It should be re-checked whenever `@angular-devkit/build-angular` gets a major bump, since the dependency chain it works around may be gone by then. The chain is:

```
@angular-devkit/build-angular -> webpack-dev-server -> sockjs -> uuid
```

`webpack-dev-server` is only installed because `@angular-devkit/build-angular` depends on it. It does not serve this app: the `serve` target delegates to the Vite-based dev server in `@angular/build`, because the `build` target uses the `application` builder.

To review it:

1. Bump Angular as usual, then delete the `overrides` block from `package.json` and run `npm install --ignore-scripts`.
2. Run `npm ls uuid`. If `sockjs` is gone, or it now asks for a `uuid` version that is still supported, leave the block out — the workaround is no longer needed.
3. If `npm ls uuid` still reports `uuid@8` under `sockjs`, restore the block. Keep the pin at the highest `uuid` major that still ships a CommonJS build, since `sockjs` uses `require()`. Confirm what it actually calls — it should be `v4()` only:

   ```
   grep -rn "require('uuid')" node_modules/sockjs/lib
   ```

4. Either way, verify before committing: `npm ci`, `ng build`, `ng test`, and `npm audit`. Because this is build tooling, `ng build` output should be unchanged — comparing file names and sizes under `dist/ui` against a build from the previous commit is a quick way to confirm that.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
