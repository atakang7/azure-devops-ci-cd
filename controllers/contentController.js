import Hotel from '../models/hotelModel.js';
import Apps from '../models/appsModel.js';
import Foods from '../models/foodsModel.js';
import ClientVisit from '../models/clientVisitModel.js';
import { sendTelegramMessage } from '../apis/services/telegram.js';

export const logClientVisit = async (req, res) => {
  const { id } = req.params;
  const { clientId, visitTime } = req.body || {};
  if (!clientId || !visitTime || Number.isNaN(Date.parse(visitTime))) {
    return res.status(400).json({ message: 'clientId and a valid visitTime are required' });
  }
  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      void sendTelegramMessage(`Error: Hotel ${id} not found`);
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const newVisit = new ClientVisit({
      hotelId: id,
      clientId,
      visitTime: new Date(visitTime),
    });
    await newVisit.save();

    res.status(200).json({ message: 'Visit logged successfully' });
  } catch (error) {
    console.error('Error logging client visit:', error);
    void sendTelegramMessage(`Error logging client visit: ${error}`);
    res.status(400).json({ message: 'Bad request, invalid input' });
  }
};

export const homePage = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    
    res.render('pages/homePage.ejs', { hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    void sendTelegramMessage("Error fetching hotels: " + error);
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      void sendTelegramMessage(`Error: Hotel ${id} not found`);
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const apps = await Apps.find({ hotel: id });
    const foods = await Foods.find({ hotel: id });
    res.render('./pages/index.ejs', { hotel, apps, foods });
  } catch (error) {
    console.error('Error retrieving dashboard details:', error);
    void sendTelegramMessage(`Error retrieving dashboard details: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

