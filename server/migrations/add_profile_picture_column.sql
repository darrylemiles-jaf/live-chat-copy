-- Migration: Add profile_picture column to users table
-- Date: 2026-02-19
-- Description: Adds profile_picture column to store user profile images from API

-- Add profile_picture column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL 
AFTER phone;

-- Create index for faster lookups (optional)
-- CREATE INDEX idx_profile_picture ON users(profile_picture);
