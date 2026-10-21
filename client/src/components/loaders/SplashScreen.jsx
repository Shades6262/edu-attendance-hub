import React from 'react';

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="book-loader-wrapper mb-6">
        <div className="book">
          <div className="book__pg-shadow" />
          <div className="book__pg" />
          <div className="book__pg book__pg--2" />
          <div className="book__pg book__pg--3" />
          <div className="book__pg book__pg--4" />
          <div className="book__pg book__pg--5" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800">EduAttendance</h2>
      <p className="text-sm text-gray-500 mt-1">Loading application...</p>

      <style>{`
        .book-loader-wrapper .book,
        .book-loader-wrapper .book__pg-shadow,
        .book-loader-wrapper .book__pg {
          animation: cover 5s ease-in-out infinite;
        }
        .book-loader-wrapper .book {
          background-color: hsl(142, 70%, 35%);
          border-radius: 0.25em;
          box-shadow:
            0 0.25em 0.5em hsla(0, 0%, 0%, 0.3),
            0 0 0 0.25em hsl(142, 80%, 25%) inset;
          padding: 0.25em;
          perspective: 37.5em;
          position: relative;
          width: 8em;
          height: 6em;
          transform: translate3d(0, 0, 0);
          transform-style: preserve-3d;
        }
        .book-loader-wrapper .book__pg-shadow,
        .book-loader-wrapper .book__pg {
          position: absolute;
          left: 0.25em;
          width: calc(50% - 0.25em);
        }
        .book-loader-wrapper .book__pg-shadow {
          animation-name: shadow;
          background-image: linear-gradient(
            -45deg,
            hsla(0, 0%, 0%, 0) 50%,
            hsla(0, 0%, 0%, 0.3) 50%
          );
          filter: blur(0.25em);
          top: calc(100% - 0.25em);
          height: 3.75em;
          transform: scaleY(0);
          transform-origin: 100% 0%;
        }
        .book-loader-wrapper .book__pg {
          animation-name: pg1;
          background-color: hsl(223, 10%, 100%);
          background-image: linear-gradient(
            90deg,
            hsla(223, 10%, 90%, 0) 87.5%,
            hsl(223, 10%, 90%)
          );
          height: calc(100% - 0.5em);
          transform-origin: 100% 50%;
        }
        .book-loader-wrapper .book__pg--2,
        .book-loader-wrapper .book__pg--3,
        .book-loader-wrapper .book__pg--4 {
          background-image: repeating-linear-gradient(
              hsl(223, 10%, 10%) 0 0.125em,
              hsla(223, 10%, 10%, 0) 0.125em 0.5em
            ),
            linear-gradient(90deg, hsla(223, 10%, 90%, 0) 87.5%, hsl(223, 10%, 90%));
          background-repeat: no-repeat;
          background-position: center;
          background-size:
            2.5em 4.125em,
            100% 100%;
        }
        .book-loader-wrapper .book__pg--2 {
          animation-name: pg2;
        }
        .book-loader-wrapper .book__pg--3 {
          animation-name: pg3;
        }
        .book-loader-wrapper .book__pg--4 {
          animation-name: pg4;
        }
        .book-loader-wrapper .book__pg--5 {
          animation-name: pg5;
        }

        @keyframes cover {
          from,
          5%,
          45%,
          55%,
          95%,
          to {
            animation-timing-function: ease-out;
            background-color: hsl(142, 70%, 40%);
          }
          10%,
          40%,
          60%,
          90% {
            animation-timing-function: ease-in;
            background-color: hsl(142, 80%, 25%);
          }
        }
        @keyframes shadow {
          from,
          10.01%,
          20.01%,
          30.01%,
          40.01% {
            animation-timing-function: ease-in;
            transform: translate3d(0, 0, 1px) scaleY(0) rotateY(0);
          }
          5%,
          15%,
          25%,
          35%,
          45%,
          55%,
          65%,
          75%,
          85%,
          95% {
            animation-timing-function: ease-out;
            transform: translate3d(0, 0, 1px) scaleY(0.2) rotateY(90deg);
          }
          10%,
          20%,
          30%,
          40%,
          50%,
          to {
            animation-timing-function: ease-out;
            transform: translate3d(0, 0, 1px) scaleY(0) rotateY(180deg);
          }
          50.01%,
          60.01%,
          70.01%,
          80.01%,
          90.01% {
            animation-timing-function: ease-in;
            transform: translate3d(0, 0, 1px) scaleY(0) rotateY(180deg);
          }
          60%,
          70%,
          80%,
          90%,
          to {
            animation-timing-function: ease-out;
            transform: translate3d(0, 0, 1px) scaleY(0) rotateY(0);
          }
        }
        @keyframes pg1 {
          from,
          to {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.4deg);
          }
          10%,
          15% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(180deg);
          }
          20%,
          80% {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(180deg);
          }
          85%,
          90% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(180deg);
          }
        }
        @keyframes pg2 {
          from,
          to {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(0.3deg);
          }
          5%,
          10% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.3deg);
          }
          20%,
          25% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.9deg);
          }
          30%,
          70% {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(179.9deg);
          }
          75%,
          80% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.9deg);
          }
          90%,
          95% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.3deg);
          }
        }
        @keyframes pg3 {
          from,
          10%,
          90%,
          to {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(0.2deg);
          }
          15%,
          20% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.2deg);
          }
          30%,
          35% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.8deg);
          }
          40%,
          60% {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(179.8deg);
          }
          65%,
          70% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.8deg);
          }
          80%,
          85% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.2deg);
          }
        }
        @keyframes pg4 {
          from,
          20%,
          80%,
          to {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(0.1deg);
          }
          25%,
          30% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.1deg);
          }
          40%,
          45% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.7deg);
          }
          50% {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(179.7deg);
          }
          55%,
          60% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.7deg);
          }
          70%,
          75% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0.1deg);
          }
        }
        @keyframes pg5 {
          from,
          30%,
          70%,
          to {
            animation-timing-function: ease-in;
            background-color: hsl(223, 10%, 45%);
            transform: translate3d(0, 0, 1px) rotateY(0);
          }
          35%,
          40% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0deg);
          }
          50% {
            animation-timing-function: ease-in-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(179.6deg);
          }
          60%,
          65% {
            animation-timing-function: ease-out;
            background-color: hsl(223, 10%, 100%);
            transform: translate3d(0, 0, 1px) rotateY(0);
          }
        }
      `}</style>
    </div>
  );
};
