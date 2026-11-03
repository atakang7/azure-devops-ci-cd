import Users from "../models/usersModel.js";
import { sendTelegramMessage } from "../apis/services/telegram.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    void sendTelegramMessage(`Error in getAllUsers: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    void sendTelegramMessage(`Error in getUserById: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

export const createUser = async (req, res) => {
  const user = req.body;
  const newUser = new Users(user);
  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    void sendTelegramMessage(`Error in createUser: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

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
    void sendTelegramMessage(`Error in updateUser: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Users.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    void sendTelegramMessage(`Error in deleteUser: ${error.message}`);
    res.status(500).json({ message: 'Database operation failed' });
  }
};

