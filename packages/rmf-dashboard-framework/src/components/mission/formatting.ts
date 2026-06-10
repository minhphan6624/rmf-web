import { AlertSeverity, MissionStatus, RobotState, TaskStatus } from './types';

export function formatLabel(value: string | null | undefined): string {
  if (!value) {
    return 'None';
  }
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function statusColor(
  status: MissionStatus | RobotState | TaskStatus | AlertSeverity | string,
): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  if (['active', 'moving', 'assigned'].includes(status)) {
    return 'primary';
  }
  if (['completed', 'idle', 'available'].includes(status)) {
    return 'success';
  }
  if (['paused', 'waiting', 'blocked', 'warning', 'occupied'].includes(status)) {
    return 'warning';
  }
  if (['failed', 'cancelled', 'offline', 'critical'].includes(status)) {
    return 'error';
  }
  if (status === 'info') {
    return 'info';
  }
  return 'default';
}

export function currentTime(): string {
  return new Date().toLocaleTimeString('en-AU', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
