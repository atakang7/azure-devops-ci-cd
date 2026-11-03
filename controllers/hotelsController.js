import Hotel from '../models/hotelModel.js';

import { sendTelegramMessage } from '../apis/services/telegram.js';

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    void sendTelegramMessage("Error fetching hotels: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    void sendTelegramMessage("Error fetching hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
    owner
  } = req.body;

  if (!name || !address || !phone || rating == null || price == null || !description || !facilities || !images || !owner) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  try {
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

    const savedHotel = await newHotel.save();

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
    void sendTelegramMessage("Error creating hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
    void sendTelegramMessage("Error updating hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const deletedHotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!deletedHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    void sendTelegramMessage("Error deleting hotel: " + error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

