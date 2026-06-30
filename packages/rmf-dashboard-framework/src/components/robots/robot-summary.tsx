import {
  Battery0Bar,
  Battery1Bar,
  Battery2Bar,
  Battery3Bar,
  Battery4Bar,
  Battery5Bar,
  Battery6Bar,
  BatteryChargingFull,
  BatteryFull,
  BatteryUnknown,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  LinearProgressProps,
  TextField,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ApiServerModelsRmfApiRobotStateStatus as Status,
  RobotState,
  TaskStateOutput as TaskState,
} from 'api-client';
import React from 'react';
import { combineLatest, EMPTY, mergeMap, of } from 'rxjs';

import { useAppController, useRmfApi } from '../../hooks';
import type { RobotCommand } from '../../services';
import { TaskCancelButton } from '../tasks/task-cancellation';
import { TaskInspector } from '../tasks/task-inspector';
import { RobotDecommissionButton } from './robot-decommission';
import { RobotTableData } from './robot-table-datagrid';

const setTaskDialogColor = (robotStatus: Status | undefined | null, theme: Theme) => {
  if (!robotStatus) {
    return theme.palette.background.default;
  }

  switch (robotStatus) {
    case Status.Error:
      return theme.palette.error.dark;

    case Status.Working:
      return theme.palette.success.dark;

    default:
      return theme.palette.warning.main;
  }
};

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

interface RobotSummaryProps {
  onClose: () => void;
  robot: RobotTableData;
}

const showBatteryIcon = (robot: RobotState, robotBattery: number) => {
  if (robot.status === Status.Charging) {
    return <BatteryChargingFull />;
  }

  const batteryIcons: Record<number, JSX.Element> = {
    0: <Battery0Bar />,
    16: <Battery1Bar />,
    32: <Battery2Bar />,
    48: <Battery3Bar />,
    64: <Battery4Bar />,
    80: <Battery5Bar />,
    96: <Battery6Bar />,
    100: <BatteryFull />,
  };

  for (const level in batteryIcons) {
    if (robotBattery >= parseInt(level)) {
      continue;
    } else {
      return batteryIcons[level];
    }
  }
  return <BatteryUnknown />;
};

