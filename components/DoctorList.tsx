
import React, { useState } from 'react';
import { DOCTORS } from '../constants';

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );

interface DoctorListProps {
  onSelectDoctor: (specialty: string) => void;
}

const DoctorList: React.FC<DoctorListProps> = ({ onSelectDoctor }) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-800 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50 lg:overflow-y-auto">
      <button 
        className="w-full flex justify-between items-center lg:hidden"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        aria-expanded={isMobileExpanded}
        aria-controls="specialists-list"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Specialists</h2>
        <ChevronDownIcon className={`w-6 h-6 text-gray-900 dark:text-white transition-transform duration-300 ${isMobileExpanded ? 'rotate-180' : ''}`} />
      </button>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 hidden lg:block">Our Specialists</h2>
      
      <div
        id="specialists-list"
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isMobileExpanded ? 'max-h-[1000px] mt-4' : 'max-h-0'} lg:max-h-full lg:mt-0 space-y-5`}
      >
        {DOCTORS.map((doctor, index) => {
          const gradients = [
            'from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50',
            'from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50',
            'from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50',
            'from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50',
          ];
          const textColors = [
            'text-indigo-600 dark:text-indigo-300',
            'text-violet-600 dark:text-violet-300',
            'text-cyan-600 dark:text-cyan-300',
            'text-pink-600 dark:text-pink-300',
          ];

          return (
            <button
              key={doctor.name}
              onClick={() => onSelectDoctor(doctor.specialty)}
              className={`w-full text-left flex items-center gap-4 p-4 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800`}
              aria-label={`Select ${doctor.name}, ${doctor.specialty}`}
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/50 dark:bg-slate-700/50 flex items-center justify-center shadow-inner">
                <doctor.icon className={`w-9 h-9 ${textColors[index % textColors.length]}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{doctor.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{doctor.specialty}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorList;
