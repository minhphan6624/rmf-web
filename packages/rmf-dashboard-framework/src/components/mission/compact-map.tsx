import MapIcon from '@mui/icons-material/Map';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router';

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
      </Box>
    </Panel>
  );
}
