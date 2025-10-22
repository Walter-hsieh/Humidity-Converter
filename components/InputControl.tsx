
import React from 'react';

interface InputControlProps {
  label: string;
  unit: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}

const InputControl: React.FC<InputControlProps> = ({ label, unit, value, onChange, icon }) => {
  return (
    <div className="relative bg-slate-900/70 p-4 rounded-lg border border-slate-700 focus-within:border-cyan-500 transition-colors duration-300">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-1">
        {icon}
        {label}
      </label>
      <div className="flex items-baseline">
        <input
          type="number"
          value={value}
          onChange={onChange}
          placeholder="0.00"
          className="w-full bg-transparent text-2xl font-semibold text-white outline-none placeholder-slate-600"
        />
        <span className="text-slate-500 font-medium pl-2">{unit}</span>
      </div>
    </div>
  );
};

export default InputControl;
