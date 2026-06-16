import { DashboardData, ScenarioId } from './types';

const baseData: DashboardData = {
  mission: {
    id: 'delivery_001',
    name: 'Multi-Point Delivery Mission',
    status: 'active',
    phase: 'moving_to_pickup',
    current_step: 2,
    total_steps: 7,
    active_robot: 'tb3_01',
    current_blocker: null,
    next_step: 'pickup_item',
    started_at: '10:35:12',
    last_update: '10:42:18',
  },
  system: {
    connection_status: 'connected',
    robots_online: 2,
    robots_total: 3,
    last_update: '10:42:18',
  },
  packages: [
    {
      id: 'P1',
      status: 'carried',
      location: 'source_to_transfer',
      carried_by: 'tb3_01',
    },
    {
      id: 'P2',
      status: 'at_source',
      location: 'source',
      carried_by: null,
    },
    {
      id: 'P3',
      status: 'at_source',
      location: 'source',
      carried_by: null,
    },
  ],
  robots: [
    {
      id: 'tb3_01',
      label: 'Robot 1',
      state: 'moving',
      task: 'pickup_A',
      battery: 82,
      location: 'corridor_1',
      position: { x: 35, y: 45 },
      issue: null,
      rmf_task_id: 'rmf_task_001',
      last_update: '10:42:18',
    },
    {
      id: 'tb3_02',
      label: 'Robot 2',
      state: 'waiting',
      task: 'transfer_B',
      battery: 64,
      location: 'staging_zone',
      position: { x: 62, y: 55 },
      issue: 'Waiting for transfer zone',
      rmf_task_id: 'rmf_task_002',
      last_update: '10:42:15',
    },
    {
      id: 'tb3_03',
      label: 'Robot 3',
      state: 'idle',
      task: null,
      battery: 91,
      location: 'base',
      position: { x: 15, y: 80 },
      issue: null,
      rmf_task_id: null,
      last_update: '10:42:10',
    },
  ],
  tasks: [
    {
      id: 'assign_robot',
      label: 'Assign robot',
      status: 'completed',
      assigned_robot: 'tb3_01',
      start: null,
      goal: null,
      dependencies: [],
      notes: '',
    },
    {
      id: 'move_to_pickup',
      label: 'Move to pickup',
      status: 'active',
      assigned_robot: 'tb3_01',
      start: 'base',
      goal: 'pickup_zone_A',
      dependencies: [],
      notes: '',
    },
    {
      id: 'pickup_item',
      label: 'Pickup item',
      status: 'pending',
      assigned_robot: 'tb3_01',
      start: 'pickup_zone_A',
      goal: null,
      dependencies: ['move_to_pickup'],
      notes: '',
    },
    {
      id: 'move_to_transfer',
      label: 'Move to transfer zone',
      status: 'pending',
      assigned_robot: 'tb3_01',
      start: 'pickup_zone_A',
      goal: 'transfer_zone',
      dependencies: ['pickup_item'],
      notes: 'Transfer zone must be free',
    },
    {
      id: 'handoff',
      label: 'Handoff / transfer',
      status: 'pending',
      assigned_robot: 'tb3_01, tb3_02',
      start: 'transfer_zone',
      goal: null,
      dependencies: ['move_to_transfer'],
      notes: 'Requires both robots and free transfer zone',
    },
    {
      id: 'move_to_dropoff',
      label: 'Move to dropoff',
      status: 'pending',
      assigned_robot: 'tb3_02',
      start: 'transfer_zone',
      goal: 'dropoff_zone_B',
      dependencies: ['handoff'],
      notes: '',
    },
    {
      id: 'complete_delivery',
      label: 'Complete delivery',
      status: 'pending',
      assigned_robot: 'tb3_02',
      start: 'dropoff_zone_B',
      goal: null,
      dependencies: ['move_to_dropoff'],
      notes: '',
    },
  ],
  zones: [
    {
      id: 'pickup_zone_A',
      label: 'Pickup A',
      type: 'pickup',
      position: { x: 78, y: 22 },
      status: 'available',
    },
    {
      id: 'transfer_zone',
      label: 'Transfer Zone',
      type: 'transfer',
      position: { x: 55, y: 48 },
      status: 'occupied',
      occupied_by: 'tb3_02',
    },
    {
      id: 'dropoff_zone_B',
      label: 'Dropoff B',
      type: 'dropoff',
      position: { x: 82, y: 75 },
      status: 'available',
    },
    {
      id: 'base',
      label: 'Base',
      type: 'base',
      position: { x: 15, y: 80 },
      status: 'available',
    },
  ],
  alerts: [
    {
      id: 'alert_002',
      severity: 'info',
      source: 'robot',
      message: 'tb3_02 is waiting at staging zone',
      timestamp: '10:41:40',
      acknowledged: false,
      related_robot: 'tb3_02',
      related_task: 'transfer_B',
    },
  ],
  events: [
    {
      id: 'event_005',
      timestamp: '10:42:10',
      type: 'alert_event',
      message: 'tb3_02 waiting near transfer zone',
    },
    {
      id: 'event_004',
      timestamp: '10:38:10',
      type: 'task_event',
      message: 'tb3_02 assigned to staging_zone',
    },
    {
      id: 'event_003',
      timestamp: '10:36:03',
      type: 'robot_event',
      message: 'tb3_01 started moving to pickup_zone_A',
    },
    {
      id: 'event_002',
      timestamp: '10:35:18',
      type: 'task_event',
      message: 'tb3_01 assigned to pickup_A',
    },
    {
      id: 'event_001',
      timestamp: '10:35:12',
      type: 'mission_event',
      message: 'Mission delivery_001 started',
    },
  ],
};

