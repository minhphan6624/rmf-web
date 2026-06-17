import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { KeyValue, Panel, StatusChip } from './common';
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
  const navigate = useNavigate();

  return (
    <Panel
      title="Robots"
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<OpenInNewIcon />} onClick={() => navigate('../robots')}>
            Robots
          </Button>
          <Chip
            size="small"
            label={`${data.system.robots_online} / ${data.system.robots_total} online`}
          />
          {data.system.connection_status !== 'connected' && (
            <Chip size="small" color="warning" label={data.system.connection_status} />
          )}
        </Stack>
      }
    >
      <Stack spacing={1}>
        {data.robots.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Robot data unavailable.
          </Typography>
        )}
        {data.robots.map((robot) => {
          const selected = selectedEntity.type === 'robot' && selectedEntity.id === robot.id;
          const problem = isProblemRobot(robot.state, robot.battery);
          return (
            <Box
              key={robot.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRobot(robot.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  onSelectRobot(robot.id);
                }
              }}
              sx={{
                p: 1,
                border: 1,
                borderColor: selected ? 'primary.main' : problem ? 'warning.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: selected ? '#eff6ff' : problem ? '#fffbeb' : 'background.paper',
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={800}>
                      {robot.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {robot.id}
                    </Typography>
                  </Box>
                  <StatusChip status={robot.state} />
                </Stack>

                <KeyValue label="Task" value={robot.task || '-'} />
                <KeyValue label="Location" value={robot.location || 'Unknown'} />
                <Stack spacing={0.25}>
                  <KeyValue label="Battery" value={`${robot.battery}%`} />
                  <LinearProgress
                    variant="determinate"
                    value={robot.battery}
                    color={robot.battery < 25 ? 'warning' : 'primary'}
                  />
                </Stack>
                {robot.issue && (
                  <Typography
                    variant="caption"
                    color="warning.dark"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {robot.issue}
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Panel>
  );
}
