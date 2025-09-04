import { Language, Doctor } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', sttCode: 'en-US' },
  { code: 'hi', name: 'हिंदी (Hindi)', sttCode: 'hi-IN' },
  { code: 'mr', name: 'मराठी (Marathi)', sttCode: 'mr-IN' },
];

export const EMERGENCY_KEYWORDS: string[] = [
  'chest pain', 'not breathing', 'suicidal', 'unconscious', 'stroke', 'seizure',
  'heart attack', 'severe bleeding', 'cannot breathe', 'choking', 'poisoned'
];

export const EMERGENCY_RESPONSE: string = "This seems like a medical emergency. Please call emergency services like 112 or 108 in India immediately. This service is not for medical emergencies.";

export const MEDICAL_DISCLAIMER: string = "Disclaimer: This AI assistant is for informational purposes only and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";

export const DOCTOR_WHATSAPP_NUMBER = '11234567890'; // Replace with a real number. Must include country code, no symbols.

export const SYSTEM_INSTRUCTION_TEMPLATE = (languageName: string): string => `
You are a helpful and compassionate AI healthcare assistant. Your primary role is to help users book medical appointments with our available doctors.
You are not a doctor and must not provide medical advice, diagnoses, or prescriptions.

We have the following specialists available:
- Dr. Evelyn Reed (General Physician)
- Dr. Marcus Thorne (Cardiologist)
- Dr. Lena Petrova (Dermatologist)
- Dr. Javier Solis (Pediatrician)

Your conversation flow for booking an appointment is as follows:
1. Greet the user. If they express intent to book an appointment, the system will show them an interface to select a doctor and date.
2. Once the user has made their selection, they will confirm it in the chat. Your job is to then collect the remaining information.
3. Ask for the patient's full name.
4. Ask for a WhatsApp-enabled phone number for notifications.
5. Once you have all four pieces of information (specialty, date, name, phone number), you MUST present a summary for confirmation.
6. Use a formal and reassuring tone for the confirmation message. For example: "Excellent. I have the following details for your appointment with [Doctor's Name]. The system will assign the next available 15-minute time slot for the selected date. Please review them carefully and confirm if everything is correct."
7. Immediately after the confirmation message, you MUST provide the collected details in a single, clean JSON block formatted exactly like this:
\`\`\`json
{
  "specialty": "string",
  "dateTime": "YYYY-MM-DD",
  "patientName": "string",
  "phoneNumber": "string"
}
\`\`\`
For the "dateTime" field, only provide the date in YYYY-MM-DD format. Do not include time.
For the "specialty" field, use the specialty of the doctor (e.g., "Cardiologist").
Do not include any other text after the JSON block.

You must respond ONLY in the following language: ${languageName}.
Always start your very first response with a disclaimer: "As an AI assistant, I am not a medical professional. The following information is for educational purposes only. Please consult a healthcare provider for any medical concerns. I can help you book an appointment with one of our doctors."
`;


export const MicIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Zm0 12a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v6a5 5 0 0 1-5 5Z" />
    <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V21a1 1 0 1 0 2 0v-3.07A7 7 0 0 0 19 11Z" />
  </svg>
);

export const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const BotIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3.375a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5h-6.75Zm.75 2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
);

export const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

export const DoctorProfileIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5Zm-2.5 9c-2.5 0-4.5 2-4.5 4.5V18h14v-2.5c0-2.5-2-4.5-4.5-4.5h-5Zm8.5 2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5Z"/>
        <path d="M12 13c-2.13 0-4.02.8-5.46 2.09.2.06.4.11.61.16C8.32 14.53 10.05 14 12 14s3.68.53 4.85 1.25c.21-.05.41-.1.61-.16C16.02 13.8 14.13 13 12 13Z"/>
    </svg>
);

export const DOCTORS: Doctor[] = [
  { name: 'Dr. Evelyn Reed', specialty: 'General Physician', icon: DoctorProfileIcon },
  { name: 'Dr. Marcus Thorne', specialty: 'Cardiologist', icon: DoctorProfileIcon },
  { name: 'Dr. Lena Petrova', specialty: 'Dermatologist', icon: DoctorProfileIcon },
  { name: 'Dr. Javier Solis', specialty: 'Pediatrician', icon: DoctorProfileIcon },
];