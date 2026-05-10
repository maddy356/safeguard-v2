'use client';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductionDashboard() {
  const { data: session, status } = useSession();
  const [screen, setScreen] = useState('menu');
  const [forms, setForms] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [location, setLocation] = useState("");
  const [zone, setZone] = useState("A");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [mgrComment, setMgrComment] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'labourer' });
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const userRole = String((session?.user as any)?.role || 'labourer').toLowerCase();
  const userName = session?.user?.name || '';

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) fetchAllData();
  }, [status, session]);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const fetchAllData = async () => {
    try {
      const res = await fetch(`/api/forms/lists?user=${session?.user?.name}&role=${userRole}`);
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (e) {
      setForms([]);
    }
  };

  const handleLabourerSubmit = async (type: string) => {
    const submissionData = {
      ...formData,
      metadata: { zone, location, inspectionDate }
    };

    const res = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType: type,
        submittedBy: userName,
        data: submissionData,
        attachment
      })
    });

    if (res.ok) {
      notify("Inspection Logged Successfully");
      setFormData({});
      setAttachment(null);
      setLocation("");
      setScreen('menu');
      fetchAllData();
    }
  };

  const handleManagerReview = async (formId: string) => {
    const res = await fetch('/api/forms/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: formId, managerRemarks: mgrComment, status: 'Reviewed' })
    });
    if (res.ok) {
      notify("Review Finalized");
      setMgrComment("");
      setScreen('menu');
      fetchAllData();
    }
  };

  const handleAdminCreateUser = async () => {
    if(!newUser.username || !newUser.password) return notify("Fill all fields", "error");
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (res.ok) {
      notify(`User ${newUser.username} created`);
      setNewUser({ username: '', password: '', role: 'labourer' });
      setScreen('menu');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (status === 'loading') return <div className="p-20 text-center font-black animate-pulse text-blue-600 tracking-widest">SYSTEM INITIALIZING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-md border-b px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h1 className="font-black text-xl italic text-slate-800 uppercase tracking-tighter text-blue-600">Safeguard v2</h1>
        </div>
        <button onClick={() => signOut()} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Logout</button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {statusMsg && (
          <div className={`fixed top-20 right-6 z-[100] p-4 rounded-2xl shadow-2xl font-bold text-xs uppercase tracking-widest animate-in slide-in-from-right duration-300 ${
            statusMsg.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {statusMsg.type === 'success' ? '✓ ' : '⚠ '} {statusMsg.text}
          </div>
        )}

        {screen === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 animate-in fade-in duration-500">
            <div className="md:col-span-2 mb-2">
               <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Operational Overview</h2>
               <p className="text-3xl font-black text-slate-800 tracking-tight">Welcome back, {userName}</p>
            </div>
            {(userRole === 'admin' || userName === 'admin123') && (
              <button onClick={() => setScreen('admin_panel')} className="md:col-span-2 p-10 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 uppercase ring-offset-2 hover:ring-2 ring-slate-900">+ Register New Staff</button>
            )}
            {userRole === 'labourer' && (
              <>
                <MenuBtn title="New Audit" sub="Submit Daily Check" color="blue" onClick={() => setScreen('select_form')} />
                <MenuBtn title="My Reports" sub="View Status & Remarks" color="green" onClick={() => setScreen('history')} />
              </>
            )}
            {userRole === 'manager' && (
              <MenuBtn title="Review" sub={`${forms.filter(f => f.status === 'Pending').length} Pending Tasks`} color="orange" onClick={() => setScreen('mgr_review')} />
            )}
          </div>
        )}

        {/* ADMIN VIEW */}
        {screen === 'admin_panel' && (
          <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <button onClick={() => setScreen('menu')} className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">← Back</button>
            <h2 className="text-2xl font-black mb-8 uppercase italic">Personnel Access</h2>
            <div className="space-y-4">
              <input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="Username" />
              <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="Password" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border outline-none">
                <option value="labourer">Labourer</option>
                <option value="manager">Manager</option>
              </select>
              <button onClick={handleAdminCreateUser} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase">Create Account</button>
            </div>
          </div>
        )}

        {/* SELECT FORM */}
        {screen === 'select_form' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            <button onClick={() => setScreen('menu')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">← Back to Menu</button>
            <h2 className="text-2xl font-black italic uppercase text-slate-800 tracking-tighter">Choose Inspection Module</h2>
            <div className="grid grid-cols-1 gap-4">
              <FormSelectorBtn icon="🚿" title="Eyewash Station" desc="Weekly maintenance & safety check" color="blue" onClick={() => { setFormData({}); setScreen('form_Eyewash'); }} />
              <FormSelectorBtn icon="🚜" title="Forklift Pre-Op" desc="Daily mechanical & safety validation" color="orange" onClick={() => { setFormData({}); setScreen('form_Forklift'); }} />
              <FormSelectorBtn icon="🛡️" title="Site Safety" desc="General workplace hazard assessment" color="green" onClick={() => { setFormData({}); setScreen('form_SiteSafety'); }} />
            </div>
          </div>
        )}

        {/* DYNAMIC FORM SCREEN */}
        {screen.startsWith('form_') && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black mb-1 uppercase italic text-blue-600 tracking-tighter">
                {screen.split('_')[1] === 'Eyewash' ? 'Eyewash Safety Checklist - Stores' : 
                 screen.split('_')[1] === 'Forklift' ? 'Forklift Pre-Op Checklist' : 'Site Safety Checklist'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest border-b pb-4">Compliance Protocol Checklist</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Department / Zone</label>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none transition-all">
                  {['A', 'B', 'C', 'D', 'E'].map(z => <option key={z} value={z}>Zone {z}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Specific Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bay 4 / North Wall" className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Date of Inspection</label>
                <input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar space-y-1 mb-8">
                {/* 1. EYEWASH FORM */}
                {screen === 'form_Eyewash' && (
                  <>
                    <FormRow label="1. Access - Path to station clear (no obstacles, pallets, equipment)" id="1_access" state={formData} setState={setFormData} />
                    <FormRow label="2. Lighting - Area well-lit, emergency light functional if equipped" id="2_lighting" state={formData} setState={setFormData} />
                    <FormRow label="3. Signage - Highly visible sign (dark yellow/green with ISO 7010 pictogram)" id="3_signage" state={formData} setState={setFormData} />
                    <FormRow label="4. Shut-off valve - No leaks, no corrosion, handles easily" id="4_valve" state={formData} setState={setFormData} />
                    <FormRow label="5. Plumbed line - Clean, not yellowed, seal intact" id="5_plumbed" state={formData} setState={setFormData} />
                    <FormRow label="6. Bowl / basin - Clean, no debris, no scratches" id="6_bowl" state={formData} setState={setFormData} />
                    <FormRow label="7. Protective covers - Closed (if it is plumbed-in)" id="7_covers" state={formData} setState={setFormData} />
                    <FormRow label="8. Area safety - No hazardous chemicals stored directly next to unit" id="8_area" state={formData} setState={setFormData} />
                    <FormRow label="9. Water clarity - Clear, no rust, no particles" id="9_clarity" state={formData} setState={setFormData} />
                    <FormRow label="10. Flow rate (quick check) - Visually strong, steady flow" id="10_flow" state={formData} setState={setFormData} />
                  </>
                )}

                {/* 2. FORKLIFT FORM */}
                {screen === 'form_Forklift' && (
                  <>
                    <FormRow label="1. Lift system (includes cables, forks, etc.)" id="1_lift" state={formData} setState={setFormData} showNA />
                    <FormRow label="2. Seat Belt" id="2_seatbelt" state={formData} setState={setFormData} showNA />
                    <FormRow label="3. Cabin" id="3_cabin" state={formData} setState={setFormData} showNA />
                    <FormRow label="4. Emergency Tool" id="4_tool" state={formData} setState={setFormData} showNA />
                    <FormRow label="5. Steps" id="5_steps" state={formData} setState={setFormData} showNA />
                    <FormRow label="6. Manufacturer Manual/ Maintenance Program" id="6_manual" state={formData} setState={setFormData} showNA />
                    <FormRow label="7. Leakage in hydraulic cylinders" id="7_hydro_leak" state={formData} setState={setFormData} showNA />
                    <FormRow label="8. Leakage of Diesel/ Oil and Lubricant etc." id="8_fuel_leak" state={formData} setState={setFormData} showNA />
                    <FormRow label="9. Warning & Cautionary Boards" id="9_boards" state={formData} setState={setFormData} showNA />
                    <FormRow label="10. Main clutch" id="10_clutch" state={formData} setState={setFormData} showNA />
                    <FormRow label="11. Condition of Tyre/Tyre pressure" id="11_tires" state={formData} setState={setFormData} showNA />
                    <FormRow label="12. Condition of Battery and Lamps" id="12_battery" state={formData} setState={setFormData} showNA />
                    <FormRow label="13. Reverse horn" id="13_horn" state={formData} setState={setFormData} showNA />
                    <FormRow label="14. Operators Fitness" id="14_fitness" state={formData} setState={setFormData} showNA />
                    <FormRow label="15. Fire Extinguisher in operators cabin" id="15_extinguisher" state={formData} setState={setFormData} showNA />
                    <FormRow label="16. Rotatory beacons" id="16_beacons" state={formData} setState={setFormData} showNA />
                    <FormRow label="17. Personnel operating the forklift properly trained" id="17_training" state={formData} setState={setFormData} showNA />
                    <FormRow label="18. Registration & Insurance Paper" id="18_papers" state={formData} setState={setFormData} showNA />
                    <FormRow label="19. Forklift Operator License" id="19_license" state={formData} setState={setFormData} showNA />
                    <FormRow label="20. Forklift Operator TTSJV ID Badge" id="20_badge" state={formData} setState={setFormData} showNA />
                  </>
                )}

                {/* 3. SITE SAFETY FORM */}
                {screen === 'form_SiteSafety' && (
                  <>
                    <h3 className="text-blue-600 font-black text-xs uppercase p-4">A. PEDESTRIAN SAFETY</h3>
                    <FormRow label="1. Pedestrian walkways clearly marked" id="A1" state={formData} setState={setFormData} />
                    <FormRow label="2. Walkways free from obstructions" id="A2" state={formData} setState={setFormData} />
                    <FormRow label="3. High-vis clothing being worn where necessary" id="A3" state={formData} setState={setFormData} />
                    
                    <h3 className="text-blue-600 font-black text-xs uppercase p-4 mt-4">B. LIFTING OPERATIONS</h3>
                    <FormRow label="1. Lifting equipment in date for inspection" id="B1" state={formData} setState={setFormData} />
                    <FormRow label="2. Load weight confirmed within equipment capacity" id="B2" state={formData} setState={setFormData} />
                    <FormRow label="3. SLW (Safe Working Load) marked on equipment" id="B3" state={formData} setState={setFormData} />

                    <h3 className="text-blue-600 font-black text-xs uppercase p-4 mt-4">C. PPE & WORK TOOLS</h3>
                    <FormRow label="1. Operators wearing correct PPE" id="C1" state={formData} setState={setFormData} />
                    <FormRow label="2. Tools in good condition with safety guards" id="C2" state={formData} setState={setFormData} />
                    <FormRow label="3. First aid kits stocked and accessible" id="C3" state={formData} setState={setFormData} />
                  </>
                )}
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="flex flex-col items-center gap-4">
                {!attachment ? (
                  <div className="flex flex-wrap justify-center gap-3">
                    <button 
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                    >
                      <span className="text-lg">📷</span> Take Photo
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-colors"
                    >
                      <span>📁</span> Upload File
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <img src={attachment} className="w-full max-h-48 object-cover rounded-2xl border-4 border-white shadow-xl" alt="preview" />
                    <button 
                      onClick={() => setAttachment(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full font-black shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{attachment ? '✓ Evidence Secured' : 'Attach photographic evidence of inspection'}</p>
              </div>
            </div>

            <button onClick={() => handleLabourerSubmit(screen.split('_')[1])} className="w-full bg-blue-600 text-white p-6 rounded-[1.5rem] font-black uppercase mt-8 shadow-xl hover:bg-blue-700 transition-all">Log Completed Inspection</button>
          </div>
        )}

        {/* MANAGER REVIEW */}
        {screen === 'mgr_review' && (
          <div className="space-y-6">
            <button onClick={() => setScreen('menu')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">← Dashboard</button>
            {forms.filter(f => f.status === 'Pending').map(f => (
              <div key={f._id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-[12px] border-orange-500 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-black uppercase">{f.formType} Review</h3>
                  <div className="flex gap-4 my-2 text-[10px] font-bold text-slate-400 uppercase">
                    <span>Zone: {f.data?.metadata?.zone}</span>
                    <span>Loc: {f.data?.metadata?.location}</span>
                    <span>By: {f.submittedBy}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl my-4 space-y-1 border max-h-40 overflow-y-auto">
                    {Object.entries(f.data).map(([k, v]) => k !== 'metadata' && (
                      <div key={k} className="flex justify-between text-[10px] border-b pb-1">
                        <span className="font-bold text-slate-500 max-w-[70%] truncate">{k.replace(/_/g, ' ').toUpperCase()}</span>
                        <span className={v === 'YES' || v === 'OK' ? 'text-green-600 font-black' : v === 'NO' || v === 'NOT OK' ? 'text-red-600 font-black' : 'text-slate-400 font-black'}>{v as string}</span>
                      </div>
                    ))}
                  </div>

                  <textarea className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-sm mb-4 outline-none focus:border-blue-500" placeholder="Managerial feedback..." rows={3} onChange={(e) => setMgrComment(e.target.value)} />
                  <button onClick={() => handleManagerReview(f._id)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase hover:bg-green-600 transition-colors">Authorize Sign-Off</button>
                </div>
                {f.attachment && <img src={f.attachment} className="w-full md:w-48 h-48 object-cover rounded-2xl border" alt="evidence" />}
              </div>
            ))}
          </div>
        )}

        {/* HISTORY VIEW */}
        {screen === 'history' && (
          <div className="space-y-4">
            <button onClick={() => setScreen('menu')} className="text-[10px] font-black text-slate-400 uppercase">← Dashboard</button>
            {forms.map(f => (
              <div key={f._id} className="bg-white p-6 rounded-3xl border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black uppercase text-slate-700">{f.formType} - Zone {f.data?.metadata?.zone}</h4>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${f.status === 'Reviewed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{f.status}</span>
                </div>
                {f.managerRemarks && (
                  <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                    <p className="text-xs font-bold text-slate-600 italic">"{f.managerRemarks}"</p>
                  </div>
                )}
                <p className="text-[9px] font-black text-slate-300 mt-2 uppercase">{f.data?.metadata?.inspectionDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FormSelectorBtn({ icon, title, desc, color, onClick }: any) {
  const colors: any = { blue: 'border-blue-500', orange: 'border-orange-500', green: 'border-green-500' };
  return (
    <button onClick={onClick} className={`flex items-center gap-6 p-6 bg-white rounded-3xl shadow-xl shadow-slate-100 border-l-[12px] ${colors[color]} text-left hover:scale-[1.02] transition-all group`}>
      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
      <div>
        <h3 className="font-black text-lg text-slate-800 uppercase italic">{title}</h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{desc}</p>
      </div>
    </button>
  );
}

function MenuBtn({ title, sub, color, onClick }: any) {
  const styles: any = { 
    blue: 'border-blue-600 text-blue-600 hover:bg-blue-50', 
    green: 'border-green-500 text-green-600 hover:bg-green-50', 
    orange: 'border-orange-500 text-orange-600 hover:bg-orange-50' 
  };
  return (
    <button onClick={onClick} className={`p-10 bg-white rounded-[2.5rem] border-b-[12px] ${styles[color]} shadow-xl text-left transition-all hover:translate-y-[-4px]`}>
      <h3 className="font-black text-2xl text-slate-800 tracking-tighter">{title}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
    </button>
  );
}

function FormRow({ label, id, state, setState, showNA = false }: any) {
  // Use the labels from your docs (OK / NOT OK) for Forklift
  const isForklift = id.includes('_') && !isNaN(parseInt(id.split('_')[0]));
  const posLabel = isForklift ? "OK" : "YES";
  const negLabel = isForklift ? "NOT OK" : "NO";

  return (
    <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl mb-2 border border-slate-100 hover:bg-white transition-all group">
      <span className="font-bold text-[11px] text-slate-600 pr-4 group-hover:text-slate-900">{label}</span>
      <div className="flex gap-2">
        <button onClick={() => setState({...state, [id]: posLabel})} className={`px-4 py-2 rounded-xl text-[9px] font-black border-2 transition-all ${state[id] === posLabel ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-300 border-slate-200'}`}>{posLabel}</button>
        <button onClick={() => setState({...state, [id]: negLabel})} className={`px-4 py-2 rounded-xl text-[9px] font-black border-2 transition-all ${state[id] === negLabel ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-300 border-slate-200'}`}>{negLabel}</button>
        {showNA && (
          <button onClick={() => setState({...state, [id]: 'N/A'})} className={`px-4 py-2 rounded-xl text-[9px] font-black border-2 transition-all ${state[id] === 'N/A' ? 'bg-slate-400 text-white border-slate-400' : 'bg-white text-slate-300 border-slate-200'}`}>N/A</button>
        )}
      </div>
    </div>
  );
}