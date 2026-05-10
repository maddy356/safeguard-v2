"use client";

import React, { useState } from 'react';

interface FormProps {
  user: { name: string; id: string; companyId: string; role: string };
}

const SECTIONS = [
  { id: 'A', title: 'PEDESTRIAN SAFETY', items: ['Walkways marked', 'Free from obstruction', 'Anti-slip mats', 'No cables across lanes'] },
  { id: 'B', title: 'LIFTING OPERATIONS', items: ['Area isolated', 'Weight confirmed', 'Properly fastened', 'Pre-use checklist'] },
  // ... continue sections C-J as per your previous requirements
];

export default function SiteSafetyForm({ user }: FormProps) {
  const [data, setData] = useState<Record<string, any>>({});

  const submit = async () => {
    await fetch('/api/forms/submit', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        formType: 'Site Safety Checklist', 
        companyId: user.companyId, 
        submittedBy: user.id, 
        data: { ...data, auditor: user.name } 
      }) 
    });
    alert("Site Safety Form Submitted!");
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <div className="bg-blue-900 text-white p-4 -m-6 mb-6 rounded-t-xl flex justify-between">
        <h2 className="font-bold text-lg">Site Safety Audit</h2>
        <span className="text-sm font-light">Auditor: {user.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
        <input className="border p-2 rounded" placeholder="Project Name/Code" onChange={e => setData({...data, project: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Specific Location" onChange={e => setData({...data, location: e.target.value})} />
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.id} className="mb-8 border rounded-lg overflow-hidden">
          <h3 className="bg-gray-100 px-4 py-2 font-bold text-blue-900 border-b">{sec.id}. {sec.title}</h3>
          <div className="divide-y">
            {sec.items.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 hover:bg-gray-50 transition">
                <span className="text-sm text-gray-700 font-medium mb-2 md:mb-0 w-1/2">{i+1}. {item}</span>
                <div className="flex gap-4">
                  {['Satisfactory', 'Action Required', 'N/A'].map(v => (
                    <label key={v} className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase">
                      <input type="radio" name={`${sec.id}-${i}`} className="w-4 h-4" onChange={() => setData({...data, [`${sec.id}-${i}`]: v})} />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button 
        onClick={submit} 
        className="w-full bg-blue-800 hover:bg-blue-900 text-white p-4 font-bold rounded-lg shadow-lg transition"
      >
        Finalize Safety Audit
      </button>
    </div>
  );
}