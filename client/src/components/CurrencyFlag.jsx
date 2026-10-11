import React from 'react';

// Crisp, authentic SVG flag components for major currencies
export default function CurrencyFlag({ code = 'USD', className = 'w-5 h-5 rounded-full overflow-hidden shrink-0' }) {
  const c = code?.toUpperCase();

  switch (c) {
    case 'USD':
      return (
        <span className={className} title="United States">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <g fillRule="evenodd">
              <path fill="#bd3d44" d="M0 0h640v480H0z" />
              <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640" />
              <path fill="#192f5d" d="M0 0h280v259H0z" />
              {/* Stars representation */}
              <g fill="#fff">
                <circle cx="30" cy="25" r="7" /><circle cx="70" cy="25" r="7" /><circle cx="110" cy="25" r="7" /><circle cx="150" cy="25" r="7" /><circle cx="190" cy="25" r="7" /><circle cx="230" cy="25" r="7" />
                <circle cx="50" cy="50" r="7" /><circle cx="90" cy="50" r="7" /><circle cx="130" cy="50" r="7" /><circle cx="170" cy="50" r="7" /><circle cx="210" cy="50" r="7" />
                <circle cx="30" cy="75" r="7" /><circle cx="70" cy="75" r="7" /><circle cx="110" cy="75" r="7" /><circle cx="150" cy="75" r="7" /><circle cx="190" cy="75" r="7" /><circle cx="230" cy="75" r="7" />
                <circle cx="50" cy="100" r="7" /><circle cx="90" cy="100" r="7" /><circle cx="130" cy="100" r="7" /><circle cx="170" cy="100" r="7" /><circle cx="210" cy="100" r="7" />
                <circle cx="30" cy="125" r="7" /><circle cx="70" cy="125" r="7" /><circle cx="110" cy="125" r="7" /><circle cx="150" cy="125" r="7" /><circle cx="190" cy="125" r="7" /><circle cx="230" cy="125" r="7" />
                <circle cx="50" cy="150" r="7" /><circle cx="90" cy="150" r="7" /><circle cx="130" cy="150" r="7" /><circle cx="170" cy="150" r="7" /><circle cx="210" cy="150" r="7" />
                <circle cx="30" cy="175" r="7" /><circle cx="70" cy="175" r="7" /><circle cx="110" cy="175" r="7" /><circle cx="150" cy="175" r="7" /><circle cx="190" cy="175" r="7" /><circle cx="230" cy="175" r="7" />
                <circle cx="50" cy="200" r="7" /><circle cx="90" cy="200" r="7" /><circle cx="130" cy="200" r="7" /><circle cx="170" cy="200" r="7" /><circle cx="210" cy="200" r="7" />
                <circle cx="30" cy="225" r="7" /><circle cx="70" cy="225" r="7" /><circle cx="110" cy="225" r="7" /><circle cx="150" cy="225" r="7" /><circle cx="190" cy="225" r="7" /><circle cx="230" cy="225" r="7" />
              </g>
            </g>
          </svg>
        </span>
      );

    case 'INR':
      return (
        <span className={className} title="India">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#f93" d="M0 0h640v160H0z" />
            <path fill="#fff" d="M0 160h640v160H0z" />
            <path fill="#128807" d="M0 320h640v160H0z" />
            {/* Ashoka Chakra */}
            <circle cx="320" cy="240" r="48" fill="none" stroke="#000080" strokeWidth="6" />
            <circle cx="320" cy="240" r="9" fill="#000080" />
            <g stroke="#000080" strokeWidth="2.5">
              {[...Array(24)].map((_, i) => (
                <line
                  key={i}
                  x1="320"
                  y1="240"
                  x2={320 + 44 * Math.cos((i * 15 * Math.PI) / 180)}
                  y2={240 + 44 * Math.sin((i * 15 * Math.PI) / 180)}
                />
              ))}
            </g>
          </svg>
        </span>
      );

    case 'EUR':
      return (
        <span className={className} title="Euro Area">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#039" d="M0 0h640v480H0z" />
            <g fill="#fc0" transform="translate(320, 240)">
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x = 120 * Math.cos(angle);
                const y = 120 * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="10" />;
              })}
            </g>
          </svg>
        </span>
      );

    case 'GBP':
      return (
        <span className={className} title="United Kingdom">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#012169" d="M0 0h640v480H0z" />
            <path stroke="#fff" strokeWidth="60" d="m0 0 640 480m0-480L0 480" />
            <path stroke="#c8102e" strokeWidth="36" d="m0 0 640 480m0-480L0 480" />
            <path stroke="#fff" strokeWidth="100" d="M320 0v480M0 240h640" />
            <path stroke="#c8102e" strokeWidth="60" d="M320 0v480M0 240h640" />
          </svg>
        </span>
      );

    case 'JPY':
      return (
        <span className={className} title="Japan">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#fff" d="M0 0h640v480H0z" />
            <circle cx="320" cy="240" r="130" fill="#bc002d" />
          </svg>
        </span>
      );

    case 'AUD':
      return (
        <span className={className} title="Australia">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#00008b" d="M0 0h640v480H0z" />
            {/* Canton */}
            <path stroke="#fff" strokeWidth="30" d="m0 0 320 240m0-240L0 240" />
            <path stroke="#c8102e" strokeWidth="18" d="m0 0 320 240m0-240L0 240" />
            <path stroke="#fff" strokeWidth="50" d="M160 0v240M0 120h320" />
            <path stroke="#c8102e" strokeWidth="30" d="M160 0v240M0 120h320" />
            {/* Commonwealth Star */}
            <circle cx="160" cy="360" r="38" fill="#fff" />
            {/* Southern Cross stars */}
            <circle cx="480" cy="100" r="14" fill="#fff" />
            <circle cx="530" cy="180" r="14" fill="#fff" />
            <circle cx="480" cy="380" r="16" fill="#fff" />
            <circle cx="430" cy="230" r="14" fill="#fff" />
            <circle cx="450" cy="280" r="9" fill="#fff" />
          </svg>
        </span>
      );

    case 'CAD':
      return (
        <span className={className} title="Canada">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#f00" d="M0 0h160v480H0zm480 0h160v480H480z" />
            <path fill="#fff" d="M160 0h320v480H160z" />
            {/* Maple leaf representation */}
            <path fill="#f00" d="M320 110l25 60 45-20-15 50 45 15-40 30 20 45-55-10-10 60-15 30-15-30-10-60-55 10 20-45-40-30 45-15-15-50 45 20z" />
          </svg>
        </span>
      );

    case 'CHF':
      return (
        <span className={className} title="Switzerland">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#d52b1e" d="M0 0h640v480H0z" />
            <path fill="#fff" d="M260 110h120v260H260z" />
            <path fill="#fff" d="M150 200h340v80H150z" />
          </svg>
        </span>
      );

    case 'SGD':
      return (
        <span className={className} title="Singapore">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#ed2939" d="M0 0h640v240H0z" />
            <path fill="#fff" d="M0 240h640v240H0z" />
            {/* Crescent and stars */}
            <circle cx="140" cy="120" r="60" fill="#fff" />
            <circle cx="160" cy="120" r="54" fill="#ed2939" />
            <circle cx="165" cy="85" r="9" fill="#fff" />
            <circle cx="190" cy="100" r="9" fill="#fff" />
            <circle cx="185" cy="135" r="9" fill="#fff" />
            <circle cx="155" cy="145" r="9" fill="#fff" />
            <circle cx="145" cy="115" r="9" fill="#fff" />
          </svg>
        </span>
      );

    case 'AED':
      return (
        <span className={className} title="United Arab Emirates">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#00732f" d="M0 0h640v160H0z" />
            <path fill="#fff" d="M0 160h640v160H0z" />
            <path fill="#000" d="M0 320h640v160H0z" />
            <path fill="#f00" d="M0 0h160v480H0z" />
          </svg>
        </span>
      );

    case 'SAR':
      return (
        <span className={className} title="Saudi Arabia">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#006c35" d="M0 0h640v480H0z" />
            <path fill="#fff" d="M200 290h240v14H200zm30 18l-30-22 30-22v44z" />
          </svg>
        </span>
      );

    case 'QAR':
      return (
        <span className={className} title="Qatar">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#8d1b3d" d="M0 0h640v480H0z" />
            <path fill="#fff" d="M0 0h180l40 26.6-40 26.7 40 26.7-40 26.7 40 26.6-40 26.7 40 26.7-40 26.6 40 26.7-40 26.7 40 26.6-40 26.7 40 26.7-40 26.6 40 26.7-40 26.7 40 26.6-40 26.7 40 26.7H0z" />
          </svg>
        </span>
      );

    case 'THB':
      return (
        <span className={className} title="Thailand">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#a51931" d="M0 0h640v80H0zm0 400h640v80H0z" />
            <path fill="#f4f5f8" d="M0 80h640v80H0zm0 240h640v80H0z" />
            <path fill="#2d2a4a" d="M0 160h640v160H0z" />
          </svg>
        </span>
      );

    case 'CNY':
      return (
        <span className={className} title="China">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#ee1c25" d="M0 0h640v480H0z" />
            <circle cx="100" cy="100" r="36" fill="#ff0" />
            <circle cx="170" cy="50" r="12" fill="#ff0" />
            <circle cx="200" cy="80" r="12" fill="#ff0" />
            <circle cx="200" cy="130" r="12" fill="#ff0" />
            <circle cx="170" cy="160" r="12" fill="#ff0" />
          </svg>
        </span>
      );

    case 'NZD':
      return (
        <span className={className} title="New Zealand">
          <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
            <path fill="#00247d" d="M0 0h640v480H0z" />
            {/* Canton */}
            <path stroke="#fff" strokeWidth="30" d="m0 0 320 240m0-240L0 240" />
            <path stroke="#cc142b" strokeWidth="18" d="m0 0 320 240m0-240L0 240" />
            <path stroke="#fff" strokeWidth="50" d="M160 0v240M0 120h320" />
            <path stroke="#cc142b" strokeWidth="30" d="M160 0v240M0 120h320" />
            {/* Stars */}
            <circle cx="480" cy="120" r="15" fill="#cc142b" stroke="#fff" strokeWidth="3" />
            <circle cx="540" cy="200" r="13" fill="#cc142b" stroke="#fff" strokeWidth="3" />
            <circle cx="480" cy="340" r="17" fill="#cc142b" stroke="#fff" strokeWidth="3" />
            <circle cx="430" cy="220" r="13" fill="#cc142b" stroke="#fff" strokeWidth="3" />
          </svg>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] bg-zinc-800 text-white ${className}`}>
          {c?.slice(0, 2) || 'FX'}
        </span>
      );
  }
}
