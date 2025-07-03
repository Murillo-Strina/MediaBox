import { toast } from 'react-toastify';

export const toastConfig = {
  position: "top-left",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  theme: "dark",
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function toastConfirm(message, onConfirm, onCancel) {
  const toastId = `confirm-${Date.now()}`;

  toast.info(
    <div>
      <div>{message}</div>
      <div style={{
        marginTop: '0.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => { onConfirm(); toast.dismiss(toastId); }}
          style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sim
        </button>
        <button
          onClick={() => { onCancel?.(); toast.dismiss(toastId); }}
          style={{
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Não
        </button>
      </div>
    </div>,
    {
      ...toastConfig,
      toastId: toastId,
      icon: false,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    }
  );
}