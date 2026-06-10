import { Chip, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { formatLabel, statusColor } from './formatting';

export function StatusChip({ status }: { status: string }) {
  return <Chip size="small" label={formatLabel(status)} color={statusColor(status)} />;
}

export function Panel({
  title,
  action,
  children,
}: React.PropsWithChildren<{ title: string; action?: React.ReactNode }>) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: '100%', borderRadius: 1, minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Stack sx={{ ml: 'auto' }}>{action}</Stack>
      </Stack>
      {children}
    </Paper>
  );
}

export function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" textAlign="right" sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}
