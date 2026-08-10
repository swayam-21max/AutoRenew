-- PolicyPulse — Vehicle Compliance Reminder System Database Schema
-- Compatible with Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    notification_preference VARCHAR(30) DEFAULT 'EMAIL',
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(100) NOT NULL,
    insurance_expiry DATE,
    puc_expiry DATE,
    road_tax_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_number ON vehicles(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance ON vehicles(insurance_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_puc ON vehicles(puc_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_road_tax ON vehicles(road_tax_expiry);

-- ============================================
-- REMINDER LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL, -- 'INSURANCE', 'PUC', 'ROAD_TAX'
    days_before INT DEFAULT 0,
    recipient_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED'
    error_message TEXT,
    notification_channel VARCHAR(20) DEFAULT 'EMAIL',
    provider VARCHAR(50),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_vehicle_id ON reminder_logs(vehicle_id);

-- Prevent duplicate reminders for the same vehicle, reminder type, and days before
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vehicle_reminder_days
    ON reminder_logs(vehicle_id, reminder_type, days_before);
