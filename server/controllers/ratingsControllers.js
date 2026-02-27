import expressAsync from 'express-async-handler';
import ratingsServices from '../services/ratingsServices.js';

const submitRating = expressAsync(async (req, res) => {
  try {
    const { chat_id, client_id, rating, comment } = req.body;

    if (!chat_id || !client_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'chat_id, client_id, and rating are required'
      });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    const data = await ratingsServices.submitRating({
      chat_id: parseInt(chat_id),
      client_id: parseInt(client_id),
      rating: parsedRating,
      comment: comment?.trim() || null
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data
    });
  } catch (error) {
    console.error('Error submitting rating:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

const getRatingByChatId = expressAsync(async (req, res) => {
  try {
    const { chat_id } = req.params;

    if (!chat_id) {
      return res.status(400).json({ success: false, message: 'chat_id is required' });
    }

    const data = await ratingsServices.getRatingByChatId(parseInt(chat_id));

    res.status(200).json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Error fetching rating:', error.message);
    throw new Error(error.message);
  }
});

const getAgentRatings = expressAsync(async (req, res) => {
  try {
    const { agent_id } = req.params;

    if (!agent_id) {
      return res.status(400).json({ success: false, message: 'agent_id is required' });
    }

    const data = await ratingsServices.getAgentRatings(parseInt(agent_id));

    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Error fetching agent ratings:', error.message);
    throw new Error(error.message);
  }
});

const getLeaderboard = expressAsync(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await ratingsServices.getLeaderboard(parseInt(limit));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    throw new Error(error.message);
  }
});

export { submitRating, getRatingByChatId, getAgentRatings, getLeaderboard };
