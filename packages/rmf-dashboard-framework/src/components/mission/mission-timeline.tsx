import { Box, Chip, Stack, Typography } from '@mui/material';

import { Panel, StatusChip } from './common';
import { formatLabel, statusColor } from './formatting';
import { DashboardData, SelectedEntity } from './types';

export function MissionTimeline({
  data,
  selectedEntity,
  onSelectTask,
}: {
  data: DashboardData;
  selectedEntity: SelectedEntity;
  onSelectTask: (taskId: string) => void;
}) {
  return (
    <Panel title="Mission Timeline">
      <Stack spacing={1}>
        {data.tasks.map((task, index) => {
          const selected = selectedEntity.type === 'task' && selectedEntity.id === task.id;
          return (
            <Box
              key={task.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTask(task.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  onSelectTask(task.id);
                }
              }}
              sx={{
                p: 1,
                border: 1,
                borderColor: selected || task.status === 'active' ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor:
                  task.status === 'completed'
                    ? '#f0fdf4'
                    : task.status === 'active'
                      ? '#eff6ff'
                      : task.status === 'waiting'
                        ? '#fffbeb'
                        : task.status === 'failed'
                          ? '#fef2f2'
                          : 'background.paper',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={index + 1} color={statusColor(task.status)} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {task.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {task.start || 'Start'} to {task.goal || 'Task complete'} |{' '}
                    {task.assigned_robot}
                  </Typography>
                </Box>
                <StatusChip status={task.status} />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                {task.dependencies.map((dependency) => (
                  <Chip
                    key={dependency}
                    size="small"
                    label={`Depends: ${formatLabel(dependency)}`}
                  />
                ))}
                {task.notes && <Chip size="small" label={task.notes} />}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Panel>
  );
}
