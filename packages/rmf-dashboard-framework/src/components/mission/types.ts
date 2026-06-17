export type MissionStatus = 'idle' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type MissionPhase =
  | 'idle'
  | 'mission_created'
  | 'robot_assigned'
  | 'moving_to_pickup'
  | 'pickup_reached'
  | 'loading'
  | 'moving_to_transfer_zone'
  | 'waiting_at_transfer_zone'
  | 'transfer_complete'
  | 'moving_to_dropoff'
  | 'dropoff_reached'
  | 'mission_complete'
  | 'mission_failed'
  | 'mission_paused';

export type RobotState =
  | 'idle'
  | 'assigned'
  | 'moving'
  | 'waiting'
  | 'blocked'
  | 'charging'
  | 'failed'
  | 'offline';

export type TaskStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'waiting'
  | 'failed'
  | 'skipped'
  | 'cancelled';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type ZoneType = 'pickup' | 'dropoff' | 'transfer' | 'base' | 'staging' | 'blocked';
export type ZoneStatus = 'available' | 'occupied' | 'blocked';
export type PackageStatus = 'at_source' | 'carried' | 'at_transfer' | 'delivered' | 'in_transit';
export type EventType =
  | 'mission_event'
  | 'task_event'
  | 'robot_event'
  | 'alert_event'
  | 'operator_event'
  | 'system_event';

export interface Position {
  x: number;
  y: number;
}

export interface MissionSummary {
  id: string;
  name: string;
  status: MissionStatus;
  phase: MissionPhase;
  current_step: number;
  total_steps: number;
  active_robot: string | null;
  current_blocker: string | null;
  next_step: string | null;
  started_at: string;
  last_update: string;
}

export interface SystemState {
  connection_status: 'connected' | 'degraded' | 'disconnected';
  robots_online: number;
  robots_total: number;
  last_update: string;
}

export interface Robot {
  id: string;
  label: string;
  state: RobotState;
  task: string | null;
  battery: number;
  location: string;
  position: Position;
  issue: string | null;
  rmf_task_id: string | null;
  last_update: string;
}

export interface MissionTask {
  id: string;
  label: string;
  status: TaskStatus;
  phase?: string;
  assigned_robot: string;
  start: string | null;
  goal: string | null;
  dependencies: string[];
  blocked_reason?: string | null;
  blocked_by?: string | null;
  waiting_at?: string | null;
  unblock_condition?: string | null;
  next_expected_event?: string | null;
  notes: string;
}

export interface MissionPackage {
  id: string;
  status: PackageStatus;
  location: string;
  carried_by: string | null;
}

export interface Zone {
  id: string;
  label: string;
  type: ZoneType;
  position: Position;
  status: ZoneStatus;
  occupied_by?: string;
  package_buffer?: string;
  active_lease_owner?: string;
}

export interface MissionAlert {
  id: string;
  severity: AlertSeverity;
  source: 'mission' | 'robot' | 'task' | 'system';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  related_robot?: string;
  related_task?: string;
}

export interface MissionEvent {
  id: string;
  timestamp: string;
  type: EventType;
  message: string;
}

export interface DashboardData {
  mission: MissionSummary;
  system: SystemState;
  packages: MissionPackage[];
  robots: Robot[];
  tasks: MissionTask[];
  zones: Zone[];
  alerts: MissionAlert[];
  events: MissionEvent[];
}

export type SelectableEntityType = 'robot' | 'task' | 'zone' | 'alert' | 'mission';

export interface SelectedEntity {
  type: SelectableEntityType | null;
  id: string | null;
}

export type MissionAction = 'start' | 'pause' | 'resume' | 'abort';
export type RobotAction = 'send_to_charger' | 'pause_robot' | 'retry_task' | 'reassign_task';
export type TaskAction = 'retry_task' | 'reassign_task' | 'cancel_task';

export type ScenarioId = 'normal' | 'transfer_zone_occupied' | 'low_battery' | 'robot_failure';
