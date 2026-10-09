import Hotel from '../models/hotelModel.js';
import Users from '../models/usersModel.js';
import Room from '../models/roomModel.js';
import Apps from '../models/appsModel.js';
import Foods from '../models/foodsModel.js';
import ClientVisit from '../models/clientVisitModel.js';
// Implement logging
import { sendTelegramMessage } from '../apis/services/telegram.js';

/**
 * Logs in a user and returns a JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
/**
 * Logs a client visit to a hotel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logClientVisit = async (req, res) => {
  const { id } = req.params;
  const { clientId, visitTime } = req.body || {};
  if (!clientId || !visitTime || Number.isNaN(Date.parse(visitTime))) {
    return res.status(400).json({ message: 'clientId and a valid visitTime are required' });
  }
  try {
    // Ensure that the hotel exists
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      sendTelegramMessage(`Error: Hotel ${id} not found`);
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Log the client visit
    const newVisit = new ClientVisit({
      hotelId: id,
      clientId,
      visitTime: new Date(visitTime),
    });
    await newVisit.save();

    res.status(200).json({ message: 'Visit logged successfully' });
  } catch (error) {
    console.error('Error logging client visit:', error);
    sendTelegramMessage(`Error logging client visit: ${error}`);
    res.status(400).json({ message: 'Bad request, invalid input' });
  }
};

/**
 * Render the home page with all hotels
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const homePage = async (req, res) => {
  try {
    // Get all hotels from the database
    const hotels = await Hotel.find();
    
    // Render the home page with the hotels
    res.render('pages/homePage.ejs', { hotels });
  } catch (error) {
    // Log and send error message to Telegram
    console.error('Error fetching hotels:', error);
    await sendTelegramMessage("Error fetching hotels: " + error);
    
    // Send error response to client
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Retrieves hotel details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
/**
 * Retrieves dashboard details for a hotel including related resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboardDetails = async (req, res) => {
    const { id } = req.params;

    try {
      // Fetch hotel details
      const hotel = await Hotel.findById(id);
      if (!hotel) {
        sendTelegramMessage(`Error: Hotel ${id} not found`);
        return res.status(404).json({ message: 'Hotel not found' });
      }
  
      // Fetch related apps
      const apps = await Apps.find({ 'hotel': id });
      // Fetch related foods
      const foods = await Foods.find({ 'hotel': id });

      // Create a dummy user
      const dummyUser = {
        name: 'Guest',
        username: 'guest',
        email: 'dummy@example.com',
        role: 'user'
      };

      // Render the dashboard view with all related resources
      res.render('./pages/index.ejs', {
        user: dummyUser,  // Assuming user is set in the request (e.g., via authentication middleware)
        hotel: hotel,
        apps: apps,
        foods: foods,
      });
    } catch (error) {
      console.error('Error retrieving dashboard details:', error);
      sendTelegramMessage(`Error retrieving dashboard details: ${error}`);
      res.status(500).json({ message: 'Internal server error' });
    }
};

