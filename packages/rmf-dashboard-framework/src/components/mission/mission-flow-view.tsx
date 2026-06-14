import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MapIcon from '@mui/icons-material/Map';
import { Box, Button, ButtonBase, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { Panel, StatusChip } from './common';
import { formatLabel, statusColor } from './formatting';
import { getActiveRobot, getActiveTask } from './selectors';
import { DashboardData, MissionTask, SelectedEntity, Zone } from './types';

type FlowStage =
  | 'source'
  | 'moving_to_transfer'
  | 'transfer'
  | 'moving_to_destination'
  | 'destination';

interface PackageFlow {
  id: string;
  stage: FlowStage;
  upstream?: MissionTask;
  downstream?: MissionTask;
}

function textForTask(task: MissionTask): string {
  return `${task.id} ${task.label} ${task.start ?? ''} ${task.goal ?? ''}`.toLowerCase();
}

function packageId(task: MissionTask): string | null {
  const text = `${task.id} ${task.label}`;
  const match = text.match(/\bP\d+\b/i);
  if (match) {
    return match[0].toUpperCase();
  }
  const [prefix] = task.id.split(':');
  return prefix && prefix !== task.id ? prefix.toUpperCase() : null;
}

function isUpstreamTask(task: MissionTask): boolean {
  const text = textForTask(task);
  return text.includes('source') && text.includes('transfer');
}

function isDownstreamTask(task: MissionTask): boolean {
  const text = textForTask(task);
  return (
    text.includes('transfer') &&
    (text.includes('destination') || text.includes('dropoff') || text.includes('drop_off'))
  );
}

function packageStage(upstream?: MissionTask, downstream?: MissionTask): FlowStage {
  if (downstream?.status === 'completed') {
    return 'destination';
  }
  if (downstream && ['active', 'waiting', 'failed'].includes(downstream.status)) {
    return 'moving_to_destination';
  }
  if (upstream?.status === 'completed') {
    return 'transfer';
  }
  if (upstream && ['active', 'waiting', 'failed'].includes(upstream.status)) {
    return 'moving_to_transfer';
  }
  return 'source';
}

function packageFlows(tasks: MissionTask[]): PackageFlow[] {
  const grouped = new Map<string, { upstream?: MissionTask; downstream?: MissionTask }>();

  tasks.forEach((task) => {
    const id = packageId(task);
    if (!id) {
      return;
    }
    const group = grouped.get(id) ?? {};
    if (isUpstreamTask(task)) {
      group.upstream = task;
    }
    if (isDownstreamTask(task)) {
      group.downstream = task;
    }
    grouped.set(id, group);
  });

  return [...grouped.entries()].map(([id, group]) => ({
    id,
    ...group,
    stage: packageStage(group.upstream, group.downstream),
  }));
}

function zoneByType(data: DashboardData, type: Zone['type'], fallbackId: string): Zone {
  return (
    data.zones.find((zone) => zone.type === type) ??
    data.zones.find((zone) => zone.id.includes(fallbackId)) ??
    data.zones[0]
  );
}

function tasksForLeg(tasks: MissionTask[], leg: 'upstream' | 'downstream'): MissionTask[] {
  return tasks.filter(leg === 'upstream' ? isUpstreamTask : isDownstreamTask);
}

function activeLegTask(tasks: MissionTask[]): MissionTask | undefined {
  return tasks.find((task) => ['active', 'waiting', 'failed'].includes(task.status)) ?? tasks[0];
}

function stagePackages(flows: PackageFlow[], stage: FlowStage): string[] {
  return flows.filter((item) => item.stage === stage).map((item) => item.id);
}

function PackageChips({ ids }: { ids: string[] }) {
  if (ids.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        None
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {ids.map((id) => (
        <Chip key={id} size="small" label={id} sx={{ height: 22 }} />
      ))}
    </Stack>
  );
}

function FlowNode({
  label,
  zone,
  packages,
  selected,
  onSelect,
}: {
  label: string;
  zone?: Zone;
  packages: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <ButtonBase
      onClick={onSelect}
      sx={{
        width: '100%',
        minHeight: 118,
        p: 1.25,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        bgcolor: selected ? '#eff6ff' : 'background.paper',
        textAlign: 'left',
      }}
    >
      <Stack spacing={0.75} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={800}>
            {label}
          </Typography>
          {zone && (
            <Chip size="small" label={formatLabel(zone.status)} color={statusColor(zone.status)} />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {zone?.label ?? 'Not reported'}
        </Typography>
        <PackageChips ids={packages} />
        {zone?.occupied_by && (
          <Typography variant="caption" color="text.secondary">
            Occupied by {zone.occupied_by}
          </Typography>
        )}
      </Stack>
    </ButtonBase>
  );
}

function FlowLeg({
  label,
  task,
  packages,
  onSelectTask,
}: {
  label: string;
  task?: MissionTask;
  packages: string[];
  onSelectTask: (taskId: string) => void;
}) {
  return (
    <Box
      sx={{
        minHeight: 118,
        p: 1.25,
        border: 1,
        borderColor:
          task?.status === 'active' || task?.status === 'waiting' ? 'primary.main' : 'divider',
        borderRadius: 1,
        bgcolor:
          task?.status === 'active'
            ? '#eff6ff'
            : task?.status === 'waiting'
              ? '#fffbeb'
              : '#f8fafc',
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <ArrowForwardIcon
            color={task?.status === 'active' ? 'primary' : 'disabled'}
            fontSize="small"
          />
          <Typography variant="subtitle2" fontWeight={800}>
            {label}
          </Typography>
        </Stack>
        {task ? (
          <ButtonBase
            onClick={() => onSelectTask(task.id)}
            sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 1 }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2" fontWeight={700}>
                  {task.assigned_robot || 'Unassigned'}
                </Typography>
                <StatusChip status={task.status} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {task.label}
              </Typography>
            </Stack>
          </ButtonBase>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No task reported
          </Typography>
        )}
        <PackageChips ids={packages} />
      </Stack>
    </Box>
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
  const activeTask = getActiveTask(data);
  const activeRobot = getActiveRobot(data);
  const flows = packageFlows(data.tasks);
  const upstreamTask = activeLegTask(tasksForLeg(data.tasks, 'upstream'));
  const downstreamTask = activeLegTask(tasksForLeg(data.tasks, 'downstream'));
  const pickupZone = zoneByType(data, 'pickup', 'source');
  const transferZone = zoneByType(data, 'transfer', 'transfer');
  const destinationZone = zoneByType(data, 'dropoff', 'destination');

  return (
    <Panel
      title="Mission Flow"
      action={
        <Tooltip title="Open the full Open-RMF map tab">
          <Button size="small" startIcon={<MapIcon />} onClick={() => navigate('..')}>
            Open RMF Map
          </Button>
        </Tooltip>
      }
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`Phase: ${formatLabel(data.mission.phase)}`} />
          <Chip size="small" label={`Active robot: ${activeRobot?.id ?? 'None'}`} />
          <Chip size="small" label={`Next: ${formatLabel(data.mission.next_step)}`} />
          {data.mission.current_blocker && (
            <Chip size="small" color="warning" label={data.mission.current_blocker} />
          )}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr 1fr 1.1fr 1fr' },
            gap: 1,
            alignItems: 'stretch',
          }}
        >
          <FlowNode
            label="Source"
            zone={pickupZone}
            packages={stagePackages(flows, 'source')}
            selected={selectedEntity.type === 'zone' && selectedEntity.id === pickupZone?.id}
            onSelect={() => pickupZone && onSelectZone(pickupZone.id)}
          />
          <FlowLeg
            label="Source to transfer"
            task={upstreamTask}
            packages={stagePackages(flows, 'moving_to_transfer')}
            onSelectTask={onSelectTask}
          />
          <FlowNode
            label="Transfer"
            zone={transferZone}
            packages={stagePackages(flows, 'transfer')}
            selected={selectedEntity.type === 'zone' && selectedEntity.id === transferZone?.id}
            onSelect={() => transferZone && onSelectZone(transferZone.id)}
          />
          <FlowLeg
            label="Transfer to destination"
            task={downstreamTask}
            packages={stagePackages(flows, 'moving_to_destination')}
            onSelectTask={onSelectTask}
          />
          <FlowNode
            label="Destination"
            zone={destinationZone}
            packages={stagePackages(flows, 'destination')}
            selected={selectedEntity.type === 'zone' && selectedEntity.id === destinationZone?.id}
            onSelect={() => destinationZone && onSelectZone(destinationZone.id)}
          />
        </Box>

        {activeTask && (
          <>
            <Divider />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
            >
              <Typography variant="body2" fontWeight={800}>
                Active step
              </Typography>
              <ButtonBase onClick={() => onSelectTask(activeTask.id)} sx={{ textAlign: 'left' }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <StatusChip status={activeTask.status} />
                  <Typography variant="body2">{activeTask.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeTask.assigned_robot || 'Unassigned'}
                  </Typography>
                </Stack>
              </ButtonBase>
            </Stack>
          </>
        )}
      </Stack>
    </Panel>
  );
}
