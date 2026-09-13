# Enhanzer Full Stack Assignment - Purchase Bill Portal

This repository contains a Full Stack Web Application developed for the Enhanzer assignment. It features a secure Login Module and a dynamic Purchase Bill interface, demonstrating clean component-based architecture, REST API integration, and dynamic real-time calculations.

## 🚀 Technologies Used
* **Frontend:** Angular (Latest), TypeScript, HTML5, CSS3
* **Backend:** ASP.NET Core (.NET 8), C#
* **Database:** SQL Server
* **Authentication:** Session Storage & Route Guards (authGuard)

## ✨ Core Features
* **Authentication:** Validates user credentials against an external API and secures routes using `localStorage` session handling.
* **Database Integration:** Automatically retrieves and stores `Location_Details` (Location Code & Name) upon a successful login.
* **Autocomplete Item Selection:** Seamlessly filters through predefined items (Mango, Apple, etc.) as the user types.
* **Dynamic Table & Calculations:** Calculates Total Cost (`(Std Cost * Qty) - Discount%`) and Total Selling (`Std Price * Qty`) in real-time.
* **Financial Summary Panel:** Instantly updates the Gross Total, Total Items, and Net Total automatically as rows are added or removed.

## ⚙️ Setup Instructions

### 1. Database Setup
1. Open SQL Server Management Studio (SSMS).
2. Execute the provided `Database_Script.sql` file to create the database and the `Location_Details` table.
3. Open `appsettings.json` in the `EnhanzerSellsWeb` backend folder and update the `DefaultConnection` string with your local SQL Server credentials.

### 2. Backend Setup (.NET 8 API)
1. Navigate to the backend directory:
   ```bash
   cd EnhanzerSellsWeb
