import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';

import { Panel, StatusChip } from './common';
import { formatLabel } from './formatting';
import { sortAlerts, sortEvents } from './selectors';
import { DashboardData, SelectedEntity } from './types';

export function ActivityPanel({
  data,
  selectedEntity,
  onSelectAlert,
  onAcknowledgeAlert,
}: {
  data: DashboardData;
  selectedEntity: SelectedEntity;
  onSelectAlert: (alertId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}) {
  const [tab, setTab] = React.useState<'events' | 'alerts'>('events');
  const openAlerts = data.alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <Panel
      title="Activity"
      action={
        openAlerts > 0 ? (
          <Chip size="small" color="warning" label={`${openAlerts} open`} />
        ) : undefined
      }
    >
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ minHeight: 36, mb: 1 }}>
        <Tab value="events" label="Events" sx={{ minHeight: 36, py: 0 }} />
        <Tab value="alerts" label="Alerts" sx={{ minHeight: 36, py: 0 }} />
      </Tabs>

      {tab === 'events' && (
        <Stack spacing={0.75} sx={{ maxHeight: 360, overflow: 'auto' }}>
          {data.events.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No mission events available.
            </Typography>
          )}
          {sortEvents(data.events).map((event) => (
            <Stack key={event.id} direction="row" spacing={1} alignItems="center" sx={{ py: 0.25 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ width: 64, flexShrink: 0 }}
              >
                {event.timestamp}
              </Typography>
              <Chip
                size="small"
                label={formatLabel(event.type)}
                sx={{ width: 122, flexShrink: 0 }}
              />
              <Typography variant="body2" sx={{ flex: 1, overflowWrap: 'anywhere' }}>
                {event.message}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {tab === 'alerts' && (
        <Stack spacing={0.75} sx={{ maxHeight: 360, overflow: 'auto' }}>
          {data.alerts.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No mission alerts available.
            </Typography>
          )}
          {sortAlerts(data.alerts).map((alert) => (
            <Box
              key={alert.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectAlert(alert.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  onSelectAlert(alert.id);
                }
              }}
              sx={{
                p: 1,
                border: 1,
                borderColor:
                  selectedEntity.type === 'alert' && selectedEntity.id === alert.id
                    ? 'primary.main'
                    : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: alert.acknowledged ? 'background.paper' : '#fffbeb',
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <StatusChip status={alert.severity} />
                  <Chip size="small" label={alert.acknowledged ? 'Acknowledged' : 'Open'} />
                  <Typography variant="caption" color="text.secondary">
                    {alert.timestamp}
                  </Typography>
                </Stack>
                <Typography variant="body2">{alert.message}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary">
                    {formatLabel(alert.source)}
                    {alert.related_robot || alert.related_task
                      ? ` | ${alert.related_robot || alert.related_task}`
                      : ''}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelectAlert(alert.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    disabled={alert.acknowledged}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onAcknowledgeAlert(alert.id);
                    }}
                  >
                    Acknowledge
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Panel>
  );
}
