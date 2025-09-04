
export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface Language {
  code: 'en' | 'hi' | 'mr';
  name: string;
  sttCode: 'en-US' | 'hi-IN' | 'mr-IN';
}

export interface AppointmentDetails {
  specialty: string;
  dateTime: string;
  patientName: string;
  phoneNumber: string;
}

export interface Doctor {
  name: string;
  specialty: string;
  icon: React.FC<{ className?: string }>;
}
