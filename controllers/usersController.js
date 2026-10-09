// ----------------------------------------------------------------------------------------------------------------------
// Controllers for users
// ----------------------------------------------------------------------------------------------------------------------
import Users from "../models/usersModel.js";
import { sendTelegramMessage } from "../apis/services/telegram.js";

// get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    await sendTelegramMessage(`Error in getAllUsers: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

// get user by id
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    await sendTelegramMessage(`Error in getUserById: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

// create a new user
export const createUser = async (req, res) => {
  const user = req.body;
  const newUser = new Users(user);
  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    await sendTelegramMessage(`Error in createUser: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

// update a user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = req.body;
  try {
    const updatedUser = await Users.findByIdAndUpdate(id, user, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    await sendTelegramMessage(`Error in updateUser: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

// delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Users.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    await sendTelegramMessage(`Error in deleteUser: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

