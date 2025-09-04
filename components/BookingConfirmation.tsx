import React from 'react';
import { AppointmentDetails } from '../types';

interface BookingConfirmationProps {
  details: AppointmentDetails;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ details, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl p-6 m-4 rounded-xl animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Please Confirm Your Appointment</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-slate-600 dark:text-slate-300">
        <div>
            <strong className="block text-sm font-medium text-slate-800 dark:text-slate-100">Specialty</strong>
            <span>{details.specialty}</span>
        </div>
        <div>
            <strong className="block text-sm font-medium text-slate-800 dark:text-slate-100">Requested Date</strong>
            <span>{details.dateTime}</span>
        </div>
        <div>
            <strong className="block text-sm font-medium text-slate-800 dark:text-slate-100">Patient Name</strong>
            <span>{details.patientName}</span>
        </div>
        <div>
            <strong className="block text-sm font-medium text-slate-800 dark:text-slate-100">Phone Number</strong>
            <span>{details.phoneNumber}</span>
        </div>
      </div>
       <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
        Note: The system will assign the next available 15-minute time slot for the selected date.
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:text-slate-200 dark:bg-slate-600/50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center transition-all min-w-[180px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming...
            </>
          ) : 'Confirm & Book'}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
