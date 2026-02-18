import expressAsync from 'express-async-handler'
import usersServices from '../services/usersServices.js'

const getUsers = expressAsync(async (req, res) => {
  try {
    const response = await usersServices.getUsers(req.query)
    res.status(200).json(response)
  } catch (error) {
    console.error(error);
    throw new Error(error.message)
  }
})

const getSingleUser = expressAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const response = await usersServices.getSingleUser(id);
    if (!response.success) {
      return res.status(404).json(response);
    }
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
});

const authUser = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await usersServices.authUser(email);
    const { statusCode, ...responseData } = result;
    return res.status(statusCode).json(responseData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getUsers,
  getSingleUser,
  authUser
}