# Money Keeper

## Introduction

Money Keeper Server built with **NestJS** and **TypeORM**. It helps you track your personal or business finances by managing income and expense transactions. The application provides a modular structure with clean code, making it easy to maintain and extend.

## Features

- **Transaction Management:**  
  Add, update, and delete transactions.
- **Categorization:**  
  Organize transactions by categories (income, expense, etc.).
- **Account Management:**  
  Support multiple accounts and account types with balance tracking.
- **Reporting:**  
  View account balances and generate basic financial reports.
- **Configuration:**  
  Environment configuration is managed with `.env` files and validated using Joi.

## Technologies Used

- **NestJS:**  
  A framework for building efficient, scalable Node.js server-side applications.
- **TypeORM:**  
  An ORM (Object-Relational Mapper) that simplifies database operations in NestJS.
- **PostgreSQL:**  
  A powerful open-source relational database used to store application data.
- **Joi:**  
  A library used to validate environment variables and ensure correct configuration.
- **@nestjs/config:**  
  A module to load and manage environment variables in a NestJS application.
- **class-validator:**  
  Provides declarative validation in your DTOs and entities.

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/duc30012001/money-keeper-server.git
    cd money-keeper-server
    ```
