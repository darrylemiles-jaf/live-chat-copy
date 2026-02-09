const usersTable = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    percentage_income DECIMAL(5,2) DEFAULT 0,
    role ENUM('accountant', 'admin', 'user', 'manager') DEFAULT 'user',
    referral_code VARCHAR(50) NULL,
    referrer_code VARCHAR(50) NULL,
    bank_name VARCHAR(255) NULL,
    bank_account_number VARCHAR(100) NULL,
    ewallet_name VARCHAR(100) NULL,
    ewallet_account_number VARCHAR(100) NULL,
    profile_picture VARCHAR(500) NULL,
    support_level VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_referral_code (referral_code),
    INDEX idx_role (role)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

export default usersTable
