import { Router } from 'express';
import Room from '../models/roomModel.js';

const router = Router();

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of all rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The room ID
 *                   roomNumber:
 *                     type: number
 *                     description: The room number
 *                   roomType:
 *                     type: string
 *                     description: The room type
 *                   price:
 *                     type: number
 *                     description: The room price
 *                   isBooked:
 *                     type: boolean
 *                     description: The room booking status
 *                   hotel:
 *                     type: string
 *                     description: The hotel ID
 *                   user:
 *                     type: string
 *                     description: The user ID
 */
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The room ID
 *     responses:
 *       200:
 *         description: The room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The room ID
 *                 roomNumber:
 *                   type: number
 *                   description: The room number
 *                 roomType:
 *                   type: string
 *                   description: The room type
 *                 price:
 *                   type: number
 *                   description: The room price
 *                 isBooked:
 *                   type: boolean
 *                   description: The room booking status
 *                 hotel:
 *                   type: string
 *                   description: The hotel ID
 *                 user:
 *                   type: string
 *                   description: The user ID
 *       404:
 *         description: Room not found
 */
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: number
 *                 description: The room number
 *               roomType:
 *                 type: string
 *                 description: The room type
 *               price:
 *                 type: number
 *                 description: The room price
 *               isBooked:
 *                 type: boolean
 *                 description: The room booking status
 *               hotel:
 *                 type: string
 *                 description: The hotel ID
 *     responses:
 *       201:
 *         description: The created room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The room ID
 *                 roomNumber:
 *                   type: number
 *                   description: The room number
 *                 roomType:
 *                   type: string
 *                   description: The room type
 *                 price:
 *                   type: number
 *                   description: The room price
 *                 isBooked:
 *                   type: boolean
 *                   description: The room booking status
 *                 hotel:
 *                   type: string
 *                   description: The hotel ID
 *       500:
 *         description: Error creating room
 */
router.post('/', async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: number
 *                 description: The room number
 *               roomType:
 *                 type: string
 *                 description: The room type
 *               price:
 *                 type: number
 *                 description: The room price
 *               isBooked:
 *                 type: boolean
 *                 description: The room booking status
 *               hotel:
 *                 type: string
 *                 description: The hotel ID
 *               user:
 *                 type: string
 *                 description: The user ID
 *     responses:
 *       200:
 *         description: The updated room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The room ID
 *                 roomNumber:
 *                   type: number
 *                   description: The room number
 *                 roomType:
 *                   type: string
 *                   description: The room type
 *                 price:
 *                   type: number
 *                   description: The room price
 *                 isBooked:
 *                   type: boolean
 *                   description: The room booking status
 *                 hotel:
 *                   type: string
 *                   description: The hotel ID
 *                 user:
 *                   type: string
 *                   description: The user ID
 *       404:
 *         description: Room not found
 *       500:
 *         description: Error updating room
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Error deleting room
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

