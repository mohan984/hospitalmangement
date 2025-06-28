import mongoose, { Schema, Document } from 'mongoose';

// User Model
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImageUrl: { type: String },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

// Doctor Model
export interface IDoctor extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  phone?: string;
  experience?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialty: { type: String, required: true },
  phone: { type: String },
  experience: { type: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);

// Appointment Model
export interface IAppointment extends Document {
  _id: string;
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  userId: { type: String, required: true },
  doctorId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

// Message Model
export interface IMessage extends Document {
  _id: string;
  userId: string;
  subject?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: { type: String, required: true },
  subject: { type: String },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);