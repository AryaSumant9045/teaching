import React from 'react';

// Automatically detect YouTube URLs and convert them to valid embed IFrames
const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return null;
};

// Automatically detect Google Drive file IDs
const getDriveFileId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return driveMatch ? driveMatch[1] : null;
};

interface CourseVideoPlayerProps {
  videoUrl: string | undefined | null;
  title?: string;
}

export default function CourseVideoPlayer({ videoUrl, title = 'Course Lecture Video' }: CourseVideoPlayerProps) {
  if (!videoUrl) return null;

  // 1. YouTube Rendering
  const ytEmbed = getYouTubeEmbedUrl(videoUrl);
  if (ytEmbed) {
    return (
      <iframe
        src={ytEmbed}
        width="100%"
        height="100%"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{ border: 'none' }}
        title={title}
      ></iframe>
    );
  }

  // 2. Google Drive Rendering via iframe link
  const driveId = getDriveFileId(videoUrl);
  if (driveId) {
    const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    return (
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        allow="autoplay; fullscreen"
        allowFullScreen
        style={{ border: 'none', backgroundColor: '#000' }}
        title={title}
      ></iframe>
    );
  }

  // 3. Fallback Image Rendering
  if (videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || videoUrl.startsWith('data:image/')) {
    return (
      <img src={videoUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    );
  }

  // 4. Default Fallback
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'white' }}>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Attempting to load untyped source...</p>
      <iframe src={videoUrl} width="100%" height="100%" allowFullScreen style={{ border: 'none', marginTop: '10px' }} title={title} />
    </div>
  );
}
