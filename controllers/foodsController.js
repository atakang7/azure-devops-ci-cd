import Foods from '../models/foodsModel.js'; // Adjust the path to your food model
import { sendTelegramMessage } from '../apis/services/telegram.js';

/**
 * Get all foods
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllFoods = async (req, res) => {
  try {
    const foods = await Foods.find(); // Fetch all foods from the database
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error retrieving foods:', error);
    await sendTelegramMessage("Error retrieving foods: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a food by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFoodById = async (req, res) => {
  const { id } = req.params;

  try {
    const food = await Foods.findById(id); // Fetch the food by ID from the database
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(food);
  } catch (error) {
    console.error('Error retrieving food by ID:', error);
    await sendTelegramMessage("Error retrieving food by ID: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new food
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createFood = async (req, res) => {
  const { name, price, description, image, category, hotel } = req.body;

  try {
    // Create a new instance of the Food model with the required fields
    const newFood = new Foods({
      name,
      price,
      description,
      image,
      category,
      hotel
    });

    // Save the new food to the database
    const savedFood = await newFood.save();

    // Respond with the newly created food item
    res.status(201).json(savedFood);
  } catch (error) {
    console.error('Error creating food:', error);

    // Ensure sendTelegramMessage is properly defined
    try {
      await sendTelegramMessage("Error creating food: " + error.message);
    } catch (telegramError) {
      console.error('Failed to send Telegram message:', telegramError);
    }

    // Respond with a generic error message
    res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * Update a food by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, category } = req.body;

  try {
    const updatedFood = await Foods.findByIdAndUpdate(
      id,
      { name, price, description, image, category },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    await sendTelegramMessage("Error updating food: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a food by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteFood = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFood = await Foods.findByIdAndDelete(id); // Delete the food by ID from the database
    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    await sendTelegramMessage("Error deleting food: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

