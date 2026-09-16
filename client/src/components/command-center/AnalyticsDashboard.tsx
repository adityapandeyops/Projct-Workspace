import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Activity, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const AnalyticsDashboard: React.FC = () => {
  const { stats, departments } = useHospital();

  const hourlyFlowData = [
    { hour: '08:00', actual: 12, predicted: 14, capacity: 45 },
    { hour: '09:00', actual: 28, predicted: 30, capacity: 45 },
    { hour: '10:00', actual: 44, predicted: 42, capacity: 45 },
    { hour: '11:00', actual: 52, predicted: 48, capacity: 45 },
    { hour: '12:00', actual: 38, predicted: 40, capacity: 45 },
    { hour: '13:00', actual: 24, predicted: 26, capacity: 45 },
    { hour: '14:00', actual: 34, predicted: 36, capacity: 45 },
    { hour: '15:00', actual: 42, predicted: 45, capacity: 45 },
    { hour: '16:00', actual: 46, predicted: 44, capacity: 45 },
    { hour: '17:00', actual: 31, predicted: 35, capacity: 45 },
  ];

  const departmentQueueData = departments.map(d => ({
    name: d.displayName.split(' ')[0],
    queue: d.currentQueueLength,
    capacity: d.capacity || 15,
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel rounded-3xl p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Peak Congestion Window</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">11:00 AM</div>
          <span className="text-[11px] text-slate-400">Predicted surge window: 10:30 - 12:15</span>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Average Triage Accuracy</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">98.4%</div>
          <span className="text-[11px] text-slate-400">NEWS2 automated physiological validation</span>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Bottleneck Alleviation Rate</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black font-mono text-teal-300 tracking-tight">-38%</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Wait time reduced vs legacy static queue</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Hourly Influx Forecast */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-white">Hourly Patient Influx & Predictive AI Forecast</h4>
            <p className="text-[11px] text-slate-400">Actual patient intake vs AI ARIMA prediction model</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '11px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="actual" name="Actual Intake" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="predicted" name="AI Prediction" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Capacity Load */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-white">Department Queue vs Capacity Thresholds</h4>
            <p className="text-[11px] text-slate-400">Current waiting count compared to maximum wing capacity</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentQueueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '11px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="queue" name="Waiting Queue" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="capacity" name="Max Capacity" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
