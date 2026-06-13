import { useThree } from "@react-three/fiber";
import { useCallback, useEffect } from "react";

const CaptureHelper = ({ onCaptureReady }: any) => {
  const { gl, scene, camera } = useThree();
  //   const captureRef: any = useRef(null);

  const takeScreenshot = useCallback(() => {
    gl.render(scene, camera);
    const canvas = gl.domElement;
    const dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }, [gl, scene, camera]);

  // Expose the capture function to parent component
  useEffect(() => {
    if (onCaptureReady) onCaptureReady(takeScreenshot);
  }, [takeScreenshot, onCaptureReady]);

  return null;
};

export default CaptureHelper;
