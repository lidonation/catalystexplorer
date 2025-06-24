# Contribution Guidelines

Thank you for considering contributing to **CatalystExplorer**! 
We welcome contributions from the community to help improve and expand the platform. 
Please read these guidelines to understand how to contribute effectively.

## How to Contribute

### 1. Fork the Repository
- Start by [forking the repository](hhttps://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com).
- Clone the forked repo to your local machine.

### 2. Create a Feature Branch
Create a feature branch for your changes:
```bash
git checkout -b feature/your-feature-name
```
When writing commit messages, please follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format:
```<type>[optional scope]:<ticket-no> <description>```
ie:
```bash
git commit -m "feat(homepage): ln-1343 added quick pitches to homepage."
git commit -m "fix(ideascale profiles): ln-1545 fixed bug in search bar."
git commit -m 'docs(readme.md): ln-1448 Added documentation for community review score calculation.'
git commit -m 'style(proposals page): ln-1640 Updated styling for search bar.'
git commit -m 'refactor(global search): ln-1542 Refactored search bar component.'
git commit -m 'perf(global search): ln-3343 Improved search bar performance.'
git commit -m 'test(reviews): ln-1443 Added unit tests for search bar.'
git commit -m 'chore(app): ln-2343 Updated dependencies.'
```

### 3. Implement and Test
- Implement your changes with appropriate comments and documentation.
- Ensure all tests pass before submitting.

### 4. Submit a Pull Request
- Push your branch to your forked repo.
- Open a Pull Request (PR) to the `main` branch of the original repository.
- Fill out the PR template and describe your changes.

### 5. Code Review and Discussion
- Participate in discussions and be responsive to feedback.
- Make revisions if requested.

## Code Style
- See the [STYLEGUIDE](./STYLEGUIDE.md) for coding styles, required, and best practices.

## Reporting Issues
If you find bugs or have feature requests, please open an issue in the [Issues section](https://gitlab.2lovelaces.io/lidonation/www.catalystexplorer.com/-/issues).

## License
By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
