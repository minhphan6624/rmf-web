import React from 'react';

import { useRmfApi } from '../../hooks';
import { currentTime, formatLabel } from './formatting';
import { mergeMissionState, missionEventToDashboardEvent } from './live-dashboard-data';
import { cloneDashboardData, disconnectedDashboardData } from './mock-dashboard-data';
import {
  DashboardData,
  EventType,
  MissionAction,
  RobotAction,
  ScenarioId,
  SelectedEntity,
  TaskAction,
} from './types';

let operatorEventCounter = 1;

function queryDemoScenario(): ScenarioId | null {
  const scenario = new URLSearchParams(window.location.search).get('demo');
  if (
    scenario === 'normal' ||
    scenario === 'transfer_zone_occupied' ||
    scenario === 'low_battery' ||
    scenario === 'robot_failure'
  ) {
    return scenario;
  }
  return null;
}

function makeOperatorEvent(type: EventType, message: string) {
  return {
    id: `operator_event_${operatorEventCounter++}`,
    timestamp: currentTime(),
    type,
    message,
  };
}

export function useDashboardData() {
  const rmfApi = useRmfApi();
  const [scenarioId] = React.useState<ScenarioId | null>(() => queryDemoScenario());
  const liveMissionStateRef = React.useRef<Record<string, unknown> | null>(null);
  const [dashboardData, setDashboardData] = React.useState<DashboardData>(() =>
    scenarioId ? cloneDashboardData(scenarioId) : disconnectedDashboardData(),
  );
  const [selectedEntity, setSelectedEntity] = React.useState<SelectedEntity>({
    type: 'mission',
    id: scenarioId ? cloneDashboardData(scenarioId).mission.id : 'N/A',
  });

  React.useEffect(() => {
    const nextData = scenarioId ? cloneDashboardData(scenarioId) : disconnectedDashboardData();
    const liveMissionState = liveMissionStateRef.current;
    const mergedData = liveMissionState ? mergeMissionState(nextData, liveMissionState) : nextData;
    setDashboardData(mergedData);
    setSelectedEntity({ type: 'mission', id: mergedData.mission.id });
  }, [scenarioId]);

  React.useEffect(() => {
    const missionStateSub = rmfApi.missionStateObs.subscribe((missionState) => {
      liveMissionStateRef.current = missionState;
      setDashboardData((current) => mergeMissionState(current, missionState));
    });
    const missionEventSub = rmfApi.missionEventsObs.subscribe((missionEvent) => {
      const event = missionEventToDashboardEvent(missionEvent);
      setDashboardData((current) => ({
        ...current,
        events: [event, ...current.events.filter((item) => item.id !== event.id)],
        mission: {
          ...current.mission,
          last_update: event.timestamp,
        },
        system: {
          ...current.system,
          last_update: event.timestamp,
        },
      }));
    });
    return () => {
      missionStateSub.unsubscribe();
      missionEventSub.unsubscribe();
    };
  }, [rmfApi]);

  const appendEvent = React.useCallback((type: EventType, message: string) => {
    setDashboardData((current) => ({
      ...current,
      events: [makeOperatorEvent(type, message), ...current.events],
      mission: {
        ...current.mission,
        last_update: currentTime(),
      },
      system: {
        ...current.system,
        last_update: currentTime(),
      },
    }));
  }, []);

  const selectMission = React.useCallback(() => {
    setSelectedEntity((current) => ({ ...current, type: 'mission', id: dashboardData.mission.id }));
  }, [dashboardData.mission.id]);

  const selectRobot = React.useCallback((robotId: string) => {
    setSelectedEntity({ type: 'robot', id: robotId });
  }, []);

  const selectTask = React.useCallback((taskId: string) => {
    setSelectedEntity({ type: 'task', id: taskId });
  }, []);

  const selectZone = React.useCallback((zoneId: string) => {
    setSelectedEntity({ type: 'zone', id: zoneId });
  }, []);

  const selectAlert = React.useCallback((alertId: string) => {
    setSelectedEntity({ type: 'alert', id: alertId });
  }, []);

  const acknowledgeAlert = React.useCallback((alertId: string) => {
    setDashboardData((current) => {
      const alert = current.alerts.find((item) => item.id === alertId);
      return {
        ...current,
        alerts: current.alerts.map((item) =>
          item.id === alertId ? { ...item, acknowledged: true } : item,
        ),
        events: [
          makeOperatorEvent(
            'operator_event',
            `Acknowledged alert ${alert ? alert.message : alertId}`,
          ),
          ...current.events,
        ],
      };
    });
  }, []);

  const handleMissionAction = React.useCallback(
    async (action: MissionAction) => {
      if (action === 'abort' && !window.confirm('Abort this mission?')) {
        return;
      }

      if (!scenarioId) {
        try {
          await rmfApi.sendMissionCommand(dashboardData.mission.id, action);
        } catch (e) {
          console.error(`Failed to send mission command: ${(e as Error).message}`);
        }
        return;
      }

      setDashboardData((current) => {
        const status =
          action === 'start'
            ? 'active'
            : action === 'pause'
              ? 'paused'
              : action === 'resume'
                ? 'active'
                : 'cancelled';
        return {
          ...current,
          mission: {
            ...current.mission,
            status,
            phase: action === 'pause' ? 'mission_paused' : current.mission.phase,
            current_blocker:
              action === 'abort' ? 'Mission aborted by operator' : current.mission.current_blocker,
            last_update: currentTime(),
          },
          events: [
            makeOperatorEvent('operator_event', `${formatLabel(action)} Mission requested`),
            ...current.events,
          ],
        };
      });
    },
    [dashboardData.mission.id, rmfApi, scenarioId],
  );

  const handleRobotAction = React.useCallback(
    (robotId: string, action: RobotAction) => {
      console.log(`robot action: ${robotId} ${action}`);
      appendEvent('operator_event', `${formatLabel(action)} requested for ${robotId}`);
    },
    [appendEvent],
  );

  const handleTaskAction = React.useCallback(
    (taskId: string, action: TaskAction) => {
      console.log(`task action: ${taskId} ${action}`);
      appendEvent('operator_event', `${formatLabel(action)} requested for ${taskId}`);
    },
    [appendEvent],
  );

  return {
    dashboardData,
    selectedEntity,
    selectMission,
    selectRobot,
    selectTask,
    selectZone,
    selectAlert,
    acknowledgeAlert,
    appendEvent,
    handleMissionAction,
    handleRobotAction,
    handleTaskAction,
  };
}
