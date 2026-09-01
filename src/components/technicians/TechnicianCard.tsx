import React from 'react';
import { Technician } from '../../types/technician';
import { hapticSelection } from '../../utils/haptics';

interface TechnicianCardProps {
  technician: Technician;
  onSelect: (technician: Technician) => void;
}

export const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onSelect
}) => {
  const shortAiDescription =
    technician.aiDescription ||
    `${technician.experienceYears}+ years experienced ${technician.title.toLowerCase()} specialized in ${
      technician.subSectors?.[0] || technician.primarySector
    } with verified field expertise across Kolkata.`;

  return (
    <div
      id={`technician-card-${technician.id}`}
      onClick={() => {
        hapticSelection();
        onSelect(technician);
      }}
      className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between select-none"
    >
      {/* Top Row: Left Photo + Right (Name, Rating, Experience, Jobs Done) */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Left Side: Photo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
          <img
            src={technician.photo}
            alt={technician.name}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Beside Photo: Name and [Rating, Experience, Job Done] */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {technician.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1 flex-wrap">
            <span className="text-amber-500 font-bold">★ {technician.rating.toFixed(1)}</span>
            <span className="text-slate-300">·</span>
            <span>{technician.experienceYears}+ Yrs Exp</span>
            <span className="text-slate-300">·</span>
            <span>{technician.completedJobs}+ Jobs Done</span>
          </div>
        </div>
      </div>

      {/* Below of it: Tag / Profession & Short Gemini Synthesized Description [Pure borderless text] */}
      <div className="mt-3 space-y-1">
        <p className="text-xs font-semibold text-slate-800 tracking-tight">
          {technician.title}
          {technician.primarySector ? ` • ${technician.primarySector}` : ''}
        </p>

        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          {shortAiDescription}
        </p>
      </div>
    </div>
  );
};
