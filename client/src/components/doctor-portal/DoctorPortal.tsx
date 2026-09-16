import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { DoctorQueueManager } from './DoctorQueueManager';
import { Doctor } from '../../types';

export const DoctorPortal: React.FC = () => {
  const { doctors } = useHospital();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(doctors[0] || null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DoctorQueueManager
        selectedDoctor={selectedDoctor}
        onSelectDoctor={(doc) => setSelectedDoctor(doc)}
      />
    </div>
  );
};
