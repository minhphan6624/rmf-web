import { Chip, Stack, Typography } from '@mui/material';

import { Panel } from './common';
import { formatLabel } from './formatting';
import { sortEvents } from './selectors';
import { DashboardData } from './types';

export function EventLog({ data }: { data: DashboardData }) {
  return (
    <Panel title="Event Log">
      <Stack spacing={0.75} sx={{ maxHeight: 240, overflow: 'auto' }}>
        {sortEvents(data.events).map((event) => (
          <Stack key={event.id} direction="row" spacing={1} alignItems="center" sx={{ py: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ width: 64 }}>
              {event.timestamp}
            </Typography>
            <Chip size="small" label={formatLabel(event.type)} sx={{ width: 122 }} />
            <Typography variant="body2" sx={{ flex: 1, overflowWrap: 'anywhere' }}>
              {event.message}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Panel>
  );
}
