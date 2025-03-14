# Energia Project

## Overview
Energia is a React application designed for managing and tracking home usage statistics. It provides users with the ability to view details about specific homes, including their usage history, costs, and other relevant statistics.

## Project Structure
The project is organized into several key directories:

- **app/**: Contains the main application files.
  - **homes/**: Contains components and pages related to individual homes.
    - **[id]/**: Dynamic routing for home details.
      - **page.tsx**: Displays details about a specific home and its usage history.
  - **statistics/**: Contains the statistics page for tracking home usages.
    - **page.tsx**: Will display overall usage statistics and breakdowns by home.

- **components/**: Contains reusable UI components.
  - **HomeButtons.tsx**: Manages home-related actions such as adding and deleting homes.
  - **ui/**: Contains various UI components like buttons, cards, dialogs, and tooltips.

- **lib/**: Contains utility functions and TypeScript types.
  - **types.ts**: Defines TypeScript types used throughout the application.
  - **utils.ts**: Contains utility functions for data manipulation and formatting.

- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file specifying compiler options.

## Features
- **Home Management**: Users can view, add, and delete homes.
- **Usage Tracking**: Users can track energy usage and costs associated with each home.
- **Statistics Page**: A dedicated page for viewing overall usage statistics across all homes.

## Getting Started
To get started with the Energia project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd energia
npm install
```

Then, you can run the application:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser to view the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.