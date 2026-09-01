import React from 'react';
import { usePOS } from '../../context/POSContext';

export const OrderSuccessModal: React.FC = () => {
  const { orderSuccess } = usePOS();

  if (!orderSuccess) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal"
        style={{
          maxWidth: '400px',
          textAlign: 'center',
          padding: '40px 24px',
          animation: 'slideUp 0.4s ease-out',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
        <h2
          style={{
            fontSize: '1.75rem',
            color: 'var(--text-main)',
            fontWeight: 800,
            margin: 0,
          }}
        >
          Payment Successful!
        </h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          Order placed & inventory updated.
        </p>
      </div>
    </div>
  );
};
