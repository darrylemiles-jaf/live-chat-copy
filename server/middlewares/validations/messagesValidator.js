
import { body } from 'express-validator';
import { validate } from '../../utils/expressValidator.js';

const createMessageValidations = [
  body('chat_id')
    .exists().withMessage('chat_id is required')
    .isInt({ min: 1 }).withMessage('chat_id must be a positive integer'),
  body('sender_id')
    .exists().withMessage('sender_id is required')
    .isInt({ min: 1 }).withMessage('sender_id must be a positive integer'),
  body('sender_role')
    .exists().withMessage('sender_role is required')
    .isString().withMessage('sender_role must be a string')
    .isIn(['client', 'support_agent', 'admin']).withMessage('sender_role must be one of: client, support_agent, admin'),
  body('message')
    .exists().withMessage('message is required')
    .isString().withMessage('message must be a string')
    .isLength({ min: 1, max: 65535 }).withMessage('message must be between 1 and 65535 characters')
];

export const messagesValidators = [
  ...createMessageValidations,
  validate];
