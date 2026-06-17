import CancelIcon from '@mui/icons-material/Cancel';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';

import { StatusChip } from './common';
import { DashboardData, MissionAction } from './types';

export function TopBar({
  data,
  onMissionAction,
}: {
  data: DashboardData;
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
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <StatusChip status={data.mission.status} />
          <Chip size="small" label={`Updated ${data.system.last_update}`} />
        </Stack>

        <Box sx={{ flex: 1 }} />

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
