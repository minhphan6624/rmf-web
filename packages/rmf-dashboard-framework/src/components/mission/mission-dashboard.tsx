import { Box } from '@mui/material';

import type { MapProps } from '../map';
import { ActivityPanel } from './activity-panel';
import { CompactMap } from './compact-map';
import { DetailPanel } from './detail-panel';
import { FleetPanel } from './fleet-panel';
import { MissionFlowView } from './mission-flow-view';
import { MissionOverview } from './mission-overview';
import { MissionTimeline } from './mission-timeline';
import { TopBar } from './top-bar';
import { useDashboardData } from './use-dashboard-data';

export function MissionDashboard({ mapConfig }: { mapConfig?: MapProps }) {
  const {
    dashboardData,
    selectedEntity,
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
        <TopBar data={dashboardData} onMissionAction={handleMissionAction} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '360px minmax(0, 1fr)',
              xl: '360px minmax(0, 1fr) 420px',
            },
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

          <Box sx={{ display: 'grid', gap: 1.5, gridColumn: { lg: 2, xl: 'auto' } }}>
            {mapConfig && <CompactMap mapConfig={mapConfig} />}

            <MissionFlowView
              data={dashboardData}
              selectedEntity={selectedEntity}
              onSelectTask={selectTask}
              onSelectZone={selectZone}
            />

            <MissionTimeline
              data={dashboardData}
              selectedEntity={selectedEntity}
              onSelectTask={selectTask}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <DetailPanel
              data={dashboardData}
              selectedEntity={selectedEntity}
              onRobotAction={handleRobotAction}
              onTaskAction={handleTaskAction}
              onAcknowledgeAlert={acknowledgeAlert}
            />
            <ActivityPanel
              data={dashboardData}
              selectedEntity={selectedEntity}
              onSelectAlert={selectAlert}
              onAcknowledgeAlert={acknowledgeAlert}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MissionDashboard;
