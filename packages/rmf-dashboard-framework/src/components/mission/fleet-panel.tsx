import {
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { Panel, StatusChip } from './common';
import { DashboardData, SelectedEntity } from './types';

function isProblemRobot(state: string, battery: number): boolean {
  return ['waiting', 'blocked', 'failed', 'offline'].includes(state) || battery < 25;
}

export function FleetPanel({
  data,
  selectedEntity,
  onSelectRobot,
}: {
  data: DashboardData;
  selectedEntity: SelectedEntity;
  onSelectRobot: (robotId: string) => void;
}) {
  return (
    <Panel title="Fleet">
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Robot</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Battery</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.robots.map((robot) => (
              <TableRow
                key={robot.id}
                hover
                selected={selectedEntity.type === 'robot' && selectedEntity.id === robot.id}
                onClick={() => onSelectRobot(robot.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: isProblemRobot(robot.state, robot.battery) ? '#fffbeb' : undefined,
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {robot.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {robot.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={robot.state} />
                </TableCell>
                <TableCell>{robot.task || '-'}</TableCell>
                <TableCell sx={{ minWidth: 92 }}>
                  <Typography variant="caption">{robot.battery}%</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={robot.battery}
                    color={robot.battery < 25 ? 'warning' : 'primary'}
                  />
                </TableCell>
                <TableCell>{robot.location}</TableCell>
                <TableCell>{robot.issue || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Panel>
  );
}
