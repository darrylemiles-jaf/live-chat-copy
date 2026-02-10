# Payload Validation System

## Overview

This validation system provides a reusable way to validate request payloads against database schema requirements. It checks for required fields, data types, value ranges, enums, and more.

## Files Structure

```
server/
├── utils/
│   └── validatePayload.js       # Core validation utility
├── validators/
│   ├── messagesValidator.js     # Message schemas
│   ├── usersValidator.js        # User schemas
│   ├── chatsValidator.js        # Chat schemas
│   └── ticketsValidator.js      # Ticket schemas
```

## Usage

### Basic Example

```javascript
import validatePayload from "../utils/validatePayload.js";
import { createMessageSchema } from "../validators/messagesValidator.js";

const createMessage = async (req, res) => {
	// Validate payload
	const validation = validatePayload(req.body, createMessageSchema);

	if (!validation.isValid) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: validation.errors,
		});
	}

	// Use sanitized data (trimmed strings, etc.)
	const response = await messagesServices.createMessage(validation.sanitized);

	res.status(201).json({
		success: true,
		data: response,
	});
};
```

## Schema Definition

Define validation rules for each field:

```javascript
export const createMessageSchema = {
	chat_id: {
		required: true, // Field is mandatory
		type: "number", // Must be a number
		min: 1, // Minimum value
	},
	sender_role: {
		required: true,
		type: "string",
		enum: ["client", "support_agent", "admin"], // Must be one of these values
	},
	message: {
		required: true,
		type: "string",
		minLength: 1, // Minimum string length
		maxLength: 65535, // Maximum string length
		trim: true, // Automatically trim whitespace
	},
	phone: {
		required: false, // Optional field
		type: "string",
		maxLength: 20,
	},
};
```

## Validation Rules

### Available Options

- **required** (boolean): Field must be present and not null/empty
- **type** (string): Data type - 'string', 'number', 'boolean', 'array'
- **enum** (array): List of allowed values
- **minLength** (number): Minimum string length
- **maxLength** (number): Maximum string length
- **min** (number): Minimum numeric value
- **max** (number): Maximum numeric value
- **email** (boolean): Validate email format
- **trim** (boolean): Trim whitespace from strings
- **custom** (function): Custom validation function

### Custom Validation

```javascript
export const customSchema = {
	password: {
		required: true,
		type: "string",
		minLength: 8,
		custom: (value) => {
			if (!/[A-Z]/.test(value)) {
				return "Password must contain at least one uppercase letter";
			}
			if (!/[0-9]/.test(value)) {
				return "Password must contain at least one number";
			}
			// Return nothing if valid
		},
	},
	confirm_password: {
		required: true,
		type: "string",
		custom: (value, payload) => {
			if (value !== payload.password) {
				return "Passwords do not match";
			}
		},
	},
};
```

## Return Value

The `validatePayload` function returns an object with:

```javascript
{
  isValid: boolean,      // true if all validations pass
  errors: string[],      // Array of error messages
  sanitized: object      // Cleaned data (trimmed strings, etc.)
}
```

## Example Error Response

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": [
		"chat_id is required",
		"sender_role must be one of: client, support_agent, admin",
		"message must be at least 1 characters"
	]
}
```

## Tips

1. Always use `validation.sanitized` instead of `req.body` to get cleaned data
2. Define separate schemas for create vs update operations
3. Use `trim: true` for string fields to remove accidental whitespace
4. Set appropriate `maxLength` values based on your MySQL VARCHAR/TEXT limits
5. Use custom validation for complex business logic

## Database Type Mapping

| MySQL Type   | Validation Type | Notes                           |
| ------------ | --------------- | ------------------------------- |
| INT          | number          | Use min/max for constraints     |
| VARCHAR(n)   | string          | Set maxLength to n              |
| TEXT         | string          | maxLength: 65535                |
| ENUM(...)    | string          | Use enum array                  |
| DECIMAL(p,s) | number          | Use min/max for range           |
| TIMESTAMP    | string          | Validate with custom date check |
| BOOLEAN      | boolean         | Type check                      |
