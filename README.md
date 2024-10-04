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



## Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-organization/catalystexplorer.git
   cd catalystexplorer
   ```

2. **Install Backend Dependencies:**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   yarn install
   ```

4. **Configure Environment Variables:**
   copy `.env.example` to `.env` and update the following variables:

   ```
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=catalystexplorer
   DB_USERNAME=your_postgres_user
   DB_PASSWORD=your_postgres_password
   ```

5. **Run Migrations and Seed Database:**
   ```bash
   php artisan migrate --seed
   ```

6. **Start the Development Server:**
   ```bash
   php artisan serve
   npm run dev
   ```

7. **Access the Application:**
   Open [http://localhost:8000](http://localhost:8000) in your browser.

## Contributing
We welcome contributions from the community! Please check out our [Contribution Guidelines](CONTRIBUTING.md) for more information.

## License
This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE.md) file for more details.

## Contact
For more details, visit [CatalystExplorer](https://www.catalystexplorer.com) or reach out to our [team](https://www.lidonation.com).

## Authors and acknowledgment
coming soon