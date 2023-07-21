import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';

const CustomVideo = ({src, type}) => {
  const videoRef = useRef(null);
  const flvPlayerRef = useRef(null);

  useEffect(() => {
    // 创建video元素
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.autoplay = true;

    // 创建flv.js播放器实例
    if (flvjs.isSupported()) {
      const flvPlayer = flvjs.createPlayer({
        type: type,
        url: src
      });
      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();

      flvPlayerRef.current = flvPlayer;
    }

    // 将video元素添加到DOM中
    videoRef.current.appendChild(videoElement);

    return () => {
      // 销毁flv.js播放器实例
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      {/* 在需要显示视频的地方添加video元素 */}
      <div style={{width:"100%", height:"100%"}} ref={videoRef} />
    </div>
  );
};

export default CustomVideo;