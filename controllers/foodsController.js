import Foods from '../models/foodsModel.js';
import { sendTelegramMessage } from '../apis/services/telegram.js';

export const getAllFoods = async (req, res) => {
  try {
    const foods = await Foods.find();
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error retrieving foods:', error);
    void sendTelegramMessage("Error retrieving foods: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFoodById = async (req, res) => {
  const { id } = req.params;

  try {
    const food = await Foods.findById(id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(food);
  } catch (error) {
    console.error('Error retrieving food by ID:', error);
    void sendTelegramMessage("Error retrieving food by ID: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFood = async (req, res) => {
  const { name, price, description, image, category, hotel } = req.body;

  try {
    const newFood = new Foods({
      name,
      price,
      description,
      image,
      category,
      hotel
    });

    const savedFood = await newFood.save();

    res.status(201).json(savedFood);
  } catch (error) {
    console.error('Error creating food:', error);

    void sendTelegramMessage("Error creating food: " + error.message);

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, category } = req.body;

  try {
    const updatedFood = await Foods.findByIdAndUpdate(
      id,
      { name, price, description, image, category },
      { new: true, runValidators: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    void sendTelegramMessage("Error updating food: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteFood = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFood = await Foods.findByIdAndDelete(id);
    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    void sendTelegramMessage("Error deleting food: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

