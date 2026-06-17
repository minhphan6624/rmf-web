import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EvStationIcon from '@mui/icons-material/EvStation';
import MapIcon from '@mui/icons-material/Map';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Box, Button, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { KeyValue, Panel, StatusChip } from './common';
import { formatLabel } from './formatting';
import { getNearbyRobots, sortEvents } from './selectors';
import { DashboardData, RobotAction, SelectedEntity, TaskAction } from './types';

function EmptyDetail({ data }: { data: DashboardData }) {
  const activeAlerts = data.alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        Select a robot, task, zone, or alert to inspect details.
      </Typography>
      <KeyValue label="Mission" value={data.mission.name} />
      <KeyValue
        label="Robots"
        value={`${data.system.robots_online} / ${data.system.robots_total} online`}
      />
      <KeyValue label="Open alerts" value={activeAlerts} />
    </Stack>
  );
}

export function DetailPanel({
  data,
  selectedEntity,
  onRobotAction,
  onTaskAction,
  onAcknowledgeAlert,
}: {
  data: DashboardData;
  selectedEntity: SelectedEntity;
  onRobotAction: (robotId: string, action: RobotAction) => void;
  onTaskAction: (taskId: string, action: TaskAction) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}) {
  const navigate = useNavigate();
  const robot =
    selectedEntity.type === 'robot'
      ? data.robots.find((item) => item.id === selectedEntity.id)
      : undefined;
  const task =
    selectedEntity.type === 'task'
      ? data.tasks.find((item) => item.id === selectedEntity.id)
      : undefined;
  const zone =
    selectedEntity.type === 'zone'
      ? data.zones.find((item) => item.id === selectedEntity.id)
      : undefined;
  const alert =
    selectedEntity.type === 'alert'
      ? data.alerts.find((item) => item.id === selectedEntity.id)
      : undefined;
  const panelTitle = robot
    ? 'Robot Detail'
    : task
      ? 'Task Detail'
      : zone
        ? 'Zone Detail'
        : alert
          ? 'Alert Detail'
          : 'Mission Summary';
  const panelAction = robot ? (
    <Stack direction="row" spacing={1}>
      <Button size="small" startIcon={<OpenInNewIcon />} onClick={() => navigate('../robots')}>
        Robots Tab
      </Button>
      <Button size="small" startIcon={<MapIcon />} onClick={() => navigate('..')}>
        Map
      </Button>
    </Stack>
  ) : task ? (
    <Button size="small" startIcon={<OpenInNewIcon />} onClick={() => navigate('../tasks')}>
      Tasks Tab
    </Button>
  ) : zone ? (
    <Button size="small" startIcon={<MapIcon />} onClick={() => navigate('..')}>
      Open Map
    </Button>
  ) : undefined;

  return (
    <Panel title={panelTitle} action={panelAction}>
      {robot && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              {robot.label}
            </Typography>
            <StatusChip status={robot.state} />
          </Stack>
          <KeyValue label="Robot ID" value={robot.id} />
          <KeyValue label="Current task" value={robot.task || 'None'} />
          <KeyValue label="RMF task ID" value={robot.rmf_task_id || 'None'} />
          <KeyValue label="Battery" value={`${robot.battery}%`} />
          <LinearProgress
            variant="determinate"
            value={robot.battery}
            color={robot.battery < 25 ? 'warning' : 'primary'}
          />
          <KeyValue label="Logical location" value={robot.location} />
          <KeyValue label="Issue" value={robot.issue || 'None'} />
          <KeyValue label="Last update" value={robot.last_update} />
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Recent related events
          </Typography>
          {sortEvents(data.events)
            .filter((event) => event.message.includes(robot.id))
            .slice(0, 4)
            .map((event) => (
              <Typography key={event.id} variant="body2">
                {event.timestamp} | {event.message}
              </Typography>
            ))}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              startIcon={<EvStationIcon />}
              onClick={() => onRobotAction(robot.id, 'send_to_charger')}
            >
              Send to charger
            </Button>
            <Button
              size="small"
              startIcon={<PauseIcon />}
              onClick={() => onRobotAction(robot.id, 'pause_robot')}
            >
              Pause robot
            </Button>
            <Button
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => onRobotAction(robot.id, 'retry_task')}
            >
              Retry current task
            </Button>
            <Button
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={() => onRobotAction(robot.id, 'reassign_task')}
            >
              Reassign task
            </Button>
          </Stack>
        </Stack>
      )}

      {task && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              {task.label}
            </Typography>
            <StatusChip status={task.status} />
          </Stack>
          <KeyValue label="Task ID" value={task.id} />
          <KeyValue label="Assigned robot" value={task.assigned_robot} />
          <KeyValue label="Phase" value={formatLabel(task.phase)} />
          <KeyValue label="Start" value={task.start || 'None'} />
          <KeyValue label="Goal" value={task.goal || 'None'} />
          <KeyValue label="Dependencies" value={task.dependencies.join(', ') || 'None'} />
          <KeyValue label="Blocked by" value={task.blocked_by || 'None'} />
          <KeyValue label="Waiting at" value={task.waiting_at || 'None'} />
          <KeyValue label="Unblock condition" value={task.unblock_condition || 'None'} />
          <KeyValue label="Next expected" value={task.next_expected_event || 'None'} />
          <KeyValue label="Notes" value={task.notes || 'None'} />
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Related alerts
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {data.alerts
              .filter((item) => item.related_task === task.id)
              .map((item) => (
                <Chip key={item.id} size="small" label={item.message} color="warning" />
              ))}
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => onTaskAction(task.id, 'retry_task')}
            >
              Retry task
            </Button>
            <Button
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={() => onTaskAction(task.id, 'reassign_task')}
            >
              Reassign task
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => onTaskAction(task.id, 'cancel_task')}
            >
              Cancel task
            </Button>
          </Stack>
        </Stack>
      )}

      {zone && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              {zone.label}
            </Typography>
            <StatusChip status={zone.status} />
          </Stack>
          <KeyValue label="Zone ID" value={zone.id} />
          <KeyValue label="Type" value={formatLabel(zone.type)} />
          <KeyValue label="Status" value={formatLabel(zone.status)} />
          <KeyValue label="Occupied by" value={zone.occupied_by || 'None'} />
          <KeyValue label="Package buffer" value={zone.package_buffer || 'Empty'} />
          <KeyValue label="Lease owner" value={zone.active_lease_owner || 'None'} />
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Nearby robots
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {getNearbyRobots(zone, data.robots).map((item) => (
              <Chip key={item.id} size="small" label={`${item.id} at ${item.location}`} />
            ))}
          </Stack>
        </Stack>
      )}

      {alert && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              {formatLabel(alert.severity)} alert
            </Typography>
            <StatusChip status={alert.severity} />
          </Stack>
          <KeyValue label="Source" value={formatLabel(alert.source)} />
          <KeyValue label="Message" value={alert.message} />
          <KeyValue label="Timestamp" value={alert.timestamp} />
          <KeyValue label="Related robot" value={alert.related_robot || 'None'} />
          <KeyValue label="Related task" value={alert.related_task || 'None'} />
          <KeyValue label="Acknowledged" value={alert.acknowledged ? 'Yes' : 'No'} />
          <Box>
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled={alert.acknowledged}
              onClick={() => onAcknowledgeAlert(alert.id)}
            >
              Acknowledge
            </Button>
          </Box>
        </Stack>
      )}

      {!robot && !task && !zone && !alert && <EmptyDetail data={data} />}
    </Panel>
  );
}
