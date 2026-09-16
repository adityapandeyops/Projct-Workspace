import React, { useState } from 'react';
import { 
  X, 
  Pill, 
  TestTubes, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { Patient, PrescriptionItem, LabOrderItem } from '../../types';
import { useHospital } from '../../context/HospitalContext';

interface PrescriptionEditorModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionEditorModal: React.FC<PrescriptionEditorModalProps> = ({ patient, isOpen, onClose }) => {
  const { addPrescription, addLabOrder, updatePatientStage } = useHospital();
  const [activeTab, setActiveTab] = useState<'PRESCRIPTION' | 'LABS' | 'NOTES'>('PRESCRIPTION');

  // Form State for new medicine
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('Twice daily (After meals)');
  const [duration, setDuration] = useState('5 Days');
  const [instructions, setInstructions] = useState('After meals');

  // Form State for new lab
  const [testName, setTestName] = useState('');
  const [labDept, setLabDept] = useState<'RADIOLOGY' | 'PATHOLOGY'>('PATHOLOGY');

  // Form State for clinical notes
  const [clinicalNotes, setClinicalNotes] = useState(patient.clinicalNotes || '');

  if (!isOpen) return null;

  const handleAddRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    await addPrescription(patient.id, {
      medicineName: medName.trim(),
      dosage,
      frequency,
      duration,
      instructions,
    });

    setMedName('');
    setInstructions('After meals');
    alert('Medication added to digital prescription!');
  };

  const handleAddLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    await addLabOrder(patient.id, {
      testName: testName.trim(),
      department: labDept,
    });

    setTestName('');
    alert('Lab diagnostic requisition created!');
  };

  const handleSaveNotes = async () => {
    await updatePatientStage(patient.id, patient.stage, { clinicalNotes });
    alert('Clinical notes saved successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-teal-400 font-mono">{patient.tokenNumber}</span>
              <span className="text-slate-600">•</span>
              <h3 className="font-bold text-white text-base font-display">{patient.name} ({patient.age}y / {patient.gender})</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Clinical Order & Electronic Health Record</p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="p-4 border-b border-slate-800 flex justify-center bg-slate-950/50">
          <div className="inline-flex items-center space-x-1 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('PRESCRIPTION')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PRESCRIPTION' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Prescriptions ({patient.prescriptions?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('LABS')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LABS' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TestTubes className="w-3.5 h-3.5" />
              <span>Diagnostics ({patient.labOrders?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('NOTES')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'NOTES' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clinical Notes</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* Tab 1: Prescriptions */}
          {activeTab === 'PRESCRIPTION' && (
            <div className="space-y-6">
              
              {/* Existing Prescriptions List */}
              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Prescriptions:</span>
                  <div className="space-y-2">
                    {patient.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white text-sm font-bold block">{rx.medicineName}</strong>
                          <span className="text-slate-400">{rx.dosage} • {rx.frequency} • {rx.duration}</span>
                          {rx.instructions && <div className="text-[11px] text-teal-400 mt-0.5">{rx.instructions}</div>}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  No medication items prescribed yet.
                </div>
              )}

              {/* Add New Rx Form */}
              <form onSubmit={handleAddRx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">+ Add Medicine / Prescription</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medicine Name & Strength *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol 650mg"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 1 Tablet"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Once daily (Morning)">Once daily (Morning)</option>
                      <option value="Once daily (Night)">Once daily (Night)</option>
                      <option value="Twice daily (After meals)">Twice daily (After meals)</option>
                      <option value="Thrice daily (8-hourly)">Thrice daily (8-hourly)</option>
                      <option value="SOS (As needed)">SOS (As needed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 5 Days"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Special Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take with warm water after food"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-teal-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prescription Item</span>
                </button>
              </form>

            </div>
          )}

          {/* Tab 2: Labs */}
          {activeTab === 'LABS' && (
            <div className="space-y-6">
              
              {/* Existing Lab Orders */}
              {patient.labOrders && patient.labOrders.length > 0 ? (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ordered Diagnostic Tests:</span>
                  <div className="space-y-2">
                    {patient.labOrders.map((lab) => (
                      <div key={lab.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white text-sm font-bold block">{lab.testName}</strong>
                          <span className="text-slate-400">{lab.department} • Ordered at {new Date(lab.orderedAt).toLocaleTimeString()}</span>
                          {lab.resultSummary && <div className="text-[11px] text-teal-400 mt-0.5 font-mono">{lab.resultSummary}</div>}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                          {lab.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  No diagnostic tests requested yet.
                </div>
              )}

              {/* Add Lab Form */}
              <form onSubmit={handleAddLab} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">+ Order Diagnostic Test</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Serum Creatinine / Chest X-Ray"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Station Department</label>
                    <select
                      value={labDept}
                      onChange={(e) => setLabDept(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="PATHOLOGY">Pathology & Biochemistry Lab</option>
                      <option value="RADIOLOGY">Radiology & Imaging Suite</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-teal-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Send Order to Laboratory</span>
                </button>
              </form>

            </div>
          )}

          {/* Tab 3: Notes */}
          {activeTab === 'NOTES' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Physician Clinical Findings & Diagnosis</label>
                <textarea
                  rows={6}
                  placeholder="Record patient history, physical examination, provisional diagnosis, and follow-up plan..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed resize-none"
                />
              </div>

              <button
                onClick={handleSaveNotes}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20"
              >
                Save Clinical Notes
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
