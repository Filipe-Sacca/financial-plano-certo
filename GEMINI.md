# Gemini Code Assistant Context: PlanoCerto Delivery / iFood Integration Hub

This document provides a comprehensive overview of the "iFood Integration Hub" project for the Gemini Code Assistant.

## 1. Project Overview

This is a complex, polyglot system designed to integrate with the iFood delivery platform. Its primary purpose is to manage and synchronize data between a "Plano Certo" system and iFood, focusing on merchants, products, and orders.

The system's core feature is the **automatic renewal of iFood API tokens every 3 hours**, ensuring uninterrupted communication. It also includes a web-based dashboard for monitoring and management, and a suite of automation workflows.

### Key Technologies:
- **Backend:** A hybrid approach using both **Node.js/TypeScript** (for the critical token renewal service) and **Python** (for data synchronization and general scripting).
- **Frontend:** A modern **React + Vite + TypeScript** application serves as the monitoring and management dashboard, styled with **Tailwind CSS** and **shadcn/ui**.
- **Database:** **Supabase** is used for data persistence.
- **Automation:** **n8n** workflows are utilized for automated tasks like creating and updating tokens, merchants, and products.
- **Scripting:** A combination of Python (`run.py`) and Node.js (`scripts-utils/`) scripts provide a CLI for managing the system.

### Architectural Components:
- `src/`: Main Python source code for data synchronization (`ifood_product_sync.py`) and the main entrypoint (`run.py`).
- `services/ifood-token-service/`: The critical Node.js microservice responsible for the 3-hour automatic iFood token renewal.
- `frontend/plano-certo-hub-insights/`: The React-based web dashboard for real-time monitoring and interaction.
- `n8n-workflows/`: A collection of JSON files defining automation workflows for n8n.
- `database/` & `supabase/`: Contains SQL schemas and migrations.
- `scripts/` & `scripts-utils/`: Utility and maintenance scripts for various operational tasks.
- `setup/`: Installation and setup scripts for the project.

## 2. Building and Running the Project

### Initial Setup
To install all dependencies for the various parts of the project (Node, Python), run the master setup script:
```bash
npm run setup
```
You must also create a `.env` file in the project root with the following variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
IFOOD_API_BASE_URL=https://merchant-api.ifood.com.br
```

### Key Development Commands

- **Run the Frontend Dashboard:**
  ```bash
  npm run dev:frontend
  ```
  The dashboard will be available at `http://localhost:5173` (or `http://localhost:8082` as per other docs).

- **Run the Token Renewal Service (Backend):**
  ```bash
  npm run dev:token-service
  ```

- **Run Python Scripts (via master runner):**
  The `run.py` script is the main entry point for Python-based tasks.
  ```bash
  # Check the overall system status
  python run.py --status

  # Run data synchronization with iFood
  python run.py --sync

  # Check the status of iFood API tokens
  python run.py --token-check
  ```

- **Run Utility Scripts (NPM):**
  The `package.json` provides several wrapper scripts for common operations.
  ```bash
  # Monitor token status in real-time
  npm run token-monitor

  # Check token status
  npm run token-check
  ```

## 3. Development Conventions

- **Polyglot Environment:** Development requires proficiency in both Python and Node.js/TypeScript.
- **Configuration via `.env`:** All sensitive keys and environment-specific URLs are managed in a `.env` file at the root.
- **Master Runner Script:** The `run.py` script acts as a centralized command runner for Python-related logic, simplifying interaction.
- **NPM as a Task Runner:** The root `package.json` contains scripts that orchestrate the various sub-projects (frontend, backend services), providing a unified command interface.
- **Database Migrations:** Database schema changes are managed through SQL files located in the `database/migrations` and `database/supabase` directories.
- **Documentation:** The `/docs` directory contains essential project documentation, including architecture and setup guides.
