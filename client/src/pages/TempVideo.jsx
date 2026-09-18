import React from "react";
import "../styles/global.css"

const TempVideo = () => {
  return (
    <>
      <div className="video-main">
        <iframe
          src="https://hubstream.art/#mlxku3"
          title="Movie Player"
          allowFullScreen
          frameBorder="0"
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            border: "none",
          }}
        />
      </div>
    </>
  );
};

export default TempVideo;
