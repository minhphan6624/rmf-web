import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router';

import { KeyValue, Panel, StatusChip } from './common';
import { formatLabel } from './formatting';
import { getActiveRobot, getActiveTask } from './selectors';
import {
  DashboardData,
  MissionPackage,
  MissionTask,
  PackageStatus,
  SelectedEntity,
  Zone,
} from './types';

function packageIdFromTask(task?: MissionTask): string | null {
  if (!task) {
    return null;
  }
  const match = `${task.id} ${task.label}`.match(/\bP\d+\b/i);
  return match?.[0].toUpperCase() ?? null;
}

function fallbackPackages(tasks: MissionTask[]): MissionPackage[] {
  const packages = new Map<string, MissionPackage>();
  tasks.forEach((task) => {
    const id = packageIdFromTask(task);
    if (!id || packages.has(id)) {
      return;
    }
    packages.set(id, {
      id,
      status: task.status === 'completed' ? 'delivered' : 'at_source',
      location: task.status === 'completed' ? 'destination' : 'source',
      carried_by: null,
    });
  });
  return [...packages.values()];
}

function zoneByType(data: DashboardData, type: Zone['type'], fallbackId: string): Zone | undefined {
  return (
    data.zones.find((zone) => zone.type === type) ??
    data.zones.find((zone) => zone.id.includes(fallbackId))
  );
}

function stagingZones(data: DashboardData): Zone[] {
  return data.zones.filter((zone) => zone.type === 'staging');
}

function packagesByStatus(packages: MissionPackage[], status: PackageStatus): MissionPackage[] {
  return packages.filter((item) => item.status === status);
}

function activePackage(
  packages: MissionPackage[],
  activeTask: MissionTask | undefined,
  activeRobotId: string | undefined,
): MissionPackage | undefined {
  const taskPackageId = packageIdFromTask(activeTask);
  return (
    packages.find((item) => item.id === taskPackageId) ??
    packages.find((item) => item.carried_by === activeRobotId) ??
    packages.find((item) => item.status === 'carried' || item.status === 'in_transit')
  );
}

function packageLabels(packages: MissionPackage[]): string[] {
  return packages.map((item) => item.id);
}

function PackageChips({ packages }: { packages: MissionPackage[] }) {
  const labels = packageLabels(packages);
  if (labels.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        None
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {labels.map((id) => (
        <Chip key={id} size="small" label={id} sx={{ height: 22 }} />
      ))}
    </Stack>
  );
}

function Section({
  title,
  children,
}: React.PropsWithChildren<{
  title: string;
}>) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={800}>
        {title}
      </Typography>
      <Box sx={{ mt: 0.75 }}>{children}</Box>
    </Box>
  );
}

function TransferResource({
  zone,
  selected,
  onSelect,
}: {
  zone?: Zone;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <ButtonBase
      onClick={onSelect}
      disabled={!zone}
      sx={{
        width: '100%',
        p: 1.25,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        bgcolor: selected ? '#eff6ff' : 'background.paper',
      }}
    >
      <Stack spacing={0.75} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle2" fontWeight={800}>
            Transfer Resource
          </Typography>
          {zone && <StatusChip status={zone.status} />}
        </Stack>
        <KeyValue label="Occupied by" value={zone?.occupied_by || 'None'} />
        <KeyValue label="Package buffer" value={zone?.package_buffer || 'Empty'} />
        <KeyValue label="Lease owner" value={zone?.active_lease_owner || 'None'} />
      </Stack>
    </ButtonBase>
  );
}

