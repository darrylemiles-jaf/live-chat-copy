const messagesTable = `CREATE TABLE IF NOT EXISTS messages (
	id INT AUTO_INCREMENT PRIMARY KEY,
	chat_id INT NOT NULL,
	sender_id INT NOT NULL,
	sender_role ENUM('client','support','admin') NOT NULL,
	message TEXT,
	attachment_url VARCHAR(500) DEFAULT NULL,
	attachment_type ENUM('image','video','audio','document','archive') DEFAULT NULL,
	attachment_name VARCHAR(255) DEFAULT NULL,
	attachment_size INT DEFAULT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
	CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
	INDEX idx_messages_chat (chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

// Migration query to add attachment columns to existing tables
const messagesTableMigration = `
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attachment_type ENUM('image','video','audio','document','archive') DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attachment_size INT DEFAULT NULL,
MODIFY COLUMN message TEXT;
`;

export { messagesTable, messagesTableMigration };
export default messagesTable;
