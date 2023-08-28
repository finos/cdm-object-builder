[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://community.finos.org/docs/governance/Software-Projects/stages/incubating)

# Object Builder

This project is a utility tool for dynamically generating Common Domain Model<sup>TM</sup> (CDM)  objects using a visual UI builder which can then be reviewed. 

The tool provides functionality for navigating the CDM<sup>TM</sup> starting at a root type and traversing its nodes (attributes) to build up an object visually in the user interface.

The version of the CDM<sup>TM</sup> used is fixed at build time in the model file ./ui/src/app/modules/builder/services/builder-api.model.ts. 

The Common Domain Model<sup>TM</sup> is a registered trademark of FINOS. For more information please visit https://cdm.finos.org/

## Installation

To build and deploy the docker image run the following:

```sh
docker build -t regnosys-docker-registry.jfrog.io/regnosys/poc/cdm-object-builder:mp . && docker push regnosys-docker-registry.jfrog.io/regnosys/poc/cdm-object-builder:mp
```

To start the web-based user interface locally, navigate to the ./ui folder and run 
```sh
npm start 
```

## Usage example

A use case for the Object Builder is the selection of Eligible Collateral Schedules.


## Development setup

To update the version of the model used by this tool  execute the Java utility 
```sh
./server/src/main/java/com/regnosys/TypescriptObjectBuilderModelGenerator.java
```
 and follow the instructions outlined in the main() method.

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
