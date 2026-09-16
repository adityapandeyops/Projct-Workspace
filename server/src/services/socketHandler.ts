import { Server as SocketIOServer } from 'socket.io';
import { hospitalStore } from './hospitalStore.js';

let ioInstance: SocketIOServer | null = null;

export function setupSocketIO(io: SocketIOServer) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Send initial snapshot
    socket.emit('state:sync', {
      patients: hospitalStore.getPatients(),
      beds: hospitalStore.getBeds(),
      doctors: hospitalStore.getDoctors(),
      departments: hospitalStore.getDepartmentMetrics(),
      stats: hospitalStore.getHospitalStats(),
      recommendations: hospitalStore.getRecommendations()
    });

    socket.on('patient:subscribe', (tokenNumber: string) => {
      socket.join(`patient:${tokenNumber}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

export function broadcastHospitalUpdate(event: string, payload: any) {
  if (!ioInstance) return;
  ioInstance.emit(event, payload);

  // Broadcast overall state sync
  ioInstance.emit('state:sync', {
    patients: hospitalStore.getPatients(),
    beds: hospitalStore.getBeds(),
    doctors: hospitalStore.getDoctors(),
    departments: hospitalStore.getDepartmentMetrics(),
    stats: hospitalStore.getHospitalStats(),
    recommendations: hospitalStore.getRecommendations()
  });
}

export function notifyPatientUpdate(tokenNumber: string, patientData: any) {
  if (!ioInstance) return;
  ioInstance.to(`patient:${tokenNumber}`).emit('patient:updated', patientData);
}
