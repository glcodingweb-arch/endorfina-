import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
        }}
      >
        <img
          width="28"
          height="28"
          src="https://res.cloudinary.com/dl38o4mnk/image/upload/v1769463771/LOGO.png_gteiuk.png"
          alt="Endorfina Esportes"
          style={{
            objectFit: 'contain'
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
