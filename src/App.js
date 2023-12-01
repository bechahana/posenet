import React, { useRef, useEffect } from "react";
import "./App.css";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import '@tensorflow/tfjs';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const runPosenet = async () => {
      const net = await posenet.load({
        inputResolution: { width: 640, height: 480 },
        scale: 0.8,
      });

      setInterval(() => {
        detect(net);
      }, 100);
    };

    const detect = async (net) => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        const pose = await net.estimateSinglePose(video);
        drawCanvas(pose, videoWidth, videoHeight);
      }
    };
    const drawCanvas = (pose, videoWidth, videoHeight) => {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    
      drawKeypoints(pose["keypoints"], 0.6, ctx);
      drawSkeleton(pose["keypoints"], 0.7, ctx);
    
      const keypointsContainer = document.getElementById("keypoints-container");
      keypointsContainer.innerHTML = "";
    
      const leftHip = pose.keypoints.find((kp) => kp.part === "leftHip");
      const rightHip = pose.keypoints.find((kp) => kp.part === "rightHip");
    
      if (leftHip && rightHip) {
        const sternumX = (leftHip.position.x + rightHip.position.x) / 2;
        const sternumY = (leftHip.position.y + rightHip.position.y) / 2;
    
        // Draw a line segment for the sternum bone
        const noseKeypoint = pose.keypoints.find((kp) => kp.part === "nose");
        if (noseKeypoint) {
          const noseX = noseKeypoint.position.x;
          const noseY = noseKeypoint.position.y;
    
          ctx.beginPath();
          ctx.moveTo(noseX, noseY);
          ctx.lineTo(sternumX, sternumY);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "white";
          ctx.stroke();
        }
    
        // Display sternum coordinates in the keypoints container
        const sternumDiv = document.createElement("div");
        sternumDiv.innerHTML = `Sternum: (${sternumX.toFixed(2)}, ${sternumY.toFixed(2)})`;
        sternumDiv.style.color = "white";
        keypointsContainer.appendChild(sternumDiv);
      }
    
      // Display other keypoints in the keypoints container
      for (let i = 0; i < pose.keypoints.length; i++) {
        const keypoint = pose.keypoints[i];
    
        if (keypoint.part === "leftHip" || keypoint.part === "rightHip") {
          continue;
        }
    
        const { y, x } = keypoint.position;
    
        const keypointDiv = document.createElement("div");
        keypointDiv.innerHTML = `${keypoint.part}: (${x.toFixed(2)}, ${y.toFixed(2)})`;
        keypointDiv.style.color = "white";
        keypointsContainer.appendChild(keypointDiv);
      }
    };
    
    runPosenet();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <div
          id="keypoints-container"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      </header>
    </div>
  );
}

export default App;
