[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://community.finos.org/docs/governance/Software-Projects/stages/incubating)

# CDM Object Builder

This project is a utility tool for dynamically generating Common Domain Model<sup>TM</sup> (CDM)  objects using a visual UI builder which can then be reviewed. 

The tool provides functionality for navigating the CDM<sup>TM</sup> starting at a root type and traversing its nodes (attributes) to build up an object visually in the user interface.

The version of the CDM<sup>TM</sup> used is fixed at build time in the model file ./ui/src/app/modules/builder/services/builder-api.model.ts. 

The Common Domain Model<sup>TM</sup> is a registered trademark of FINOS. For more information please visit https://cdm.finos.org/

## Installation

To start the web-based user interface locally, navigate to the ./ui folder and run 
```sh
npm ci
npm start 
```

## Usage example

A use case for the Object Builder is the selection of Eligible Collateral Schedules.


## 

## Development setup for updating the CDM version

### Basic Method

There is an `npm` command that is set up to update to the latest model version. The command assumes that `mvn` and `java` are installed.

Steps:
1. Run the command `cd ui && npm run update-model`
2. Check the file `ui/src/app/modules/builder/services/builder-api.model.ts` is updated.
3. Create a PR, Review and Merge.

### Advanced setup


To update the version of the model used by this tool execute the Java utility.

Steps:

1. Update the `finos.cdm.version` property in the pom.xml file to match the [version](https://github.com/finos/common-domain-model/releases) of the [cdm](https://github.com/finos/common-domain-model)
2. Update the `rosetta.dsl.version` property in the pom.xml to the DSL version used in the CDM (See pom.xml in the [cdm](https://github.com/finos/common-domain-model) project to get the correct version)
3. Build the set up tool using `mvn`

```sh
cd setup
mvn clean install
```

4. Run the executable jar file - this will update the `builder-api.model.ts` file to support the given cdm version.

```sh
java -jar target/object-builder-0.0.0.master.jar ../ui/src/app/modules/builder/services/builder-api.model.ts org.finos.cdm cdm-java
```

5. Commit the `builder-api.model.ts` file in a new PR.

Example:

![2023-11-22 15 34 15 (1)](https://github.com/finos/cdm-object-builder/assets/19842097/855de77c-49c2-4d43-bcf1-c2eeff451e2c)


## Roadmap



## Contributing
For any questions, bugs or feature requests please open an [issue](https://github.com/finos/cdm-object-builder/issues)
For anything else please send an email to help@finos.org.

To submit a contribution:
1. Fork it (<https://github.com/finos/cdm-object-builder/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Read our [contribution guidelines](.github/CONTRIBUTING.md) and [Community Code of Conduct](https://www.finos.org/code-of-conduct)
4. Commit your changes (`git commit -am 'Add some fooBar'`)
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

_NOTE:_ Commits and pull requests to FINOS repositories will only be accepted from those contributors with an active, executed Individual Contributor License Agreement (ICLA) with FINOS OR who are covered under an existing and active Corporate Contribution License Agreement (CCLA) executed with FINOS. Commits from individuals not covered under an ICLA or CCLA will be flagged and blocked by the FINOS Clabot tool (or [EasyCLA](https://community.finos.org/docs/governance/Software-Projects/easycla)). Please note that some CCLAs require individuals/employees to be explicitly named on the CCLA.

*Need an ICLA? Unsure if you are covered under an existing CCLA? Email [help@finos.org](mailto:help@finos.org)*

## License

Copyright 2022 ISDA isdalegal@isda.org

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
