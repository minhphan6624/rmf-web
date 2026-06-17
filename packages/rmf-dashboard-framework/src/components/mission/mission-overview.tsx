import { Alert, LinearProgress, Stack, Typography } from '@mui/material';

import { KeyValue, Panel, StatusChip } from './common';
import { DashboardData } from './types';

export function MissionOverview({ data }: { data: DashboardData }) {
  const progress = Math.round((data.mission.current_step / data.mission.total_steps) * 100);
  const activeAlerts = data.alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <Panel title="Mission Summary">
      <Stack spacing={1}>
        {(data.mission.current_blocker || data.mission.status === 'failed') && (
          <Alert severity={data.mission.status === 'failed' ? 'error' : 'warning'} sx={{ py: 0 }}>
            {data.mission.current_blocker || 'Mission failed'}
          </Alert>
        )}
        {data.mission.status === 'completed' && (
          <Alert severity="success" sx={{ py: 0 }}>
            Mission completed
          </Alert>
        )}
        <KeyValue label="Status" value={<StatusChip status={data.mission.status} />} />
        <KeyValue
          label="Mission progress"
          value={`${data.mission.current_step} / ${data.mission.total_steps} steps`}
        />
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption" color="text.secondary">
          {progress}% complete
        </Typography>
        <KeyValue label="Active alerts" value={activeAlerts} />
        <KeyValue label="Started" value={data.mission.started_at} />
        <KeyValue label="Last update" value={data.mission.last_update} />
      </Stack>
    </Panel>
  );
}
