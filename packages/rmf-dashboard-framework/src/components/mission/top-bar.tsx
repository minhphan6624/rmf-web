import CancelIcon from '@mui/icons-material/Cancel';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { StatusChip } from './common';
import { scenarioLabels, scenarioOrder } from './mock-dashboard-data';
import { DashboardData, MissionAction, ScenarioId } from './types';

export function TopBar({
  data,
  scenarioId,
  onScenarioChange,
  onMissionAction,
}: {
  data: DashboardData;
  scenarioId: ScenarioId;
  onScenarioChange: (scenarioId: ScenarioId) => void;
  onMissionAction: (action: MissionAction) => void;
}) {
  const showStart = ['idle', 'completed', 'failed', 'cancelled'].includes(data.mission.status);
  const showPause = data.mission.status === 'active';
  const showResume = data.mission.status === 'paused';
  const showCancel = data.mission.status === 'active' || data.mission.status === 'paused';

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', lg: 'center' }}
      >
        <Box sx={{ minWidth: 260 }}>
          <Typography variant="h6" lineHeight={1.2}>
            {data.mission.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.mission.id}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <StatusChip status={data.mission.status} />
          <Chip size="small" label={data.system.connection_status} />
          <Chip
            size="small"
            label={`${data.system.robots_online} / ${data.system.robots_total} robots online`}
          />
          <Chip size="small" label={`Updated ${data.system.last_update}`} />
        </Stack>

        <Box sx={{ flex: 1 }} />

        <FormControl size="small" sx={{ minWidth: 230 }}>
          <InputLabel id="mission-scenario-label">Demo Scenario</InputLabel>
          <Select
            labelId="mission-scenario-label"
            label="Demo Scenario"
            value={scenarioId}
            onChange={(ev) => onScenarioChange(ev.target.value as ScenarioId)}
          >
            {scenarioOrder.map((id) => (
              <MenuItem key={id} value={id}>
                {scenarioLabels[id]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1}>
          {showStart && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => onMissionAction('start')}
            >
              Start Mission
            </Button>
          )}
          {showPause && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<PauseIcon />}
              onClick={() => onMissionAction('pause')}
            >
              Pause Mission
            </Button>
          )}
          {showResume && (
            <Button
              size="small"
              variant="contained"
              startIcon={<RestartAltIcon />}
              onClick={() => onMissionAction('resume')}
            >
              Resume Mission
            </Button>
          )}
          {showCancel && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => onMissionAction('cancel')}
            >
              Cancel Mission
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