export const RobotSummary = React.memo(({ onClose, robot }: RobotSummaryProps) => {
  const rmfApi = useRmfApi();
  const appController = useAppController();

  const [isOpen, setIsOpen] = React.useState(true);
  const [robotState, setRobotState] = React.useState<RobotState | null>(null);
  const [taskState, setTaskState] = React.useState<TaskState | null>(null);
  const [missionId, setMissionId] = React.useState<string | null>(null);
  const [robotCommandPending, setRobotCommandPending] = React.useState(false);
  const [speedScale, setSpeedScale] = React.useState(1);
  const [openTaskDetailsLogs, setOpenTaskDetailsLogs] = React.useState(false);
  React.useEffect(() => {
    const sub = rmfApi
      .getFleetStateObs(robot.fleet)
      .pipe(
        mergeMap((fleetState) => {
          const robotState = fleetState?.robots?.[robot.name];
          const taskObs = robotState?.task_id
            ? rmfApi.getTaskStateObs(robotState.task_id)
            : of(null);
          return robotState ? combineLatest([of(robotState), taskObs]) : EMPTY;
        }),
      )
      .subscribe(([robotState, taskState]) => {
        setRobotState(robotState);
        setTaskState(taskState);
      });
    return () => sub.unsubscribe();
  }, [rmfApi, robot.fleet, robot.name]);

  React.useEffect(() => {
    const sub = rmfApi.missionStateObs.subscribe((state) => {
      const mission = state['mission'];
      if (typeof mission !== 'object' || mission === null) {
        setMissionId(null);
        return;
      }
      const id = (mission as Record<string, unknown>).id;
      setMissionId(typeof id === 'string' ? id : null);
      const robots = state['robots'];
      if (Array.isArray(robots)) {
        const missionRobot = robots.find(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            (item as Record<string, unknown>).id === robot.name,
        ) as Record<string, unknown> | undefined;
        const confirmedScale = missionRobot?.speed_scale;
        if (typeof confirmedScale === 'number') {
          setSpeedScale(confirmedScale);
        }
      }
    });
    return () => sub.unsubscribe();
  }, [rmfApi, robot.name]);

  const handleRobotCommand = React.useCallback(
    async (command: RobotCommand) => {
      if (!missionId || !robotState?.name) {
        return;
      }
      setRobotCommandPending(true);
      try {
        await rmfApi.sendRobotCommand(missionId, robotState.name, command);
        appController.showAlert(
          'success',
          `${command === 'pause_robot' ? 'Pause' : 'Resume'} requested for ${robotState.name}`,
        );
      } catch (e) {
        appController.showAlert('error', `Failed to send robot command: ${(e as Error).message}`);
      } finally {
        setRobotCommandPending(false);
      }
    },
    [appController, missionId, rmfApi, robotState],
  );

  const handleSpeedScale = React.useCallback(
    async (scale: number) => {
      if (!missionId || !robotState?.name) {
        return;
      }
      setRobotCommandPending(true);
      try {
        await rmfApi.setRobotSpeedScale(missionId, robotState.name, scale);
        appController.showAlert(
          'success',
          `${Math.round(scale * 100)}% speed requested for ${robotState.name}`,
        );
      } catch (e) {
        appController.showAlert('error', `Failed to set robot speed: ${(e as Error).message}`);
      } finally {
        setRobotCommandPending(false);
      }
    },
    [appController, missionId, rmfApi, robotState],
  );

  const taskProgress = React.useMemo(() => {
    if (
      !taskState ||
      !taskState.estimate_millis ||
      !taskState.unix_millis_start_time ||
      !taskState.unix_millis_finish_time
    ) {
      console.log(`Can't calculate task progress`);
      return undefined;
    }

    return Math.min(
      1.0 -
        taskState.estimate_millis /
          (taskState.unix_millis_finish_time - taskState.unix_millis_start_time),
      1,
    );
  }, [taskState]);

  const [navigationStart, navigationDestination] = React.useMemo(() => {
    if (!taskState || !taskState.phases || !taskState.active) {
      return [null, null];
    }

    const message = Object.values(taskState.phases)[taskState.active - 1]?.detail;

    if (message) {
      const regex = /\[place:(.*?)\]/g;

      let match;
      const waypoints = [];

      while ((match = regex.exec(message.toString()))) {
        waypoints.push(match[1]);
      }

      return [waypoints[0] || '-', waypoints[1] || '-'];
    } else {
      console.error("Failed to retrieve robot's current navigation start and destination.");
      return ['-', '-'];
    }
  }, [taskState]);

  const theme = useTheme();

  const returnDialogContent = () => {
    const contents = [
      {
        title: 'Assigned tasks',
        value: taskState ? taskState.booking.id : 'No task',
      },
      {
        title: 'Est. end time',
        value: taskState?.unix_millis_finish_time
          ? `${new Date(taskState?.unix_millis_finish_time).toLocaleString()}`
          : '-',
      },
    ];

    if (taskState) {
      contents.push(
        {
          title: 'Navigation start',
          value: navigationStart ? navigationStart : '-',
        },
        {
          title: 'Navigation destination',
          value: navigationDestination ? navigationDestination : '-',
        },
      );
    }

    if (robotState && robotState.commission) {
      const commission = robotState.commission;
      contents.push({
        title: `[${
          commission.dispatch_tasks === false ? 'Decommissioned' : 'Commissioned'
        }] status`,
        value:
          `Direct tasks  : ${commission.direct_tasks ?? 'n/a'}\n` +
          `Dispatch tasks: ${commission.dispatch_tasks ?? 'n/a'}\n` +
          `Idle Behavior : ${commission.idle_behavior ?? 'n/a'}`,
      });
    }

    return (
      <>
        {contents.map((message, index) => (
          <div key={index}>
            <TextField
              label={message.title}
              id="standard-size-small"
              size="small"
              variant="filled"
              InputProps={{ readOnly: true }}
              fullWidth={true}
              multiline
              maxRows={4}
              margin="dense"
              value={message.value}
              sx={{
                '& .MuiFilledInput-root': {
                  fontSize: '1.15',
                },
                background: theme.palette.background.default,
                '&:hover': {
                  backgroundColor: theme.palette.background.default,
                },
              }}
            />
          </div>
        ))}
      </>
    );
  };

  return (
    <Dialog
      PaperProps={{
        style: {
          backgroundColor: setTaskDialogColor(robotState?.status, theme),
          boxShadow: 'none',
        },
      }}
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        onClose();
      }}
      fullWidth
      maxWidth={'sm'}
    >
      <Grid container mb={1} alignItems="center" spacing={1}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <DialogTitle align="center" sx={{ fontSize: '1.5rem' }}>
            Robot summary: {robotState?.name}
          </DialogTitle>
        </Grid>
        <Grid item xs={2}>
          <Grid container justifyContent="flex-end">
            <Typography variant="subtitle1">{`${
              robotState?.battery ? (robotState.battery * 100).toFixed(0) : 0
            }%`}</Typography>
            {robotState && (
              <>{showBatteryIcon(robot, robotState.battery ? robotState?.battery * 100 : 0)}</>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      {taskProgress && (
        <>
          <Typography variant="body2" fontWeight="bold" ml={3} mt={1}>
            Task progress
          </Typography>
          <Box sx={{ width: '95%', ml: 3 }}>
            <LinearProgressWithLabel value={taskProgress * 100} />
          </Box>
        </>
      )}
      <DialogContent>{returnDialogContent()}</DialogContent>
      <Box sx={{ px: 3, pb: 1, textAlign: 'center' }}>
        <Typography variant="body2" fontWeight="bold" mb={1}>
          Speed
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={speedScale}
          disabled={!missionId || !robotState?.name || robotCommandPending}
          onChange={(_event, value: number | null) => value !== null && handleSpeedScale(value)}
        >
          {[0.3, 0.5, 0.75, 1].map((scale) => (
            <ToggleButton key={scale} value={scale}>
              {Math.round(scale * 100)}%
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <DialogActions sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<Pause />}
          disabled={!missionId || !robotState?.name || robotCommandPending}
          onClick={() => handleRobotCommand('pause_robot')}
        >
          Pause robot
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<PlayArrow />}
          disabled={!missionId || !robotState?.name || robotCommandPending}
          onClick={() => handleRobotCommand('resume_robot')}
        >
          Resume robot
        </Button>
        <RobotDecommissionButton
          fleet={robot.fleet}
          robotState={robotState}
          size="small"
          variant="contained"
          color="secondary"
          sx={{
            fontSize: '1rem',
            padding: '6px 12px',
          }}
        />
        <TaskCancelButton
          taskId={taskState ? taskState.booking.id : null}
          size="small"
          variant="contained"
          color="secondary"
          sx={{
            fontSize: '1rem',
            padding: '6px 12px',
          }}
        />
      </DialogActions>
      {openTaskDetailsLogs && taskState && (
        <TaskInspector task={taskState} onClose={() => setOpenTaskDetailsLogs(false)} />
      )}
    </Dialog>
  );
});
