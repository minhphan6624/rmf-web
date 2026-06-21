import MapIcon from '@mui/icons-material/Map';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router';

import { AppEvents } from '../app-events';
import { Map, MapProps } from '../map';
import { Panel } from './common';

export function CompactMap({ mapConfig }: { mapConfig: MapProps }) {
  const navigate = useNavigate();

  return (
    <Panel
      title="Fleet Map"
      action={
        <Button size="small" startIcon={<MapIcon />} onClick={() => navigate('..')}>
          Open full map
        </Button>
      }
    >
      <Box
        sx={{
          position: 'relative',
          height: { xs: 220, lg: 260 },
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'grey.100',
        }}
      >
        <Map {...mapConfig} variant="compact" />
        <Stack
          spacing={0.5}
          sx={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            p: 0.5,
            borderRadius: 1,
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: 1,
          }}
        >
          <Tooltip title="Zoom in" placement="left">
            <IconButton size="small" onClick={() => AppEvents.zoomIn.next()}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" placement="left">
            <IconButton size="small" onClick={() => AppEvents.zoomOut.next()}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Panel>
  );
}
