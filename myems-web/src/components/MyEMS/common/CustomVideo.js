import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';

const CustomVideo = ({src, type}) => {
  const videoRef = useRef(null);
  const flvPlayerRef = useRef(null);

  useEffect(() => {
    // Create video element.
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.autoplay = true;

    // Create an instance of the flv.js player.
    if (flvjs.isSupported()) {
      const flvPlayer = flvjs.createPlayer({
        type: type,
        url: src
      });
      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();

      flvPlayerRef.current = flvPlayer;
    }

    // Add the video element to the DOM
    videoRef.current.appendChild(videoElement);

    return () => {
      // Destroy the flv.js player instance
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      {/* Add a video element where the video needs to be displayed */}
      <div style={{width:"100%", height:"100%"}} ref={videoRef} />
    </div>
  );
};

export default CustomVideo;