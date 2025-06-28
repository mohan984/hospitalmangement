import type { Express } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongoStorage";
import { authenticate, requireAdmin, hashPassword, comparePasswords, generateToken, AuthRequest } from "./auth";
import { z } from "zod";
import cookieParser from "cookie-parser";

// Schema definitions
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['user', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const doctorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  specialty: z.string().min(1),
  phone: z.string().optional(),
  experience: z.number().optional(),
});

const appointmentSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  time: z.string(),
  reason: z.string().min(1),
});

const messageSchema = z.object({
  subject: z.string().optional(),
  content: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Authentication routes
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = registerSchema.parse(req.body);
      
      const existingUser = await mongoStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await mongoStorage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'user',
      });

      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      const userResponse = { ...user.toObject() };
      delete userResponse.password;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await mongoStorage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      const userResponse = { ...user.toObject() };
      delete userResponse.password;
      res.json(userResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Login failed' });
    }
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/user', authenticate, async (req: AuthRequest, res) => {
    try {
      const userResponse = { ...req.user!.toObject() };
      delete userResponse.password;
      res.json(userResponse);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Doctor routes
  app.get('/api/doctors', async (req, res) => {
    try {
      const doctors = await mongoStorage.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.post('/api/doctors', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const doctorData = doctorSchema.parse(req.body);
      const doctor = await mongoStorage.createDoctor(doctorData);
      res.status(201).json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(400).json({ message: "Failed to create doctor" });
    }
  });

  // Appointment routes
  app.get('/api/appointments', authenticate, async (req: AuthRequest, res) => {
    try {
      const status = req.query.status as string;
      let appointments;
      
      if (req.user!.role === 'admin') {
        if (status && status !== 'all') {
          appointments = await mongoStorage.getAppointmentsByStatus(status);
        } else {
          appointments = await mongoStorage.getAllAppointments();
        }
      } else {
        appointments = await mongoStorage.getAppointmentsByUserId(req.user!._id);
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', authenticate, async (req: AuthRequest, res) => {
    try {
      const appointmentData = appointmentSchema.parse(req.body);
      const appointment = await mongoStorage.createAppointment({
        ...appointmentData,
        userId: req.user!._id,
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  app.patch('/api/appointments/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const appointmentId = req.params.id;
      const { status } = req.body;
      
      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const appointment = await mongoStorage.updateAppointmentStatus(appointmentId, status);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  // Message routes
  app.get('/api/messages', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const messages = await mongoStorage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', authenticate, async (req: AuthRequest, res) => {
    try {
      const messageData = messageSchema.parse(req.body);
      const message = await mongoStorage.createMessage({
        ...messageData,
        userId: req.user!._id,
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.patch('/api/messages/:id/read', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const messageId = req.params.id;
      const message = await mongoStorage.markMessageAsRead(messageId);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(400).json({ message: "Failed to mark message as read" });
    }
  });

  app.delete('/api/messages/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const messageId = req.params.id;
      await mongoStorage.deleteMessage(messageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(400).json({ message: "Failed to delete message" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const stats = await mongoStorage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}