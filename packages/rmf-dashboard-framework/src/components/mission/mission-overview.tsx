import { Alert, LinearProgress, Stack } from '@mui/material';

import { KeyValue, Panel, StatusChip } from './common';
import { formatLabel } from './formatting';
import { DashboardData } from './types';

export function MissionOverview({ data }: { data: DashboardData }) {
  const progress = Math.round((data.mission.current_step / data.mission.total_steps) * 100);

  return (
    <Panel title="Mission Overview">
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
        <KeyValue label="Phase" value={<StatusChip status={data.mission.phase} />} />
        <KeyValue
          label="Progress"
          value={`${data.mission.current_step} / ${data.mission.total_steps} steps`}
        />
        <LinearProgress variant="determinate" value={progress} />
        <KeyValue label="Active robot" value={data.mission.active_robot || 'None'} />
        <KeyValue label="Current blocker" value={data.mission.current_blocker || 'None'} />
        <KeyValue label="Next step" value={formatLabel(data.mission.next_step)} />
        <KeyValue label="Started at" value={data.mission.started_at} />
        <KeyValue label="Last update" value={data.mission.last_update} />
      </Stack>
    </Panel>
  );
}
