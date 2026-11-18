import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Delete this item?', message, onCancel, onConfirm, busy = false }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="confirm-content"><span className="confirm-icon"><AlertTriangle size={21} /></span><p>{message || 'This action cannot be undone.'}</p></div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button><button className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button></div>
    </Modal>
  );
}
