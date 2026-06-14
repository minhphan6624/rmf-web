import { currentTime } from './formatting';
import {
  DashboardData,
  EventType,
  MissionEvent,
  MissionPhase,
  MissionStatus,
  MissionTask,
  Robot,
  RobotState,
  TaskStatus,
  Zone,
  ZoneStatus,
  ZoneType,
} from './types';

type RawMissionState = Record<string, unknown>;
type RawMissionEvent = Record<string, unknown>;

const fallbackPositions: Record<string, { x: number; y: number }> = {
  source: { x: 18, y: 28 },
  robot1_home: { x: 12, y: 72 },
  upstream_exit: { x: 38, y: 48 },
  transfer: { x: 54, y: 48 },
  downstream_exit: { x: 68, y: 48 },
  destination: { x: 84, y: 28 },
  robot2_home: { x: 88, y: 72 },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function formatTimestamp(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value * 1000).toLocaleTimeString('en-AU', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return currentTime();
}

function missionStatus(value: unknown): MissionStatus {
  const status = asString(value, 'idle');
  return ['idle', 'active', 'paused', 'completed', 'failed', 'cancelled'].includes(status)
    ? (status as MissionStatus)
    : 'idle';
}

function missionPhase(value: unknown): MissionPhase {
  const phase = asString(value, 'idle');
  return [
    'idle',
    'mission_created',
    'robot_assigned',
    'moving_to_pickup',
    'pickup_reached',
    'loading',
    'moving_to_transfer_zone',
    'waiting_at_transfer_zone',
    'transfer_complete',
    'moving_to_dropoff',
    'dropoff_reached',
    'mission_complete',
    'mission_failed',
    'mission_paused',
  ].includes(phase)
    ? (phase as MissionPhase)
    : 'idle';
}

function robotState(value: unknown): RobotState {
  const state = asString(value, 'idle');
  return [
    'idle',
    'assigned',
    'moving',
    'waiting',
    'blocked',
    'charging',
    'failed',
    'offline',
  ].includes(state)
    ? (state as RobotState)
    : 'idle';
}

function taskStatus(value: unknown): TaskStatus {
  const status = asString(value, 'pending');
  return ['pending', 'active', 'completed', 'waiting', 'failed', 'skipped', 'cancelled'].includes(
    status,
  )
    ? (status as TaskStatus)
    : 'pending';
}

function zoneType(value: unknown): ZoneType {
  const type = asString(value, 'blocked');
  return ['pickup', 'dropoff', 'transfer', 'base', 'staging', 'blocked'].includes(type)
    ? (type as ZoneType)
    : 'blocked';
}

function zoneStatus(value: unknown): ZoneStatus {
  const status = asString(value, 'available');
  return ['available', 'occupied', 'blocked'].includes(status)
    ? (status as ZoneStatus)
    : 'available';
}

function eventType(value: unknown): EventType {
  const type = asString(value, '');
  if (type === 'OperatorCommand') {
    return 'operator_event';
  }
  if (type.includes('Task')) {
    return 'task_event';
  }
  if (type.includes('Robot') || type.includes('ExecutionCommand')) {
    return 'robot_event';
  }
  return 'mission_event';
}

function existingRobot(base: DashboardData, id: string): Robot | undefined {
  return base.robots.find((robot) => robot.id === id);
}

function existingZone(base: DashboardData, id: string): Zone | undefined {
  return base.zones.find((zone) => zone.id === id);
}

function positionFor(id: string, existing?: { position: { x: number; y: number } }) {
  return existing?.position ?? fallbackPositions[id] ?? { x: 50, y: 50 };
}

function mapRobots(base: DashboardData, state: RawMissionState): Robot[] {
  return asArray(state.robots).map((robot) => {
    const id = asString(robot.id, 'robot');
    const existing = existingRobot(base, id);
    return {
      id,
      label: asString(robot.label, existing?.label ?? id),
      state: robotState(robot.mission_state),
      task: asNullableString(robot.active_task_id),
      battery: existing?.battery ?? 100,
      location: asString(robot.location, existing?.location ?? 'unknown'),
      position: positionFor(asString(robot.location, id), existing),
      issue: asNullableString(robot.issue),
      rmf_task_id: asNullableString(robot.rmf_task_id),
      last_update: formatTimestamp(robot.last_update),
    };
  });
}

function mapTasks(state: RawMissionState): MissionTask[] {
  return asArray(state.tasks).map((task) => ({
    id: asString(task.id, 'task'),
    label: asString(task.label, asString(task.id, 'Task')),
    status: taskStatus(task.status),
    assigned_robot: asString(task.assigned_robot, ''),
    start: asNullableString(task.start),
    goal: asNullableString(task.goal),
    dependencies: Array.isArray(task.dependencies)
      ? task.dependencies.filter((item): item is string => typeof item === 'string')
      : [],
    notes: asString(task.notes, asString(task.blocked_reason, '')),
  }));
}

function mapZones(base: DashboardData, state: RawMissionState): Zone[] {
  return asArray(state.zones).map((zone) => {
    const id = asString(zone.id, 'zone');
    const existing = existingZone(base, id);
    return {
      id,
      label: asString(zone.label, existing?.label ?? id),
      type: zoneType(zone.type),
      position: positionFor(id, existing),
      status: zoneStatus(zone.status),
      occupied_by: asNullableString(zone.occupied_by) ?? undefined,
    };
  });
}

export function missionEventToDashboardEvent(event: RawMissionEvent): MissionEvent {
  return {
    id: asString(event.event_id, `mission_event_${asString(event.timestamp, currentTime())}`),
    timestamp: formatTimestamp(event.timestamp),
    type: eventType(event.type),
    message: asString(event.message, asString(event.type, 'Mission event')),
  };
}

export function mergeMissionState(base: DashboardData, state: RawMissionState): DashboardData {
  const mission = asRecord(state.mission);
  const lastUpdate = formatTimestamp(mission.last_update ?? state.last_update_time);
  const robots = mapRobots(base, state);
  const tasks = mapTasks(state);
  const zones = mapZones(base, state);
  const lastEvent = asRecord(state.last_event);
  const nextEvent =
    Object.keys(lastEvent).length > 0 ? missionEventToDashboardEvent(lastEvent) : undefined;

  return {
    ...base,
    mission: {
      ...base.mission,
      id: asString(mission.id, base.mission.id),
      name: asString(mission.name, base.mission.name),
      status: missionStatus(mission.status),
      phase: missionPhase(mission.phase),
      current_step: asNumber(mission.current_step, base.mission.current_step),
      total_steps: asNumber(mission.total_steps, base.mission.total_steps),
      active_robot: asNullableString(mission.active_robot),
      current_blocker: asNullableString(mission.current_blocker),
      next_step: asNullableString(mission.next_step),
      last_update: lastUpdate,
    },
    system: {
      ...base.system,
      connection_status: 'connected',
      robots_online: robots.filter((robot) => robot.state !== 'offline').length,
      robots_total: robots.length,
      last_update: lastUpdate,
    },
    robots,
    tasks,
    zones,
    events: nextEvent
      ? [nextEvent, ...base.events.filter((event) => event.id !== nextEvent.id)]
      : base.events,
  };
}
