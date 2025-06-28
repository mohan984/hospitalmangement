import { User, Doctor, Appointment, Message, IUser, IDoctor, IAppointment, IMessage } from './models';

export interface IMongoStorage {
  // User operations
  getUserById(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  
  // Doctor operations
  getAllDoctors(): Promise<IDoctor[]>;
  getDoctorById(id: string): Promise<IDoctor | null>;
  createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor>;
  updateDoctor(id: string, doctorData: Partial<IDoctor>): Promise<IDoctor | null>;
  
  // Appointment operations
  getAllAppointments(): Promise<IAppointment[]>;
  getAppointmentsByUserId(userId: string): Promise<IAppointment[]>;
  getAppointmentsByStatus(status: string): Promise<IAppointment[]>;
  createAppointment(appointmentData: Partial<IAppointment>): Promise<IAppointment>;
  updateAppointmentStatus(id: string, status: string): Promise<IAppointment | null>;
  
  // Message operations
  getAllMessages(): Promise<IMessage[]>;
  getUnreadMessages(): Promise<IMessage[]>;
  createMessage(messageData: Partial<IMessage>): Promise<IMessage>;
  markMessageAsRead(id: string): Promise<IMessage | null>;
  deleteMessage(id: string): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalAppointments: number;
    activeDoctors: number;
    pendingAppointments: number;
    unreadMessages: number;
  }>;
}

export class MongoStorage implements IMongoStorage {
  // User operations
  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  // Doctor operations
  async getAllDoctors(): Promise<IDoctor[]> {
    return await Doctor.find({ isActive: true });
  }

  async getDoctorById(id: string): Promise<IDoctor | null> {
    return await Doctor.findById(id);
  }

  async createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  async updateDoctor(id: string, doctorData: Partial<IDoctor>): Promise<IDoctor | null> {
    return await Doctor.findByIdAndUpdate(id, doctorData, { new: true });
  }

  // Appointment operations
  async getAllAppointments(): Promise<IAppointment[]> {
    return await Appointment.find().sort({ createdAt: -1 });
  }

  async getAppointmentsByUserId(userId: string): Promise<IAppointment[]> {
    return await Appointment.find({ userId }).sort({ createdAt: -1 });
  }

  async getAppointmentsByStatus(status: string): Promise<IAppointment[]> {
    return await Appointment.find({ status }).sort({ createdAt: -1 });
  }

  async createAppointment(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  async updateAppointmentStatus(id: string, status: string): Promise<IAppointment | null> {
    return await Appointment.findByIdAndUpdate(id, { status }, { new: true });
  }

  // Message operations
  async getAllMessages(): Promise<IMessage[]> {
    return await Message.find().sort({ createdAt: -1 });
  }

  async getUnreadMessages(): Promise<IMessage[]> {
    return await Message.find({ isRead: false }).sort({ createdAt: -1 });
  }

  async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(messageData);
    return await message.save();
  }

  async markMessageAsRead(id: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async deleteMessage(id: string): Promise<void> {
    await Message.findByIdAndDelete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalAppointments: number;
    activeDoctors: number;
    pendingAppointments: number;
    unreadMessages: number;
  }> {
    const [totalAppointments, activeDoctors, pendingAppointments, unreadMessages] = await Promise.all([
      Appointment.countDocuments(),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments({ status: 'pending' }),
      Message.countDocuments({ isRead: false }),
    ]);

    return {
      totalAppointments,
      activeDoctors,
      pendingAppointments,
      unreadMessages,
    };
  }
}

export const mongoStorage = new MongoStorage();