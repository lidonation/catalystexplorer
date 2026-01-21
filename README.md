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

- Docker Desktop  
  - Make sure Docker Desktop is up to date. Outdated versions may lead to unexpected behavior.
  - If using WSL, open Docker Desktop, go to **Settings → Resources → WSL Integration**, and ensure your default WSL distro is enabled.
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
[![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/lidonation%2Fwww.catalystexplorer.com?gitlab_url=https%3A%2F%2Fgitlab.lidonation.com%2F&branch=main)](https://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com/-/pipelines)
![Test Coverage](https://img.shields.io/codecov/c/github/lidonation%2Fwww.catalystexplorer.com/main)
[![GitLab License](https://img.shields.io/gitlab/license/lidonation%2Fwww.catalystexplorer.com?gitlab_url=https%3A%2F%2Fgitlab.lidonation.com%2F&color=blue)](https://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com/-/blob/main/LICENSE.md?ref_type=heads)
[![GitLab Issues](https://img.shields.io/gitlab/issues/all/lidonation%2Fwww.catalystexplorer.com?gitlab_url=https%3A%2F%2Fgitlab.lidonation.com%2F&labelColor=orange&color=green)](https://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com/-/issues)

### Get up and running

1. Clone this repository:  
   `git clone https://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com.git`

2. Change into the project directory:  
   `cd www.catalystexplorer.com`

3. Copy the example environment file:  
   `cp application/.env.example application/.env`  
   Edit `.env` as needed.

4. Obtain your organization's `auth.json` (available on request) and place it in `application/auth.json` **before running any commands**.

5. Run `make init` to install all frontend and backend dependencies, run database migrations, and start the Docker services.

   > **Note for WSL users:**  
   > If you encounter out-of-memory errors during Docker builds, increase swap space:  
   > ```bash
   > sudo fallocate -l 4G /swapfile
   > sudo chmod 600 /swapfile
   > sudo mkswap /swapfile
   > sudo swapon /swapfile
   > ```
   > To make swap permanent, add this line to `/etc/fstab`:  
   > `/swapfile none swap sw 0 0`

6. (Optional, but recommended) Set up HTTP/3 and HTTPS for local development 
    See the “HTTP/3 Setup” section in [WARP.md](WARP.md)
  
7. Run `make vite` to start the Vite dev server and watch for changes.

8. Navigate to `https://catalystexplorer.local` in your browser (use HTTPS).  
   - If you see a certificate warning, ensure your certificate is trusted as described above.


# Makefile Commands

* [dev](#dev)
* [watch](#watch)
* [backend-install](#backend-install)
* [frontend-install](#frontend-install)
* [frontend-clean](#frontend-clean)
* [rm](#rm)
* [down](#down)
* [up](#up)
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

## create meilisearch indexed

`make create-index` ##For creating all indices for all models, 

`make create-index proposal` ##To create for individual models pass the model name 

`make import-index` ##for loading the document to meili, also accepts argument

`make flush-index` ##for flushing the document to meili, also accepts argument

`make delete-index` ##for flushing the document to meili, also accepts argument


## create indexDb tables
In the `application/resources/js/scripts/generateDbSchema.ts` file you can declare the table and the type to be infered, we also generate the columns from the type keys here is the object you wan to update for this 

```ts
const typeTableMap: Record<string, string> = {
    "ideascale_profile_data": 'IdeascaleProfileData',
};
```

Notice the types match the genarated types name from our dto, we do this for consistency and eas of maintainance.

After updating this object runs `make db-schema` to generate the schema that indexDb will use to create the tables. You can verify this in `application/resources/js/db/generated-db-schema.ts`

```ts
// Auto-generated. Do not edit manually.

export const TABLE_INDEXES = {
    "ideascale_profile_data": "hash, ideascaleId, username, email..."
};

export interface DbModels {
    "ideascale_profile_data": App.DataTransferObjects.IdeascaleProfileData;

}

```

## 🔍 Meilisearch Index Management

This command helps manage your search indexes (create, import, flush, delete) and seeding logic directly from Laravel Artisan.

##### Usage

```bash
# Seed the search index
php artisan search:index seed

# Create index for all models
php artisan search:index create

# Create index for models that match a keyword
php artisan search:index create Profile

# Import all models to index
php artisan search:index import

# Import specific model(s) matching a keyword
php artisan search:index import Voter

# Flush all indexes
php artisan search:index flush

# Delete all known index names
php artisan search:index delete

# Delete indexes matching keyword
php artisan search:index delete proposal

```
##### Models supported
```
App\Models\Voter
App\Models\BookmarkCollection
App\Models\ProjectSchedule
App\Models\Community
App\Models\Proposal
App\Models\IdeascaleProfile
App\Models\Group
App\Models\Review
App\Models\MonthlyReport
App\Models\Transaction
App\Models\VoterHistory

```
##### Index Names
```
cx_bookmark_collections
cx_proposals
cx_communities
cx_ideascale_profiles
cx_monthly_reports
cx_review
cx_groups
cx_transactions
cx_voter_histories
```

## Contributing

We welcome contributions from the community! Please check out our [Contribution Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE.md) file for more details.

## Contact

For more details, visit [CatalystExplorer](https://www.catalystexplorer.com) or reach out to our [team](https://www.lidonation.com).

## Authors and acknowledgment

coming soon
