import { Box } from '@mui/material';

import { AlertsPanel } from './alerts-panel';
import { DetailPanel } from './detail-panel';
import { EventLog } from './event-log';
import { FleetPanel } from './fleet-panel';
import { MapView } from './map-view';
import { MissionOverview } from './mission-overview';
import { MissionTimeline } from './mission-timeline';
import { TopBar } from './top-bar';
import { useDashboardData } from './use-dashboard-data';

export function MissionDashboard() {
  const {
    dashboardData,
    scenarioId,
    selectedEntity,
    setScenarioId,
    selectRobot,
    selectTask,
    selectZone,
    selectAlert,
    acknowledgeAlert,
    handleMissionAction,
    handleRobotAction,
    handleTaskAction,
  } = useDashboardData();

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 64px)', overflow: 'auto', bgcolor: '#f8fafc' }}>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <TopBar
          data={dashboardData}
          scenarioId={scenarioId}
          onScenarioChange={setScenarioId}
          onMissionAction={handleMissionAction}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' },
            gap: 1.5,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <MissionOverview data={dashboardData} />
            <FleetPanel
              data={dashboardData}
              selectedEntity={selectedEntity}
              onSelectRobot={selectRobot}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <MapView
              data={dashboardData}
              selectedEntity={selectedEntity}
              onSelectRobot={selectRobot}
              onSelectZone={selectZone}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <MissionTimeline
                data={dashboardData}
                selectedEntity={selectedEntity}
                onSelectTask={selectTask}
              />
              <DetailPanel
                data={dashboardData}
                selectedEntity={selectedEntity}
                onRobotAction={handleRobotAction}
                onTaskAction={handleTaskAction}
                onAcknowledgeAlert={acknowledgeAlert}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.8fr' },
            gap: 1.5,
          }}
        >
          <AlertsPanel
            data={dashboardData}
            selectedEntity={selectedEntity}
            onSelectAlert={selectAlert}
            onAcknowledgeAlert={acknowledgeAlert}
          />
          <EventLog data={dashboardData} />
        </Box>
      </Box>
    </Box>
  );
}

export default MissionDashboard;
