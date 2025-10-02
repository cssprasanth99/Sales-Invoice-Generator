import React from "react";

const TextareaField = ({ icon: Icon, label, name, ...props }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <textarea
          id={name}
          name={name}
          rows={3}
          {...props}
          className={`w-full min-h-[100px] pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 
            ${Icon ? "pl-10" : "pl-3"}  
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        ></textarea>
      </div>
    </div>
  );
};

export default TextareaField;
