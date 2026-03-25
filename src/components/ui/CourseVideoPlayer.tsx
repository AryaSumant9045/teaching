import React from 'react';

// Broad YouTube regex covering all URL variants:
//   youtube.com/watch?v=ID
//   youtu.be/ID
//   youtube.com/embed/ID
//   youtube.com/v/ID
//   youtube.com/shorts/ID
//   youtube.com/live/ID
const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    // rel=0  → don't show related videos from other channels
    // modestbranding=1 → hide YouTube logo
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }
  return null;
};

// Google Drive: grab the file ID from any share/view/preview URL
const getDriveFileId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return driveMatch ? driveMatch[1] : null;
};

interface CourseVideoPlayerProps {
  videoUrl: string | undefined | null;
  title?: string;
}

export default function CourseVideoPlayer({
  videoUrl,
  title = 'Course Lecture Video',
}: CourseVideoPlayerProps) {
  if (!videoUrl) return null;

  const commonIframeProps = {
    width: '100%' as const,
    height: '100%' as const,
    style: { border: 'none' as const },
    title,
    allowFullScreen: true,
  };

  // 1. YouTube
  const ytEmbed = getYouTubeEmbedUrl(videoUrl);
  if (ytEmbed) {
    return (
      <iframe
        {...commonIframeProps}
        src={ytEmbed}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    );
  }

  // 2. Google Drive
  const driveId = getDriveFileId(videoUrl);
  if (driveId) {
    return (
      <iframe
        {...commonIframeProps}
        src={`https://drive.google.com/file/d/${driveId}/preview`}
        allow="autoplay; fullscreen"
        style={{ border: 'none', backgroundColor: '#000' }}
      />
    );
  }

  // 3. Image fallback
  if (videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || videoUrl.startsWith('data:image/')) {
    return (
      <img
        src={videoUrl}
        alt={title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  // 4. Generic iframe fallback
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: 'white',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
        Attempting to load untyped source...
      </p>
      <iframe
        src={videoUrl}
        width="100%"
        height="100%"
        allowFullScreen
        style={{ border: 'none', marginTop: '10px' }}
        title={title}
      />
    </div>
  );
}
