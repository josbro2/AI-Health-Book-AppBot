
import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { MicIcon } from '../constants';
import DatePickerInput from './DatePickerInput';

interface DoctorDatePickerProps {
  doctors: Doctor[];
  availability: Record<string, string[]>; // specialty -> fully booked date strings
  onConfirm: (selection: { specialty: string, date: string }) => void;
  onCancel: () => void;
  onVoiceInput: (callback: (transcript: string) => void) => void;
  isListening: boolean;
  parseDate: (text: string) => Promise<string | null>;
  parseDoctorName: (text: string) => Promise<string | null>;
  initialSpecialty?: string | null;
}

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const StepIndicator: React.FC<{ step: number; title: string; active: boolean }> = ({ step, title, active }) => (
    <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
            {step}
        </div>
        <h3 className={`ml-3 text-lg font-semibold ${active ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{title}</h3>
    </div>
);

const DoctorDatePicker: React.FC<DoctorDatePickerProps> = ({
  doctors,
  availability,
  onConfirm,
  onCancel,
  onVoiceInput,
  isListening,
  parseDate,
  parseDoctorName,
  initialSpecialty = null,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(initialSpecialty);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const fullyBookedDates = selectedSpecialty ? (availability[selectedSpecialty] || []) : [];

  useEffect(() => {
    // Reset date when doctor changes
    setSelectedDate('');
    setDateError(null);
  }, [selectedSpecialty]);

  const handleDateSelect = (newDate: string) => {
    setSelectedDate(newDate);
    if (fullyBookedDates.includes(newDate)) {
      setDateError('This date is fully booked. Please choose another.');
    } else {
      setDateError(null);
    }
  };

  const handleVoiceTranscript = async (transcript: string) => {
    setIsParsing(true);
    setVoiceError(null);
    try {
        if (!selectedSpecialty) {
            const parsedSpecialty = await parseDoctorName(transcript);
            if (parsedSpecialty) {
                setSelectedSpecialty(parsedSpecialty);
            } else {
                setVoiceError("Sorry, I couldn't recognize that doctor. Please try again or select manually.");
            }
        } else {
            const parsedDate = await parseDate(transcript);
            if (parsedDate) {
                 if (new Date(parsedDate) < new Date(today)) {
                     setVoiceError("Sorry, I can't book appointments in the past. Please say a future date.");
                 } else if (fullyBookedDates.includes(parsedDate)) {
                    setDateError('The date I heard is fully booked. Please select another.');
                    setSelectedDate(parsedDate);
                 } else {
                    setSelectedDate(parsedDate);
                    setDateError(null);
                 }
            } else {
                setVoiceError("Sorry, I couldn't understand that date. Please try again or select manually.");
            }
        }
    } catch (error) {
        setVoiceError("An error occurred during voice processing.");
    } finally {
        setIsParsing(false);
        setTimeout(() => setVoiceError(null), 5000);
    }
  };
  
  const handleConfirm = () => {
    if (selectedSpecialty && selectedDate && !dateError) {
      onConfirm({ specialty: selectedSpecialty, date: selectedDate });
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] animate-fade-in space-y-6">
        {/* Step 1: Select Doctor */}
        <div>
            <StepIndicator step={1} title="Select a Doctor" active={true} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-4">
                {doctors.map(doctor => (
                    <button 
                        key={doctor.specialty}
                        onClick={() => setSelectedSpecialty(doctor.specialty)}
                        className={`p-3 sm:p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${selectedSpecialty === doctor.specialty ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-gray-700/60 hover:bg-slate-200 dark:hover:bg-gray-700'}`}
                    >
                        <p className={`font-bold text-sm sm:text-base ${selectedSpecialty === doctor.specialty ? 'text-white' : 'text-gray-900 dark:text-gray-50'}`}>{doctor.name}</p>
                        <p className={`text-xs sm:text-sm ${selectedSpecialty === doctor.specialty ? 'text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>{doctor.specialty}</p>
                    </button>
                ))}
            </div>
        </div>

        {/* Step 2: Select Date */}
        <div className={`transition-opacity duration-500 ${selectedSpecialty ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
             <StepIndicator step={2} title="Select a Date" active={!!selectedSpecialty} />
             <div className="flex items-start gap-3 mt-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <DatePickerInput
                            value={selectedDate}
                            onChange={handleDateSelect}
                            min={today}
                            disabledDates={fullyBookedDates}
                            disabled={!selectedSpecialty}
                        />
                         <button
                            onClick={() => onVoiceInput(handleVoiceTranscript)}
                            className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                                isListening
                                ? 'text-white bg-red-500 animate-pulse'
                                : isParsing
                                ? 'text-gray-500 dark:text-gray-400 cursor-wait bg-slate-200 dark:bg-slate-700'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-slate-200 dark:bg-slate-700'
                            }`}
                            disabled={isListening || isParsing || !selectedSpecialty}
                            aria-label="Use microphone to say the date"
                        >
                            {isParsing ? <SpinnerIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
                        </button>
                    </div>
                    {dateError && <p id="date-error" className="text-red-600 dark:text-red-400 text-sm mt-1.5 font-medium">{dateError}</p>}
                    {!dateError && selectedSpecialty && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                            Note: For {selectedSpecialty}, dates marked in red are fully booked.
                        </p>
                    )}
                    {voiceError && <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1.5 font-medium">{voiceError}</p>}
                </div>
             </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
            <button
            onClick={onCancel}
            className="px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800"
            >
            Cancel
            </button>
            <button
            onClick={handleConfirm}
            disabled={!selectedSpecialty || !selectedDate || !!dateError}
            className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
            Confirm Selection
            </button>
        </div>
    </div>
  );
};

export default DoctorDatePicker;
