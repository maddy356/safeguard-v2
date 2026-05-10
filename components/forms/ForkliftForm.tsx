"use client";

import React, { useState } from 'react';

interface FormProps {
  user: { name: string; id: string; companyId: string; role: string };
}

const POINTS = ["Lift system", "Seat Belt", "Cabin", "Emergency Tool", "Steps", "Manual", "Hydraulic cylinders", "Diesel/Oil Leakage", "Warning Boards", "Main clutch", "Tyre pressure", "Battery and Lamps", "Reverse horn", "Operators Fitness", "Fire Extinguisher", "Rotatory beacons", "Trained Personnel", "Registration & Insurance", "Operator License", "TTSJV ID Badge", "Operator 3rd party Cert", "Certified Rigger", "Forklift 3rd Party Cert", "SWL Marked", "Other"];

export default function ForkliftForm({ user }: FormProps) {
  const [data, setData] = useState<Record<string, any>>({});

  const submit = async () => {
    const res = await fetch('/api/forms/submit', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        formType: 'Forklift Checklist', 
        companyId: user.companyId, 
        submittedBy: user.id, 
        data: { ...data, operatorName: user.name } // Auto-inject name
      }) 
    });
    if (res.ok) alert("Forklift Report Sent Successfully!");
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Forklift Daily Checklist</h2>
        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
          Operator: {user.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input 
          className="border p-2 rounded" 
          placeholder="Forklift Reg Number" 
          onChange={e => setData({...data, regNumber: e.target.value})} 
        />
        <input 
          className="border p-2 rounded" 
          type="date" 
          onChange={e => setData({...data, date: e.target.value})} 
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Inspection Point</th>
              <th className="p-3 border-b text-center">OK</th>
              <th className="p-3 border-b text-center">NOT OK</th>
              <th className="p-3 border-b text-center">N/A</th>
            </tr>
          </thead>
          <tbody>
            {POINTS.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="p-3 border-b font-medium text-gray-700">{i+1}. {p}</td>
                {['OK', 'NOT OK', 'N/A'].map(v => (
                  <td key={v} className="p-3 border-b text-center">
                    <input 
                      type="radio" 
                      name={`fk-${i}`} 
                      className="w-4 h-4 cursor-pointer"
                      onChange={() => setData({...data, [p]: v})} 
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button 
        onClick={submit} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 mt-6 font-bold rounded-lg shadow-md transition"
      >
        Submit to Manager
      </button>
    </div>
  );
}