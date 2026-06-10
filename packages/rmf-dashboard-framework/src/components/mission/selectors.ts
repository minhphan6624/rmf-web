import { DashboardData, MissionAlert, MissionEvent, MissionTask, Robot, Zone } from './types';

const alertSeverityRank: Record<MissionAlert['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function sortAlerts(alerts: MissionAlert[]): MissionAlert[] {
  return [...alerts].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged ? 1 : -1;
    }
    return alertSeverityRank[a.severity] - alertSeverityRank[b.severity];
  });
}

export function sortEvents(events: MissionEvent[]): MissionEvent[] {
  return [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getActiveTask(data: DashboardData): MissionTask | undefined {
  return data.tasks.find((task) => task.status === 'active' || task.status === 'waiting');
}

export function getCurrentGoalZone(data: DashboardData): Zone | undefined {
  const activeTask = getActiveTask(data);
  if (!activeTask?.goal) {
    return undefined;
  }
  return data.zones.find((zone) => zone.id === activeTask.goal);
}

export function getActiveRobot(data: DashboardData): Robot | undefined {
  return data.robots.find((robot) => robot.id === data.mission.active_robot);
}

export function getNearbyRobots(zone: Zone, robots: Robot[]): Robot[] {
  return robots.filter((robot) => {
    const xDelta = robot.position.x - zone.position.x;
    const yDelta = robot.position.y - zone.position.y;
    return Math.sqrt(xDelta * xDelta + yDelta * yDelta) <= 20;
  });
}
