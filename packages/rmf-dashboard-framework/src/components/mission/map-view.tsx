import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';

import { Panel } from './common';
import { formatLabel, statusColor } from './formatting';
import { getActiveRobot, getCurrentGoalZone } from './selectors';
import { DashboardData, SelectedEntity } from './types';

export function MapView({
  data,
  selectedEntity,
  onSelectRobot,
  onSelectZone,
}: {
  data: DashboardData;
  selectedEntity: SelectedEntity;
  onSelectRobot: (robotId: string) => void;
  onSelectZone: (zoneId: string) => void;
}) {
  const activeRobot = getActiveRobot(data);
  const goalZone = getCurrentGoalZone(data);

  return (
    <Panel
      title="Map View"
      action={goalZone ? <Chip size="small" label={`Goal: ${goalZone.label}`} /> : undefined}
    >
      <Box
        sx={{
          position: 'relative',
          height: { xs: 320, lg: 390 },
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: '#f8fafc',
          backgroundImage:
            'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        {activeRobot && goalZone && (
          <Box
            component="svg"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <line
              x1={`${activeRobot.position.x}%`}
              y1={`${activeRobot.position.y}%`}
              x2={`${goalZone.position.x}%`}
              y2={`${goalZone.position.y}%`}
              stroke="#2563eb"
              strokeDasharray="6 6"
              strokeWidth="2"
            />
          </Box>
        )}

        {data.zones.map((zone) => {
          const selected = selectedEntity.type === 'zone' && selectedEntity.id === zone.id;
          const highlighted = goalZone?.id === zone.id || zone.status === 'occupied';
          return (
            <ButtonBase
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              sx={{
                position: 'absolute',
                left: `${zone.position.x}%`,
                top: `${zone.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 104,
                p: 0.75,
                border: 2,
                borderColor: selected || highlighted ? 'primary.main' : 'divider',
                borderRadius: 1,
                bgcolor: zone.status === 'occupied' ? 'warning.light' : 'background.paper',
                boxShadow: selected ? 3 : 1,
              }}
            >
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="caption" fontWeight={700}>
                  {zone.label}
                </Typography>
                <Chip
                  size="small"
                  label={formatLabel(zone.type)}
                  color={statusColor(zone.status)}
                  sx={{ height: 20 }}
                />
                {zone.occupied_by && (
                  <Typography variant="caption" color="text.secondary">
                    {zone.occupied_by}
                  </Typography>
                )}
              </Stack>
            </ButtonBase>
          );
        })}

        {data.robots.map((robot) => {
          const active = data.mission.active_robot === robot.id;
          const selected = selectedEntity.type === 'robot' && selectedEntity.id === robot.id;
          return (
            <ButtonBase
              key={robot.id}
              onClick={() => onSelectRobot(robot.id)}
              sx={{
                position: 'absolute',
                left: `${robot.position.x}%`,
                top: `${robot.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 86,
                p: 0.75,
                border: 2,
                borderColor: selected || active ? 'primary.main' : 'grey.500',
                borderRadius: 1,
                bgcolor: robot.battery < 25 || robot.state === 'failed' ? 'error.light' : 'white',
                color:
                  robot.battery < 25 || robot.state === 'failed'
                    ? 'error.contrastText'
                    : 'text.primary',
                boxShadow: selected || active ? 4 : 2,
              }}
            >
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="caption" fontWeight={800}>
                  {robot.id}
                </Typography>
                <Typography variant="caption">{formatLabel(robot.state)}</Typography>
                <Typography variant="caption">{robot.battery}%</Typography>
              </Stack>
            </ButtonBase>
          );
        })}
      </Box>
    </Panel>
  );
}
