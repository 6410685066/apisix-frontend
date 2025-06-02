import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';

export function MyDialog({ open, title="Success", message, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          onClose();
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ConfirmDialog({ open, title="Question?", message, onCancel , onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          onCancel();
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{message}</Typography>
      </DialogContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
      </DialogActions>
            <DialogActions>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogActions>
      </Box>
    </Dialog>
  );
}