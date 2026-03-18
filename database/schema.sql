-- AI-Based Social Media Report Generator
-- Database Schema
-- Student: Kushani Maleesha Wickramarathna | K2557717

CREATE DATABASE IF NOT EXISTS smreport_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smreport_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) DEFAULT 'Sri Lanka',
    target_province VARCHAR(100),
    platforms JSON NOT NULL,
    current_followers INT DEFAULT 0,
    monthly_posts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    user_id INT NOT NULL,
    report_title VARCHAR(255),
    ai_response JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_businesses_user ON businesses(user_id);
CREATE INDEX idx_reports_business ON reports(business_id);
CREATE INDEX idx_reports_user ON reports(user_id);
