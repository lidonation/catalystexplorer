# CatalystExplorer

**CatalystExplorer** is an open-source research, analytics, and business acceleration platform designed to explore, analyze, and accelerate Project Catalyst proposals and outcomes. Built using a Laravel backend, Inertia.js with React frontend, and PostgreSQL for database management, this repository provides robust tools for in-depth research, dynamic analytics, and comparative analysis.

## Project Overview
CatalystExplorer aims to make Project Catalyst data more accessible and actionable. It offers zero-click insights, proposal comparisons, and deep research capabilities, empowering users to make informed decisions and collaborate effectively.

## Features
- **Zero-Click Insights:** Answer frequently asked questions with no interaction.
- **Deep Proposal Research:** Aggregated funding, milestones, and review data.
- **Dynamic Charts & Analysis:** Fund trends and other visual metrics.
- **Proposal Comparisons:** Stack multiple proposals side-by-side.
- **Jormungandr Explorer:** Access and analyze on-chain voting records.

## Prerequisites
- PHP 8.3+
- Node.js 16+
- Composer 2.7+
- PostgreSQL 16+
- Laravel 8.x
- Inertia.js 2.0+
- React 17+

## Project Status
The CatalystExplorer project is currently in active development. 

**Badges:**  
![Build Status](https://img.shields.io/github/actions/workflow/status/your-organization/catalystexplorer/ci.yml?branch=main)
![Test Coverage](https://img.shields.io/codecov/c/github/your-organization/catalystexplorer)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![GitHub issues](https://img.shields.io/github/issues/your-organization/catalystexplorer)



### Get up and running
1) Clone this repository: `https://gitlab.lidonation.com/lidonation/www.catalystexplorer.com.git`    
2) cd into the project directory: `cd www.catalystexplorer.com`  
2) copy thr example.env to the .env file `cp application/.env.example application/.env`
4) Run `make init` to install all frontend and backend dependencies and start the docker services.
5) Run `make vite` to start the vite dev server and watch for changes.
7) Navigate to `http://localhost` in your browser.         


# Makefile Commands
* [dev](#dev)

* [watch](#watch)

* [backend-install](#backend-install)

* [frontend-install](#frontend-install)

* [frontend-clean](#frontend-clean)

* [rm](#rm)
 
* [down](#down)

* [up](#up)
* 
* [test](#test)


## watch
`make watch`  
Starts vite dev server and watches for changes.

## backend-install
`make backend-install`  
Installs laravel composer dependencies.

## frontend-install
`make frontend-install`  
Delete and reinstall node_modules.

## frontend-clean
`make frontend-clean`  
Delete node_modules, lock files and yarn cache.

## rm
`make rm`  
remove all docker containers and volumes.

## down
`make down`  
shutdown all docker containers but keep volumes.

## up
`make up`  
start docker containers.


## test-backend
`make test-backend`  
Run pest php tests.


## Contributing
We welcome contributions from the community! Please check out our [Contribution Guidelines](CONTRIBUTING.md) for more information.

## License
This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE.md) file for more details.

## Contact
For more details, visit [CatalystExplorer](https://www.catalystexplorer.com) or reach out to our [team](https://www.lidonation.com).

## Authors and acknowledgment
coming soon