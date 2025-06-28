import {
  users,
  doctors,
  appointments,
  messages,
  type User,
  type UpsertUser,
  type Doctor,
  type InsertDoctor,
  type Appointment,
  type InsertAppointment,
  type AppointmentWithDetails,
  type Message,
  type InsertMessage,
  type MessageWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Doctor operations
  getAllDoctors(): Promise<Doctor[]>;
  getDoctorById(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor>;
  
  // Appointment operations
  getAllAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointmentsByUserId(userId: string): Promise<AppointmentWithDetails[]>;
  getAppointmentsByStatus(status: string): Promise<AppointmentWithDetails[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  
  // Message operations
  getAllMessages(): Promise<MessageWithUser[]>;
  getUnreadMessages(): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalAppointments: number;
    activeDoctors: number;
    pendingAppointments: number;
    unreadMessages: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Doctor operations
  async getAllDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors).where(eq(doctors.isActive, true)).orderBy(doctors.lastName);
  }

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async createDoctor(doctorData: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(doctorData).returning();
    return doctor;
  }

  async updateDoctor(id: number, doctorData: Partial<InsertDoctor>): Promise<Doctor> {
    const [doctor] = await db
      .update(doctors)
      .set({ ...doctorData, updatedAt: new Date() })
      .where(eq(doctors.id, id))
      .returning();
    return doctor;
  }

  // Appointment operations
  async getAllAppointments(): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .orderBy(desc(appointments.createdAt));

    return result.map(row => ({
      ...row.appointments,
      user: row.users!,
      doctor: row.doctors!,
    }));
  }

  async getAppointmentsByUserId(userId: string): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.createdAt));

    return result.map(row => ({
      ...row.appointments,
      user: row.users!,
      doctor: row.doctors!,
    }));
  }

  async getAppointmentsByStatus(status: string): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.status, status))
      .orderBy(desc(appointments.createdAt));

    return result.map(row => ({
      ...row.appointments,
      user: row.users!,
      doctor: row.doctors!,
    }));
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(appointmentData).returning();
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Message operations
  async getAllMessages(): Promise<MessageWithUser[]> {
    const result = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .orderBy(desc(messages.createdAt));

    return result.map(row => ({
      ...row.messages,
      user: row.users!,
    }));
  }

  async getUnreadMessages(): Promise<MessageWithUser[]> {
    const result = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.isRead, false))
      .orderBy(desc(messages.createdAt));

    return result.map(row => ({
      ...row.messages,
      user: row.users!,
    }));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalAppointments: number;
    activeDoctors: number;
    pendingAppointments: number;
    unreadMessages: number;
  }> {
    const [totalAppointments] = await db
      .select({ count: appointments.id })
      .from(appointments);

    const [activeDoctors] = await db
      .select({ count: doctors.id })
      .from(doctors)
      .where(eq(doctors.isActive, true));

    const [pendingAppointments] = await db
      .select({ count: appointments.id })
      .from(appointments)
      .where(eq(appointments.status, 'pending'));

    const [unreadMessages] = await db
      .select({ count: messages.id })
      .from(messages)
      .where(eq(messages.isRead, false));

    return {
      totalAppointments: totalAppointments?.count || 0,
      activeDoctors: activeDoctors?.count || 0,
      pendingAppointments: pendingAppointments?.count || 0,
      unreadMessages: unreadMessages?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
