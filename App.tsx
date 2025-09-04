
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatRole, Language, AppointmentDetails, Doctor } from './types';
// Fix: Import BotIcon to be used in the loading indicator.
import { LANGUAGES, EMERGENCY_KEYWORDS, EMERGENCY_RESPONSE, MEDICAL_DISCLAIMER, DOCTOR_WHATSAPP_NUMBER, BotIcon, DOCTORS } from './constants';
import { streamChat, parseDate, parseDoctorName } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import ChatMessageComponent from './components/ChatMessage';
import LanguageSelector from './components/LanguageSelector';
import ChatInput from './components/ChatInput';
import BookingConfirmation from './components/BookingConfirmation';
import DoctorDatePicker from './components/DoctorDatePicker';
import DoctorList from './components/DoctorList';

// Fix: Add types for Web Speech API to resolve TypeScript errors for SpeechRecognition.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [pendingAppointment, setPendingAppointment] = useState<AppointmentDetails | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<string | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState<{ specialty: string, dateTime: string }[]>([]);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [initialSpecialtyForBooking, setInitialSpecialtyForBooking] = useState<string | null>(null);
  const [availabilityByDoctor, setAvailabilityByDoctor] = useState<Record<string, string[]>>({});

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Initial bot message
    setMessages([{
      role: ChatRole.MODEL,
      text: 'Hello! How can I help you today? Please remember, I am an AI assistant and not a medical professional. I can help you book an appointment.'
    }]);
    
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }
    
    // Fetch existing bookings from Supabase
    const fetchAppointments = async () => {
      if (!supabase) {
        console.warn("Supabase not configured, skipping fetch for booked slots.");
        return;
      }
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_datetime, specialty')
        .gte('appointment_datetime', today);

      if (error) {
        console.error("Error fetching appointments:", error.message || error);
      } else if (data) {
        const appointments = data.map(appt => ({
            specialty: appt.specialty,
            dateTime: appt.appointment_datetime,
        }));
        setBookedAppointments(appointments);
      }
    };
    fetchAppointments();

  }, []);

  useEffect(() => {
    // Load available speech synthesis voices
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    updateVoices(); // Initial call to get voices that might already be loaded
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
  }, []);


  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, pendingAppointment, isBooking]);
  
  useEffect(() => {
    // Calculate fully booked dates for each doctor when appointments change
    const dailySlotLimit = 32; // 8 hours (9am-5pm) * 4 slots/hour
    const countsByDoctor: Record<string, Record<string, number>> = {};

    bookedAppointments.forEach(appt => {
        const dateString = new Date(appt.dateTime).toISOString().split('T')[0];
        const specialty = appt.specialty;
        if (!countsByDoctor[specialty]) {
            countsByDoctor[specialty] = {};
        }
        countsByDoctor[specialty][dateString] = (countsByDoctor[specialty][dateString] || 0) + 1;
    });
    
    const newAvailability: Record<string, string[]> = {};
    for (const specialty in countsByDoctor) {
        newAvailability[specialty] = Object.keys(countsByDoctor[specialty])
            .filter(date => countsByDoctor[specialty][date] >= dailySlotLimit);
    }
    setAvailabilityByDoctor(newAvailability);
  }, [bookedAppointments]);


  const speak = useCallback((text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      const languageVoices = voices.filter(v => v.lang === lang);
      let selectedVoice = languageVoices.find(v => v.name.includes('Google')) || 
                          languageVoices.find(v => v.localService) ||         
                          languageVoices[0];                                  

      if (selectedVoice) {
          utterance.voice = selectedVoice;
      } else {
          console.warn(`No voice for ${lang} found, using default.`);
      }

      utterance.pitch = 1;
      utterance.rate = 0.95;

      window.speechSynthesis.speak(utterance);
    }
  }, [voices]);

  const parseAppointmentDetails = (text: string): AppointmentDetails | null => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match && match[1]) {
      try {
        const details = JSON.parse(match[1]);
        if (details.specialty && details.dateTime && details.patientName && details.phoneNumber) {
          return details;
        }
      } catch (error) {
        console.error("Failed to parse appointment JSON:", error);
        return null;
      }
    }
    return null;
  };
  
  const handleEmergencyClick = () => {
    if (isLoading) return;
    setPendingAppointment(null);
    setIsBooking(false);
    const emergencyMessage: ChatMessage = { role: ChatRole.MODEL, text: EMERGENCY_RESPONSE };
    setMessages(prev => [...prev, emergencyMessage]);
    speak(EMERGENCY_RESPONSE, selectedLanguage.sttCode);
  };

  const handleSendMessage = async (text: string) => {
    if (pendingAppointment) return;
    const newUserMessage: ChatMessage = { role: ChatRole.USER, text };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const lowercasedText = text.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(keyword => lowercasedText.includes(keyword));

    if (isEmergency) {
      const emergencyMessage: ChatMessage = { role: ChatRole.MODEL, text: EMERGENCY_RESPONSE };
      setMessages(prev => [...prev, emergencyMessage]);
      speak(EMERGENCY_RESPONSE, selectedLanguage.sttCode);
      setIsLoading(false);
      return;
    }
    
    // Check for booking intent
    const bookingKeywords = ['book', 'appointment', 'schedule', 'see a doctor'];
    const hasBookingIntent = bookingKeywords.some(kw => lowercasedText.includes(kw));

    if (hasBookingIntent && messages.length < 5) { // Heuristic to avoid re-triggering
        setInitialSpecialtyForBooking(null);
        setIsBooking(true);
        setIsLoading(false);
        // Don't send message to AI, just show the UI
        return;
    }

    const currentHistory = [...messages, newUserMessage];
    
    try {
        const stream = streamChat(currentHistory, selectedLanguage.name);
        let fullResponse = '';
        let firstChunk = true;

        for await (const chunk of stream) {
            fullResponse += chunk;
            if (firstChunk) {
                setMessages(prev => [...prev, { role: ChatRole.MODEL, text: fullResponse }]);
                firstChunk = false;
            } else {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = fullResponse;
                    return newMessages;
                });
            }
        }
        if (fullResponse) {
            const appointmentDetails = parseAppointmentDetails(fullResponse);
            if (appointmentDetails) {
                setPendingAppointment(appointmentDetails);
                const cleanResponse = fullResponse.substring(0, fullResponse.indexOf('```json')).trim();
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = cleanResponse;
                    return newMessages;
                });
                speak(cleanResponse, selectedLanguage.sttCode);
            } else {
                speak(fullResponse, selectedLanguage.sttCode);
            }
        }
    } catch (error) {
        console.error("Error streaming response:", error);
        const errorMessage: ChatMessage = { role: ChatRole.MODEL, text: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const findNextAvailableSlot = (dateString: string, specialty: string): Date | null => {
    const requestedDate = new Date(dateString);
    requestedDate.setMinutes(requestedDate.getMinutes() + requestedDate.getTimezoneOffset());
    
    if (isNaN(requestedDate.getTime())) {
      console.error("Invalid date string provided:", dateString);
      return null;
    }

    requestedDate.setHours(9, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(17, 0, 0, 0);

    let currentSlot = new Date(requestedDate);
    
    const specialtyBookedSlots = bookedAppointments
        .filter(appt => appt.specialty === specialty)
        .map(appt => new Date(appt.dateTime).getTime());


    while (currentSlot < endOfDay) {
      if (!specialtyBookedSlots.includes(currentSlot.getTime())) {
        return currentSlot;
      }
      currentSlot = new Date(currentSlot.getTime() + 15 * 60 * 1000);
    }
    return null;
  };

  const handleConfirmBooking = async () => {
    if (!pendingAppointment) return;
    setIsLoading(true);

    if (!supabase) {
      const errorText = "I'm sorry, but the database is not connected, so I cannot save your appointment. Please contact the administrator.";
      const errorMessage: ChatMessage = { role: ChatRole.MODEL, text: errorText };
      setMessages(prev => [...prev, errorMessage]);
      speak(errorText, selectedLanguage.sttCode);
      setPendingAppointment(null);
      setIsLoading(false);
      return;
    }

    const availableSlot = findNextAvailableSlot(pendingAppointment.dateTime, pendingAppointment.specialty);

    if (!availableSlot) {
      const noSlotsText = "We are sorry, but there are no available appointment slots for the selected date with this doctor. Please try another day by starting a new booking request.";
      const noSlotsMessage: ChatMessage = { role: ChatRole.MODEL, text: noSlotsText };
      setMessages(prev => [...prev, noSlotsMessage]);
      speak(noSlotsText, selectedLanguage.sttCode);
      setPendingAppointment(null);
      setIsLoading(false);
      return;
    }
    
    const { error } = await supabase.from('appointments').insert({
        patient_name: pendingAppointment.patientName,
        phone_number: pendingAppointment.phoneNumber,
        specialty: pendingAppointment.specialty,
        appointment_datetime: availableSlot.toISOString(),
    });

    if (error) {
        console.error("Error booking appointment:", error.message || error);
        const bookingErrorText = "We're sorry, but there was an error confirming your appointment. Please try again later.";
        const bookingErrorMessage: ChatMessage = { role: ChatRole.MODEL, text: bookingErrorText };
        setMessages(prev => [...prev, bookingErrorMessage]);
        speak(bookingErrorText, selectedLanguage.sttCode);
        setPendingAppointment(null);
        setIsLoading(false);
        return;
    }
    
    const newAppointment = { specialty: pendingAppointment.specialty, dateTime: availableSlot.toISOString() };
    setBookedAppointments(prev => [...prev, newAppointment]);

    const formattedTime = availableSlot.toLocaleTimeString(selectedLanguage.sttCode, { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDate = availableSlot.toLocaleDateString(selectedLanguage.sttCode, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const finalAppointmentDetails = { ...pendingAppointment, dateTime: `${formattedDate} at ${formattedTime}` };
    const confirmationText = `Your appointment for ${finalAppointmentDetails.specialty} is confirmed for ${finalAppointmentDetails.dateTime}. We will now attempt to open WhatsApp to send notifications to you and the clinic.`;
    const confirmationMessage: ChatMessage = { role: ChatRole.MODEL, text: confirmationText };

    setMessages(prev => [...prev, confirmationMessage]);
    speak(confirmationText, selectedLanguage.sttCode);

    const userMessage = encodeURIComponent(`Appointment Confirmation:\n\nHello ${finalAppointmentDetails.patientName},\nYour appointment for ${finalAppointmentDetails.specialty} is confirmed for ${finalAppointmentDetails.dateTime}.\n\n- AI Healthcare Assistant`);
    const doctorMessage = encodeURIComponent(`New Appointment Booked:\n\nPatient: ${finalAppointmentDetails.patientName}\nService: ${finalAppointmentDetails.specialty}\nTime: ${finalAppointmentDetails.dateTime}\nContact: ${finalAppointmentDetails.phoneNumber}`);
    const userPhone = finalAppointmentDetails.phoneNumber.replace(/\D/g, '');

    window.open(`https://wa.me/${userPhone}?text=${userMessage}`, '_blank');
    window.open(`https://wa.me/${DOCTOR_WHATSAPP_NUMBER}?text=${doctorMessage}`, '_blank');

    setPendingAppointment(null);
    setIsLoading(false);
  };

  const handleCancelBooking = () => {
    const cancelText = "The appointment booking has been cancelled. How can I help you otherwise?";
    const cancelMessage: ChatMessage = { role: ChatRole.MODEL, text: cancelText };
    setMessages(prev => [...prev, cancelMessage]);
    speak(cancelText, selectedLanguage.sttCode);
    setPendingAppointment(null);
  };

  const handleBookingSelection = ({ specialty, date }: { specialty: string, date: string }) => {
    setIsBooking(false);
    const doctorName = DOCTORS.find(d => d.specialty === specialty)?.name || `a ${specialty}`;
    const messageText = `I would like to book an appointment with ${doctorName} on ${date}.`;
    handleSendMessage(messageText);
  };

  const handleCancelBookingSelection = () => {
    setIsBooking(false);
    setInitialSpecialtyForBooking(null);
  };

  const handleDoctorSelect = (specialty: string) => {
    setInitialSpecialtyForBooking(specialty);
    setIsBooking(true);
    setTimeout(() => {
        chatContainerRef.current?.parentElement?.scrollTo({ 
            top: chatContainerRef.current.parentElement.scrollHeight, 
            behavior: 'smooth' 
        });
    }, 100);
  };

  const handleVoiceInput = useCallback((onTranscript: (transcript: string) => void) => {
    if (!recognitionRef.current || isListening) return;

    const recognition = recognitionRef.current;
    recognition.lang = selectedLanguage.sttCode;
    
    recognition.onstart = () => {
      setIsListening(true);
      setRecognitionStatus("Listening... Please start speaking.");
      setRecognitionError(null);
    };
    recognition.onend = () => {
        setIsListening(false);
        setRecognitionStatus(null);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setRecognitionStatus(null);
        if (event.error === 'no-speech') {
          setRecognitionError("Sorry, I couldn't hear you. Please make sure your microphone is working and try again.");
        } else if (event.error === 'not-allowed') {
          setRecognitionError("Microphone access was denied. Please enable it in your browser settings to use voice input.");
        } else {
          setRecognitionError(`An error occurred: ${event.error}. Please try again.`);
        }
        setTimeout(() => setRecognitionError(null), 5000);
        setIsListening(false);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
        setRecognitionStatus(null);
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            onTranscript(transcript);
        }
    };
    
    recognition.start();
  }, [selectedLanguage, isListening]);

  const renderInputComponent = () => {
    if (pendingAppointment) {
      return (
        <BookingConfirmation
          details={pendingAppointment}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
          isLoading={isLoading}
        />
      );
    }
    if (isBooking) {
      return (
        <DoctorDatePicker
          doctors={DOCTORS}
          availability={availabilityByDoctor}
          onConfirm={handleBookingSelection}
          onCancel={handleCancelBookingSelection}
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          parseDate={parseDate}
          parseDoctorName={parseDoctorName}
          initialSpecialty={initialSpecialtyForBooking}
        />
      );
    }
    return (
      <ChatInput
        onSendMessage={handleSendMessage}
        onVoiceInput={() => handleVoiceInput(handleSendMessage)}
        onEmergency={handleEmergencyClick}
        isLoading={isLoading}
        isListening={isListening}
      />
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200">
      <DoctorList onSelectDoctor={handleDoctorSelect} />
      <div className="flex flex-col flex-1 h-full min-h-0">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex-shrink-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">AI Health Assistant</h1>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={messages.length > 1 || isLoading}
          />
        </header>

        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <ChatMessageComponent key={index} message={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === ChatRole.USER && (
            <div className="flex items-start gap-3.5 my-5 justify-start animate-fade-in">
                <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
                    <BotIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="p-4 max-w-2xl rounded-2xl whitespace-pre-wrap shadow-lg bg-white dark:bg-slate-700 dark:text-gray-200 rounded-bl-lg">
                    <div className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_0.2s] mx-1"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_0.3s]"></div>
                    </div>
                </div>
            </div>
          )}
           {recognitionStatus && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {recognitionStatus}
            </div>
          )}
          {recognitionError && (
            <div className="text-center text-sm text-red-600 dark:text-red-400 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              {recognitionError}
            </div>
          )}
        </main>
        
        <footer className="w-full flex-shrink-0">
            {renderInputComponent()}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 p-2 bg-slate-100 dark:bg-gray-900/50">
                {MEDICAL_DISCLAIMER}
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
