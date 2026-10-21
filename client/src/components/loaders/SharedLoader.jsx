import React from 'react';

export const SharedLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className="mover-wrapper">
        <div className="mover" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{message}</p>

      <style>{`
        .mover-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 0;
        }
        .mover {
          background: rgba(22, 163, 74, 0.95);
          height: 10px;
          width: 80px;
          border-radius: 10px;
          position: relative;
          animation: mover5 2s ease-in-out infinite;
        }

        .mover::before,
        .mover::after {
          content: '';
          position: absolute;
          height: 10px;
          border-radius: 10px;
          left: 20px;
          animation: mover5 2s ease-in-out infinite;
        }

        .mover::before {
          background: rgb(21, 128, 61);
          top: 20px;
          width: 50px;
        }

        .mover::after {
          background: rgb(74, 222, 128);
          top: -20px;
          width: 60px;
        }

        @keyframes mover5 {
          0% {
            transform: translateX(30px) scale(1);
          }

          50% {
            transform: translateX(-30px) scale(1.1);
          }

          100% {
            transform: translateX(30px) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
