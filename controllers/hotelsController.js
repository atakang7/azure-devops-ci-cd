import Hotel from '../models/hotelModel.js'; // Assuming you have a Hotel model defined

import { sendTelegramMessage } from '../apis/services/telegram.js';

// Get all hotels
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    await sendTelegramMessage("Error fetching hotels: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a hotel by ID
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    await sendTelegramMessage("Error fetching hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new hotel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createHotel = async (req, res) => {
  const {
    name,
    address,
    phone,
    rating,
    price,
    description,
    facilities,
    images,
    owner // Ensure this is included
  } = req.body;

  // Validate required fields
  if (!name || !address || !phone || rating == null || price == null || !description || !facilities || !images || !owner) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  try {
    // Create a new Hotel instance
    const newHotel = new Hotel({
      name,
      address,
      phone,
      rating,
      price,
      description,
      facilities,
      images,
      owner
    });

    // Save the new hotel to the database
    const savedHotel = await newHotel.save();

    // Return the created hotel
    res.status(201).json({
      id: savedHotel._id,
      name: savedHotel.name,
      address: savedHotel.address,
      phone: savedHotel.phone,
      rating: savedHotel.rating,
      price: savedHotel.price,
      description: savedHotel.description,
      facilities: savedHotel.facilities,
      images: savedHotel.images,
      owner: savedHotel.owner
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    await sendTelegramMessage("Error creating hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a hotel by ID
export const updateHotel = async (req, res) => {
  try {
    const { name, address } = req.body;
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { name, address },
      { new: true, runValidators: true }
    );
    if (!updatedHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json(updatedHotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    await sendTelegramMessage("Error updating hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a hotel by ID
export const deleteHotel = async (req, res) => {
  try {
    const deletedHotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!deletedHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    await sendTelegramMessage("Error deleting hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

