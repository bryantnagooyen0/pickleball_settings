import { ImageResponse } from '@vercel/og';
import { getPaddlePath, getArcPolylinePoints } from '../../src/utils/paddleDrawing.js';

export const config = { runtime: 'edge' };

const FALLBACK_IMAGE_PROPS = {
  paddleName: 'Pickleball Setup',
  paddleShape: 'hybrid',
  strips: [],
};

export default async function handler(req) {
  const url = new URL(req.url);
  const setupId = url.pathname.split('/').pop();
  const backendUrl = process.env.BACKEND_URL;

  let { paddleName, paddleShape, strips } = FALLBACK_IMAGE_PROPS;

  try {
    const res = await fetch(`${backendUrl}/api/setups/${setupId}`, {
      headers: { 'User-Agent': 'PickleballSettings-OG/1.0' },
    });
    if (res.ok) {
      const body = await res.json();
      const setup = body.data;
      paddleName = setup?.paddle?.name || paddleName;
      paddleShape = setup?.paddle?.shape || paddleShape;
      strips = setup?.leadTapeStrips || [];
    }
  } catch {
    // use fallback values
  }

  const paddlePath = getPaddlePath(paddleShape);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0d1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '64px',
          padding: '60px',
        }}
      >
        {/* Paddle SVG */}
        <svg
          width="200"
          height="420"
          viewBox="0 0 440 908"
          style={{ flexShrink: '0' }}
        >
          <path d={paddlePath} fill="#1e3a2f" stroke="#4ade80" strokeWidth="6" />
          {strips.map((strip, i) => {
            const points = getArcPolylinePoints(strip.t1, strip.arcFraction, paddlePath);
            if (!points) return null;
            return (
              <polyline
                key={String(i)}
                points={points}
                fill="none"
                stroke="#facc15"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1' }}>
          <div
            style={{
              fontSize: '18px',
              color: '#4ade80',
              fontWeight: '600',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Pickleball Settings
          </div>
          <div
            style={{
              fontSize: '52px',
              color: '#ffffff',
              fontWeight: '700',
              lineHeight: '1.15',
            }}
          >
            {paddleName}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
