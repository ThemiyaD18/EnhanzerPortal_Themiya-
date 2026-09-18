-- 1. Create the Database
CREATE DATABASE EnhanzerDB;
GO

USE EnhanzerDB;
GO

-- 2. Create the required Location_Details table
CREATE TABLE Location_Details (
    Location_Code VARCHAR(50) PRIMARY KEY,
    Location_Name VARCHAR(150) NOT NULL
);
GO

-- 3. Insert Sample Data for the Batch Dropdown
INSERT INTO Location_Details (Location_Code, Location_Name) VALUES
('LOC001', 'Block C'),
('LOC002', 'Head Office'),
('LOC003', 'Warehouse 2'),
('LOC004', 'Van 1'),
('LOC005', 'Oman'),
('LOC006', 'New Zealand'),
('LOC007', 'Demo location'),
('LOC008', 'Main Warehouse');
GO

-- 4. Create the PurchaseOrders table
CREATE TABLE PurchaseOrders (
    OrderNumber VARCHAR(50) PRIMARY KEY,
    Product VARCHAR(150),
    DueDate DATETIME,
    DaysLate INT,
    NetAmount DECIMAL(18, 2),
    NumberOfItems INT
);
GO
