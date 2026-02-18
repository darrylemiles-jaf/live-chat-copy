import expressAsync from 'express-async-handler';
import ticketsServices from '../services/ticketsServices.js';


const getTickets = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.getTickets(req.query);
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error Occurred: ${error.message}`);
    throw new Error(error.message);
  }
});


const getTicketById = expressAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ticketsServices.getTicketById(id);
    
    if (!response.success) {
      return res.status(404).json(response);
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error Occurred: ${error.message}`);
    throw new Error(error.message);
  }
});


const createTicket = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.createTicket(req.body);
    
    if (!response.success) {
      return res.status(400).json(response);
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error(`Error Occurred: ${error.message}`);
    throw new Error(error.message);
  }
});


const updateTicket = expressAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ticketsServices.updateTicket(id, req.body);
    
    if (!response.success) {
      return res.status(404).json(response);
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error Occurred: ${error.message}`);
    throw new Error(error.message);
  }
});


const getTicketStats = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.getTicketStats();
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error Occurred: ${error.message}`);
    throw new Error(error.message);
  }
});

export {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getTicketStats
};
