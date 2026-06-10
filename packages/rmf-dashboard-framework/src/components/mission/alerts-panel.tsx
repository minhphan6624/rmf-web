import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { Panel, StatusChip } from './common';
import { sortAlerts } from './selectors';
import { DashboardData, SelectedEntity } from './types';

export function AlertsPanel({
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
  return (
    <Panel title="Alerts">
      <TableContainer sx={{ maxHeight: 240 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Related</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortAlerts(data.alerts).map((alert) => (
              <TableRow
                key={alert.id}
                hover
                selected={selectedEntity.type === 'alert' && selectedEntity.id === alert.id}
                onClick={() => onSelectAlert(alert.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <StatusChip status={alert.severity} />
                </TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.timestamp}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={alert.acknowledged ? 'Acknowledged' : 'Open'}
                    color={alert.acknowledged ? 'default' : 'warning'}
                  />
                </TableCell>
                <TableCell>{alert.related_robot || alert.related_task || '-'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Panel>
  );
}
