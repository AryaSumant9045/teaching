import React from 'react';

// ─── YouTube ──────────────────────────────────────────────────────────────────
// Handles all common variants:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/shorts/ID
//   https://www.youtube.com/live/ID
//   https://www.youtube.com/embed/ID
const getYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

// ─── Google Drive ─────────────────────────────────────────────────────────────
// Handles share/view/preview URLs:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/file/d/FILE_ID/preview
const getDriveId = (url: string): string | null => {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// ─────────────────────────────────────────────────────────────────────────────

interface UniversalVideoPlayerProps {
  url: string;
}

const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({ url }) => {
  if (!url) return null;

  const ytId = getYouTubeId(url);
  const driveId = getDriveId(url);

  // ── Unsupported URL ──────────────────────────────────────────────────────
  if (!ytId && !driveId) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-gray-400">
        <p className="text-sm px-4 text-center">
          Unsupported video source or invalid URL.
        </p>
      </div>
    );
  }

  // ── Build embed URL ──────────────────────────────────────────────────────
  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`
    : `https://drive.google.com/file/d/${driveId}/preview`;

  // The `allow` string for YouTube requires these exact tokens for autoplay/fullscreen to work.
  const allowStr = ytId
    ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    : 'autoplay; fullscreen';

  return (
    // aspect-video = 16:9.  The iframe fills 100% of this container.
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow={allowStr}
        allowFullScreen
        title="Video Player"
        // No frameBorder — use CSS border:none via Tailwind's default reset
      />
    </div>
  );
};

export default UniversalVideoPlayer;