function copy(data: DashboardData): DashboardData {
  return structuredClone(data);
}

const transferZoneOccupied = copy(baseData);
transferZoneOccupied.mission = {
  ...transferZoneOccupied.mission,
  phase: 'waiting_at_transfer_zone',
  current_step: 5,
  current_blocker: 'Transfer zone occupied by tb3_02',
  next_step: 'handoff',
  last_update: '10:47:26',
};
transferZoneOccupied.tasks = transferZoneOccupied.tasks.map((task) =>
  task.id === 'move_to_transfer'
    ? { ...task, status: 'completed' }
    : task.id === 'handoff'
      ? { ...task, status: 'waiting' }
      : task,
);
transferZoneOccupied.packages = transferZoneOccupied.packages.map((item) =>
  item.id === 'P1'
    ? { ...item, status: 'at_transfer', location: 'transfer', carried_by: null }
    : item,
);
transferZoneOccupied.alerts = [
  {
    id: 'alert_001',
    severity: 'warning',
    source: 'mission',
    message: 'Transfer zone is currently occupied by tb3_02',
    timestamp: '10:47:20',
    acknowledged: false,
    related_robot: 'tb3_02',
    related_task: 'handoff',
  },
  ...transferZoneOccupied.alerts,
];
transferZoneOccupied.events = [
  {
    id: 'event_006',
    timestamp: '10:47:20',
    type: 'alert_event',
    message: 'Transfer zone occupied by tb3_02',
  },
  ...transferZoneOccupied.events,
];

const lowBattery = copy(baseData);
lowBattery.mission = {
  ...lowBattery.mission,
  phase: 'moving_to_transfer_zone',
  current_step: 4,
  current_blocker: 'tb3_01 battery below 25%',
  next_step: 'handoff',
  last_update: '10:50:04',
};
lowBattery.robots = lowBattery.robots.map((robot) =>
  robot.id === 'tb3_01'
    ? { ...robot, battery: 18, issue: 'Low battery risk during active route' }
    : robot,
);
lowBattery.tasks = lowBattery.tasks.map((task) =>
  task.id === 'move_to_pickup'
    ? { ...task, status: 'completed' }
    : task.id === 'move_to_transfer'
      ? { ...task, status: 'active' }
      : task,
);
lowBattery.packages = lowBattery.packages.map((item) =>
  item.id === 'P1'
    ? { ...item, status: 'carried', location: 'source_to_transfer', carried_by: 'tb3_01' }
    : item,
);
lowBattery.alerts = [
  {
    id: 'alert_003',
    severity: 'warning',
    source: 'robot',
    message: 'tb3_01 battery is below 25% while assigned to move_to_transfer',
    timestamp: '10:50:00',
    acknowledged: false,
    related_robot: 'tb3_01',
    related_task: 'move_to_transfer',
  },
];
lowBattery.events = [
  {
    id: 'event_006',
    timestamp: '10:50:00',
    type: 'alert_event',
    message: 'Low battery warning raised for tb3_01',
  },
  ...lowBattery.events,
];

const robotFailure = copy(baseData);
robotFailure.mission = {
  ...robotFailure.mission,
  status: 'failed',
  phase: 'mission_failed',
  current_blocker: 'tb3_01 failed during move_to_pickup',
  next_step: 'retry_task',
  last_update: '10:53:44',
};
robotFailure.system = {
  ...robotFailure.system,
  connection_status: 'degraded',
  robots_online: 1,
  last_update: '10:53:44',
};
robotFailure.robots = robotFailure.robots.map((robot) =>
  robot.id === 'tb3_01'
    ? { ...robot, state: 'failed', issue: 'Navigation fault reported', last_update: '10:53:40' }
    : robot.id === 'tb3_03'
      ? { ...robot, state: 'offline', issue: 'No heartbeat', last_update: '10:52:58' }
      : robot,
);
robotFailure.tasks = robotFailure.tasks.map((task) =>
  task.id === 'move_to_pickup' ? { ...task, status: 'failed' } : task,
);
robotFailure.alerts = [
  {
    id: 'alert_004',
    severity: 'critical',
    source: 'robot',
    message: 'tb3_01 failed during active task move_to_pickup',
    timestamp: '10:53:42',
    acknowledged: false,
    related_robot: 'tb3_01',
    related_task: 'move_to_pickup',
  },
  {
    id: 'alert_005',
    severity: 'warning',
    source: 'robot',
    message: 'tb3_03 is offline',
    timestamp: '10:52:58',
    acknowledged: false,
    related_robot: 'tb3_03',
  },
];
robotFailure.events = [
  {
    id: 'event_006',
    timestamp: '10:53:42',
    type: 'alert_event',
    message: 'tb3_01 failed during move_to_pickup',
  },
  ...robotFailure.events,
];

export const scenarioLabels: Record<ScenarioId, string> = {
  normal: 'Normal active mission',
  transfer_zone_occupied: 'Transfer zone occupied',
  low_battery: 'Low battery risk',
  robot_failure: 'Robot failure',
};

export const scenarioOrder: ScenarioId[] = [
  'normal',
  'transfer_zone_occupied',
  'low_battery',
  'robot_failure',
];

export const mockDashboardScenarios: Record<ScenarioId, DashboardData> = {
  normal: baseData,
  transfer_zone_occupied: transferZoneOccupied,
  low_battery: lowBattery,
  robot_failure: robotFailure,
};

export function cloneDashboardData(scenarioId: ScenarioId): DashboardData {
  return copy(mockDashboardScenarios[scenarioId]);
}
