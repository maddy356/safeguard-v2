"use client";

import React, { useState } from 'react';

interface FormProps {
  user: { name: string; id: string; companyId: string; role: string };
}

const CHECKS = ["Access Path Clear", "Lighting Functional", "Signage Visible", "Shut-off Valve No Leaks", "Nozzle Covers Intact", "Bowl Clean", "Protective Covers Closed", "No Hazardous Chemicals Nearby", "Water Clarity Clean", "Flow Rate Steady"];

export default function EyewashForm({ user }: FormProps) {
  const [data, setData] = useState<Record<string, any>>({});

  const submit = async () => {
    await fetch('/api/forms/submit', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        formType: 'Eyewash Checklist', 
        companyId: user.companyId, 
        submittedBy: user.id, 
        data: { ...data, inspector: user.name } 
      }) 
    });
    alert("Eyewash Safety Checklist Submitted!");
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">Eyewash Station Inspection</h2>
      <p className="text-sm text-gray-500 mb-6 font-medium">Inspector Name: <span className="text-gray-900">{user.name}</span></p>
      
      <table className="w-full text-sm text-left mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Check Description</th>
            <th className="p-3 text-center w-24">Compliant</th>
            <th className="p-3 text-center w-24">Non-Comp</th>
          </tr>
        </thead>
        <tbody>
          {CHECKS.map((check, i) => (
            <tr key={i} className="border-b">
              <td className="p-3 text-gray-700">{i+1}. {check}</td>
              <td className="text-center">
                <input type="radio" name={`ew-${i}`} className="w-5 h-5" onChange={() => setData({...data, [check]: 'Compliant'})} />
              </td>
              <td className="text-center">
                <input type="radio" name={`ew-${i}`} className="w-5 h-5" onChange={() => setData({...data, [check]: 'Non-Compliant'})} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <textarea 
        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        placeholder="Enter corrective actions if any..." 
        rows={3}
        onChange={e => setData({...data, remarks: e.target.value})}
      ></textarea>
      
      <button 
        onClick={submit} 
        className="w-full bg-green-600 hover:bg-green-700 text-white p-4 mt-6 font-bold rounded-lg transition"
      >
        Submit Checklist
      </button>
    </div>
  );
}