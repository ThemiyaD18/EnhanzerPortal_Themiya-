# Enhanzer Full Stack Assignment - Purchase Bill Portal

This repository contains a full-stack web application developed for the Enhanzer assignment. It features a secure login module and a dynamic Purchase Bill interface, demonstrating clean component-based architecture, REST API integration, and real-time calculations.

## 🚀 Technologies Used

- **Frontend:** Angular (Latest), TypeScript, HTML5, CSS3
- **Backend:** ASP.NET Core (.NET 8), C#
- **Database:** SQL Server
- **Authentication:** Session storage & route guards (`authGuard`)

## ✨ Core Features

- **Authentication** — Validates user credentials against an external API and secures routes using `localStorage` session handling.
- **Database Integration** — Automatically retrieves and stores `Location_Details` (Location Code & Name) upon successful login.
- **Autocomplete Item Selection** — Seamlessly filters through predefined items (Mango, Apple, etc.) as the user types.
- **Dynamic Table & Calculations** — Calculates Total Cost (`(Std Cost × Qty) − Discount%`) and Total Selling (`Std Price × Qty`) in real time.
- **Financial Summary Panel** — Instantly updates the Gross Total, Total Items, and Net Total as rows are added or removed.

## ⚙️ Setup Instructions

### 1. Database Setup

1. Open SQL Server Management Studio (SSMS).
2. Execute the provided `Database_Script.sql` file to create the database and the `Location_Details` table.
3. Open `appsettings.json` in the `EnhanzerSellsWeb` backend folder and update the `DefaultConnection` string with your local SQL Server credentials.

### 2. Backend Setup (.NET 8 API)

Navigate to the backend directory:

```bash
cd EnhanzerSellsWeb
```

Restore dependencies and run the application:

```bash
dotnet restore
dotnet run
```

The API will start at `https://localhost:7057` by default.

### 3. Frontend Setup (Angular)

Open a new terminal and navigate to the frontend directory:

```bash
cd EnhanzerClient
```

Install the required Node packages:

```bash
npm install
```

Start the Angular development server:

```bash
ng serve
```

Open your browser and navigate to `http://localhost:4200` to view the application.

## 👨‍💻 Author

**Themiya**
