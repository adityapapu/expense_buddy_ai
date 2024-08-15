# Expense Buddy AI

Expense Buddy AI is a web application designed to help users manage their finances, track expenses, and create budgets. Built with Next.js and Prisma, this app leverages AI for enhanced user experiences.

## Table of Contents
- [Features](#features)
- [AI Capabilities](#ai-capabilities)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Open Source Contribution](#open-source-contribution)
- [Creating Issues](#creating-issues)
- [Roadmap](#roadmap)
- [Scripts](#scripts)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features
- **User Authentication**: Secure authentication using Google Auth with NextAuth.
- **Expense Tracking**: Track expenses with categories, tags, and split bill capabilities.
- **Budget Management**: Create and manage budgets with custom categories and tags.
- **Recurring Expenses**: Set up recurring expenses with customizable frequencies.
- **Audit Logs**: Keep track of changes within the application.
- **Responsive UI**: Built with Next.js and NextUI for a seamless experience across devices.

## AI Capabilities
- **Intelligent Expense Categorization**: Automatically categorize expenses based on descriptions and past patterns.
- **Predictive Budgeting**: Get budget suggestions based on past spending habits.
- **Smart Notifications**: Receive notifications for upcoming bills, recurring expenses, and budget overspending.
- **Expense Insights**: Gain insights into spending patterns with AI-powered analytics.
- **Natural Language Input**: Add expenses and other records using natural language, powered by Vercel AI SDK.

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Node.js v18.x or later
- npm or yarn
- PostgreSQL database

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/expense_buddy_ai.git
   cd expense_buddy_ai
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file at the root of the project and configure the following environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/expense_buddy_ai"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

## Database Setup
1. Generate the Prisma client and apply migrations:
   ```bash
   npm run db:generate
   ```

2. Push the Prisma schema to the database:
   ```bash
   npm run db:push
   ```

3. Open Prisma Studio (GUI for your database):
   ```bash
   npm run db:studio
   ```

## Running the Application
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

To build the application for production:
```bash
npm run build
```

To start the application in production mode:
```bash
npm start
```

## Deployment
You can easily deploy Expense Buddy AI to Vercel with a single click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Open Source Contribution
Contributions are welcome! If you would like to contribute to the project, please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## Creating Issues
If you encounter any bugs or have feature requests, please create an issue on the [GitHub Issues](https://github.com/your-username/expense_buddy_ai/issues) page.

## Roadmap
Check out our [Project Roadmap](https://github.com/your-username/expense_buddy_ai/projects) to see upcoming features and improvements.

## Scripts
- **`build`**: Builds the Next.js application for production.
- **`db:generate`**: Generates Prisma client and applies migrations in development.
- **`db:migrate`**: Deploys migrations to the production database.
- **`db:push`**: Pushes the Prisma schema state to the database.
- **`db:studio`**: Opens Prisma Studio.
- **`dev`**: Starts the Next.js development server.
- **`postinstall`**: Runs Prisma generate after dependencies are installed.
- **`lint`**: Runs ESLint to check for code quality issues.
- **`start`**: Starts the Next.js application in production mode.

## Technologies Used
- **Next.js**: A React framework for building web applications.
- **Prisma**: A database ORM for TypeScript and Node.js.
- **NextAuth.js**: Authentication for Next.js applications.
- **Vercel AI SDK**: Enhancing user experience with AI-driven features.
- **Tailwind CSS**: A utility-first CSS framework.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Zod**: A TypeScript-first schema declaration and validation library.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
