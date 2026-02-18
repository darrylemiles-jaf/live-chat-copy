import expressAsync from 'express-async-handler';
import queueServices from '../services/queueServices.js';

const getQueue = expressAsync(async (req, res) => {
  try {
    const queuedChats = await queueServices.getQueue(req.query);
    res.status(200).json({
      success: true,
      count: queuedChats.length,
      data: queuedChats
    });
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    throw new Error(error.message);
  }
});

const getAvailableAgents = expressAsync(async (req, res) => {
  try {
    const agents = await queueServices.getAvailableAgents();
    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    throw new Error(error.message);
  }
});

export {
  getQueue,
  getAvailableAgents
}
