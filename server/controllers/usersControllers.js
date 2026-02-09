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

export {
  getUsers,
  getSingleUser
}