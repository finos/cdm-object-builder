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

## Build system

This project uses the `@angular/build` builders (esbuild and Vite). `ng build` writes to `dist/ui/browser`, which is what `netlify.toml` publishes, and `ng serve` runs the Vite dev server.

The older `@angular-devkit/build-angular` package is no longer a dependency, so webpack and `webpack-dev-server` are not part of the dependency tree. If a future change needs a custom webpack configuration, that package (or `@angular-builders/custom-webpack`) would have to be reintroduced deliberately.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