function ActiveWork({
  task,
  taskNumber,
  totalTasks,
  robotId,
  item,
  onSelectTask,
}: {
  task?: MissionTask;
  taskNumber: number;
  totalTasks: number;
  robotId?: string;
  item?: MissionPackage;
  onSelectTask: (taskId: string) => void;
}) {
  const nextEvent = task?.unblock_condition || task?.next_expected_event || null;

  return (
    <ButtonBase
      onClick={() => task && onSelectTask(task.id)}
      disabled={!task}
      sx={{
        width: '100%',
        p: 1.25,
        border: 1,
        borderColor: task ? 'primary.main' : 'divider',
        borderRadius: 1,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        bgcolor: task?.status === 'waiting' ? '#fffbeb' : task ? '#eff6ff' : 'background.paper',
      }}
    >
      <Stack spacing={0.75} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle2" fontWeight={800}>
            Active Work
          </Typography>
          {task && <StatusChip status={task.status} />}
        </Stack>
        <Typography variant="body2" fontWeight={700}>
          {task?.label ?? 'No active mission task'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <KeyValue label="Task progress" value={task ? `${taskNumber} / ${totalTasks}` : 'None'} />
          <KeyValue label="Phase" value={formatLabel(task?.phase || task?.status || 'idle')} />
          <KeyValue label="Next" value={nextEvent || 'None'} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <KeyValue label="Package" value={item?.id || packageIdFromTask(task) || 'None'} />
          <KeyValue label="Robot" value={robotId || task?.assigned_robot || 'None'} />
          <KeyValue
            label="Leg"
            value={task ? `${task.start || 'Start'} -> ${task.goal || 'Done'}` : 'None'}
          />
        </Stack>
        {(task?.waiting_at || task?.next_expected_event || task?.unblock_condition) && (
          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {task.waiting_at ? `Waiting at ${task.waiting_at}. ` : ''}
            {nextEvent}
          </Typography>
        )}
      </Stack>
    </ButtonBase>
  );
}

function PackageQueue({
  title,
  packages,
  total,
}: {
  title: string;
  packages: MissionPackage[];
  total: number;
}) {
  return (
    <Section title={`${title} (${packages.length})`}>
      <Stack spacing={0.75}>
        <LinearProgress
          variant="determinate"
          value={total > 0 ? Math.round((packages.length / total) * 100) : 0}
        />
        <PackageChips packages={packages} />
      </Stack>
    </Section>
  );
}

function WaitPoints({
  zones,
  robots,
  selectedEntity,
  onSelectZone,
}: {
  zones: Zone[];
  robots: DashboardData['robots'];
  selectedEntity: SelectedEntity;
  onSelectZone: (zoneId: string) => void;
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
      {zones.map((zone) => {
        const waitingRobot = robots.find((robot) => robot.location === zone.id);
        return (
          <ButtonBase
            key={zone.id}
            onClick={() => onSelectZone(zone.id)}
            sx={{
              flex: 1,
              p: 1,
              border: 1,
              borderColor:
                selectedEntity.type === 'zone' && selectedEntity.id === zone.id
                  ? 'primary.main'
                  : 'divider',
              borderRadius: 1,
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              <Typography variant="body2" fontWeight={700}>
                {zone.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {waitingRobot ? `${waitingRobot.id} waiting here` : 'No robot waiting'}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

export function MissionFlowView({
  data,
  selectedEntity,
  onSelectTask,
  onSelectZone,
}: {
  data: DashboardData;
  selectedEntity: SelectedEntity;
  onSelectTask: (taskId: string) => void;
  onSelectZone: (zoneId: string) => void;
}) {
  const navigate = useNavigate();
  const packages = data.packages.length > 0 ? data.packages : fallbackPackages(data.tasks);
  const activeTask = getActiveTask(data);
  const activeRobot = getActiveRobot(data);
  const activeTaskIndex = activeTask
    ? data.tasks.findIndex((task) => task.id === activeTask.id) + 1
    : 0;
  const activeItem = activePackage(packages, activeTask, activeRobot?.id);
  const sourcePackages = packagesByStatus(packages, 'at_source');
  const transferPackages = packagesByStatus(packages, 'at_transfer');
  const deliveredPackages = packagesByStatus(packages, 'delivered');
  const movingPackages = packages.filter(
    (item) => item.status === 'carried' || item.status === 'in_transit',
  );
  const transferZone = zoneByType(data, 'transfer', 'transfer');
  const waitZones = stagingZones(data);
  const attention =
    data.mission.current_blocker ||
    activeTask?.blocked_reason ||
    activeTask?.unblock_condition ||
    activeTask?.next_expected_event ||
    (data.system.connection_status !== 'connected' ? 'Waiting for live mission data.' : null);

  return (
    <Panel
      title="Mission Control"
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<OpenInNewIcon />} onClick={() => navigate('../tasks')}>
            Tasks
          </Button>
        </Stack>
      }
    >
      <Stack spacing={1.25}>
        {attention && (
          <Alert
            severity={data.mission.current_blocker ? 'warning' : 'info'}
            icon={<WarningAmberIcon />}
          >
            {attention}
          </Alert>
        )}

        <Section title="Active Work">
          <ActiveWork
            task={activeTask}
            taskNumber={activeTaskIndex}
            totalTasks={data.tasks.length}
            robotId={activeRobot?.id}
            item={activeItem}
            onSelectTask={onSelectTask}
          />
        </Section>

        <Section title="Package Flow">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            <PackageQueue title="Source Queue" packages={sourcePackages} total={packages.length} />
            <PackageQueue title="Moving" packages={movingPackages} total={packages.length} />
            <PackageQueue
              title="Transfer Buffer"
              packages={transferPackages}
              total={packages.length}
            />
            <PackageQueue title="Delivered" packages={deliveredPackages} total={packages.length} />
          </Box>
        </Section>

        <Section title="Zone / Resource Management">
          <Stack spacing={1}>
            <TransferResource
              zone={transferZone}
              selected={selectedEntity.type === 'zone' && selectedEntity.id === transferZone?.id}
              onSelect={() => transferZone && onSelectZone(transferZone.id)}
            />
            {waitZones.length > 0 && (
              <WaitPoints
                zones={waitZones}
                robots={data.robots}
                selectedEntity={selectedEntity}
                onSelectZone={onSelectZone}
              />
            )}
          </Stack>
        </Section>
      </Stack>
    </Panel>
  );
}
