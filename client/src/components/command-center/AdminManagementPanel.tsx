import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bed as BedIcon, 
  Stethoscope, 
  Sliders, 
  Radio, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2,
  Wind,
  Zap,
  Volume2
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { BedType, DepartmentType, Doctor } from '../../types';

export const AdminManagementPanel: React.FC = () => {
  const { 
    beds, 
    doctors, 
    departments, 
    auditLogs, 
    createBed, 
    deleteBed, 
    createDoctor, 
    updateDoctorDetails, 
    deleteDoctor, 
    updateDepartmentCapacity, 
    broadcastAlert 
  } = useHospital();

  const [adminTab, setAdminTab] = useState<'BEDS' | 'DOCTORS' | 'DEPARTMENTS' | 'BROADCAST'>('BEDS');

  // New Bed Form State
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedWard, setNewBedWard] = useState('General Ward A (Male)');
  const [newBedType, setNewBedType] = useState<BedType>('GENERAL');
  const [newBedOxygen, setNewBedOxygen] = useState(false);
  const [newBedVent, setNewBedVent] = useState(false);

  // New Doctor Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocDept, setNewDocDept] = useState<DepartmentType>('GENERAL_MEDICINE');
  const [newDocChamber, setNewDocChamber] = useState('');
  const [newDocStatus, setNewDocStatus] = useState<Doctor['status']>('AVAILABLE');

  // Broadcast Form State
  const [broadcastCode, setBroadcastCode] = useState<'CODE_RED' | 'CODE_BLUE' | 'CODE_YELLOW' | 'GENERAL_ANNOUNCEMENT'>('CODE_YELLOW');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Department Capacity Editing
  const [editingCapacity, setEditingCapacity] = useState<Record<string, number>>({});

  // Handlers
  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedNumber.trim()) return;
    await createBed({
      bedNumber: newBedNumber.trim().toUpperCase(),
      ward: newBedWard,
      type: newBedType,
      oxygenSupported: newBedOxygen,
      ventilatorAttached: newBedVent,
    });
    setNewBedNumber('');
    alert(`Bed ${newBedNumber} created successfully!`);
  };

  const handleDeleteBed = async (id: string, bedNumber: string) => {
    if (confirm(`Decommission bed ${bedNumber}?`)) {
      await deleteBed(id);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocSpecialty.trim() || !newDocChamber.trim()) return;
    await createDoctor({
      name: newDocName.trim(),
      specialty: newDocSpecialty.trim(),
      department: newDocDept,
      chamberNumber: newDocChamber.trim(),
      status: newDocStatus,
    });
    setNewDocName('');
    setNewDocSpecialty('');
    setNewDocChamber('');
    alert('Doctor added to active hospital roster!');
  };

  const handleUpdateDoctorStatus = async (id: string, status: Doctor['status']) => {
    await updateDoctorDetails(id, { status });
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from roster?`)) {
      await deleteDoctor(id);
    }
  };

  const handleSaveCapacity = async (dept: string) => {
    const cap = editingCapacity[dept];
    if (cap && cap > 0) {
      await updateDepartmentCapacity(dept, cap);
      alert(`Capacity for ${dept} updated to ${cap}!`);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    await broadcastAlert({
      code: broadcastCode,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
    });
    setBroadcastTitle('');
    setBroadcastMessage('');
    alert('Emergency broadcast transmitted across all hospital stations!');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white font-display">Hospital Administration & System Console</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Manage hospital beds, clinical doctors roster, department capacities, and emergency broadcasts.</p>
          </div>
        </div>

        {/* Sub-Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
          <button
            onClick={() => setAdminTab('BEDS')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              adminTab === 'BEDS' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BedIcon className="w-3.5 h-3.5" />
            <span>Beds ({beds.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('DOCTORS')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              adminTab === 'DOCTORS' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors ({doctors.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('DEPARTMENTS')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              adminTab === 'DEPARTMENTS' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Capacities</span>
          </button>

          <button
            onClick={() => setAdminTab('BROADCAST')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              adminTab === 'BROADCAST' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcasts & Logs</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Beds Admin */}
      {adminTab === 'BEDS' && (
        <div className="space-y-6">
          
          {/* Add Bed Form */}
          <form onSubmit={handleAddBed} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              <span>Provision New Hospital Bed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bed Number / Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ER-13 / ICU-09"
                  value={newBedNumber}
                  onChange={(e) => setNewBedNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ward Name *</label>
                <select
                  value={newBedWard}
                  onChange={(e) => {
                    setNewBedWard(e.target.value);
                    if (e.target.value.includes('ICU')) setNewBedType('ICU');
                    else if (e.target.value.includes('Emergency')) setNewBedType('EMERGENCY');
                    else if (e.target.value.includes('HDU')) setNewBedType('HDU');
                    else setNewBedType('GENERAL');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer transition"
                >
                  <option value="Emergency Trauma Ward">Emergency Trauma Ward</option>
                  <option value="Intensive Coronary Care Unit">Intensive Coronary Care Unit (ICU)</option>
                  <option value="High Dependency Unit (HDU)">High Dependency Unit (HDU)</option>
                  <option value="General Ward A (Male)">General Ward A (Male)</option>
                  <option value="General Ward B (Female)">General Ward B (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bed Type *</label>
                <select
                  value={newBedType}
                  onChange={(e) => setNewBedType(e.target.value as BedType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer transition"
                >
                  <option value="GENERAL">General</option>
                  <option value="ICU">ICU</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="HDU">HDU</option>
                </select>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBedOxygen}
                    onChange={(e) => setNewBedOxygen(e.target.checked)}
                    className="accent-teal-500 w-4 h-4 rounded"
                  />
                  <span>Oxygen (O2)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBedVent}
                    onChange={(e) => setNewBedVent(e.target.checked)}
                    className="accent-teal-500 w-4 h-4 rounded"
                  />
                  <span>Ventilator</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-teal-500/20 transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bed to Ward Roster</span>
            </button>
          </form>

          {/* Existing Beds Table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Active Ward Beds Roster ({beds.length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {beds.map((b) => (
                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-white font-mono font-bold text-sm">{b.bedNumber}</strong>
                      <span className="text-[10px] text-teal-400/80 font-mono">({b.type})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">{b.ward}</span>
                    <span className={`text-[10px] font-bold ${b.status === 'OCCUPIED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {b.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBed(b.id, b.bedNumber)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Decommission Bed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Doctors Admin */}
      {adminTab === 'DOCTORS' && (
        <div className="space-y-6">
          
          {/* Add Doctor Form */}
          <form onSubmit={handleAddDoctor} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              <span>Register New Doctor / Specialist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Siddharth Sen"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specialty *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Pulmonologist"
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department *</label>
                <select
                  value={newDocDept}
                  onChange={(e) => setNewDocDept(e.target.value as DepartmentType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer transition"
                >
                  <option value="GENERAL_MEDICINE">General Medicine</option>
                  <option value="CARDIOLOGY">Cardiology</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="ORTHOPEDICS">Orthopedics</option>
                  <option value="PEDIATRICS">Pediatrics</option>
                  <option value="RADIOLOGY">Radiology</option>
                  <option value="PATHOLOGY">Pathology</option>
                  <option value="ICU">Critical Care ICU</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chamber / Room *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chamber 110"
                  value={newDocChamber}
                  onChange={(e) => setNewDocChamber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duty Status</label>
                <select
                  value={newDocStatus}
                  onChange={(e) => setNewDocStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer transition"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_CONSULTATION">In Consultation</option>
                  <option value="ON_BREAK">On Break</option>
                  <option value="EMERGENCY_DUTY">Emergency Duty</option>
                  <option value="OFF_DUTY">Off Duty</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-teal-500/20 transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Doctor to Active Roster</span>
            </button>
          </form>

          {/* Doctor List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Clinical Staff Roster ({doctors.length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {doctors.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between text-xs space-y-3 hover:border-slate-700 transition">
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm font-bold">{d.name}</strong>
                      <button
                        onClick={() => handleDeleteDoctor(d.id, d.name)}
                        className="text-slate-400 hover:text-rose-400 transition"
                        title="Remove Doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-teal-400 text-[11px] block mt-0.5">{d.specialty} • {d.chamberNumber}</span>
                    <span className="text-slate-400 text-[10px] block font-mono mt-0.5">Dept: {d.department}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Duty Status:</span>
                    <select
                      value={d.status}
                      onChange={(e) => handleUpdateDoctorStatus(d.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="IN_CONSULTATION">In Consultation</option>
                      <option value="ON_BREAK">On Break</option>
                      <option value="EMERGENCY_DUTY">Emergency Duty</option>
                      <option value="OFF_DUTY">Off Duty</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Department Capacities */}
      {adminTab === 'DEPARTMENTS' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-medium">
            Configure department maximum concurrent queue capacities. Lowering or raising capacity directly recalibrates real-time congestion percentages and bottleneck thresholds.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const currentVal = editingCapacity[dept.department] ?? dept.capacity ?? 15;

              return (
                <div key={dept.department} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                  <div>
                    <h4 className="font-bold text-sm text-white">{dept.displayName}</h4>
                    <span className="text-[11px] text-teal-400 font-mono">Active Queue: {dept.currentQueueLength} pts</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-400">Queue Capacity Threshold:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={currentVal}
                        onChange={(e) => setEditingCapacity({ ...editingCapacity, [dept.department]: Number(e.target.value) })}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center font-bold focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveCapacity(dept.department)}
                        className="px-3.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Emergency Broadcasts & Audit Logs */}
      {adminTab === 'BROADCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Emergency Broadcast Form */}
          <form onSubmit={handleSendBroadcast} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Issue Hospital-Wide Emergency Broadcast</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Emergency Protocol Code</label>
              <select
                value={broadcastCode}
                onChange={(e) => setBroadcastCode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="CODE_YELLOW">CODE YELLOW: Mass Casualty / Surge Activation</option>
                <option value="CODE_BLUE">CODE BLUE: Cardiac Arrest Emergency</option>
                <option value="CODE_RED">CODE RED: Fire / Evacuation Hazard</option>
                <option value="GENERAL_ANNOUNCEMENT">GENERAL NOTICE: Operational Shift Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Broadcast Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Urgent ER Physician Mobilization"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Message *</label>
              <textarea
                required
                rows={3}
                placeholder="Message transmitted live to all doctor chambers, patient portals, and nursing stations..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-rose-600/25 transform hover:scale-[1.01]"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Notice Live</span>
            </button>
          </form>

          {/* System Audit Logs Stream */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live System Audit Trail</span>
              <span className="text-[10px] text-teal-400 font-mono">Last 50 actions</span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-teal-300 font-bold">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
