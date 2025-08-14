import React, { useRef, useEffect, useState } from 'react';
import { Camera, RotateCcw, RefreshCw, AlertCircle, User } from 'lucide-react';

export const SelfieStep = ({
  capturedSelfie,
  onSelfieCapture,
  onNext,
  onBack,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  const setupVideoElement = (mediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = mediaStream;
    
    const handleLoadedMetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        video.play()
          .then(() => {
            setVideoReady(true);
            setLoading(false);
          })
          .catch(err => {
            console.error('Video play failed:', err);
            setError({ message: 'Failed to start video playback' });
            setLoading(false);
          });
      }
    };

    const handleCanPlay = () => {
      if (!videoReady) {
        setVideoReady(true);
        setLoading(false);
      }
    };

    const handleError = () => {
      setError({ message: 'Video loading failed' });
      setLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  };

  const enableCamera = async () => {
    setLoading(true);
    setError(null);
    setVideoReady(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!mediaStream) {
        throw new Error('No media stream received');
      }

      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('No video tracks available');
      }

      setCameraEnabled(true);
      setStream(mediaStream);

    } catch (err) {
      console.error('Camera error:', err);
      setLoading(false);
      
      let message = 'Camera access failed. ';
      if (err.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        message = 'Camera is being used by another application.';
      } else {
        message += err.message || 'Unknown error occurred.';
      }
      
      setError({ message });
    }
  };

  useEffect(() => {
    if (stream && videoRef.current && cameraEnabled) {
      return setupVideoElement(stream);
    }
  }, [stream, cameraEnabled, setupVideoElement]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraEnabled(false);
    setVideoReady(false);
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (cameraEnabled) {
      stopCamera();
      setTimeout(() => {
        enableCamera();
      }, 100);
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError({ message: 'Camera not ready' });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setError({ message: 'Canvas not supported' });
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (facingMode === 'user') {
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
      context.restore();
    } else {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    }

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    onSelfieCapture(imageData);
    stopCamera();
  };

  const retakeSelfie = () => {
    onSelfieCapture('');
    setError(null);
    enableCamera();
  };

  if (capturedSelfie) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Selfie Captured!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Review your photo and continue or retake if needed
          </p>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1 rounded-2xl">
            <img
              src={capturedSelfie}
              alt="Captured selfie"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <button
            onClick={retakeSelfie}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-yellow-500 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Photo
          </button>
        </div>

        <div className="flex justify-between pt-8">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Continue to Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Take a Selfie</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Position your face within the frame and capture a clear photo
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-red-800">Camera Error</div>
              <div className="text-red-700 mt-1 text-sm">{error.message}</div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-600 font-medium">Starting camera...</div>
        </div>
      )}

      {!cameraEnabled && !loading && (
        <div className="text-center py-12">
          <Camera className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <div className="text-gray-600 mb-6 font-medium">Camera access required to take your selfie</div>
          <button
            onClick={enableCamera}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Enable Camera
          </button>
        </div>
      )}

      {cameraEnabled && (
        <div className="space-y-6">
          <div className="relative max-w-sm mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              className={`w-full h-80 object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 border-2 border-white/70 rounded-full"></div>
            </div>
            
            {!videoReady && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white font-medium">Starting video...</div>
              </div>
            )}
          </div>

          <div className="text-center text-gray-600 font-medium">
            Keep your face centered and well-lit
          </div>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              onClick={captureSelfie}
              disabled={!videoReady}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                videoReady 
                  ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
            
            <button
              onClick={switchCamera}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <RefreshCw className="w-5 h-5" />
              Switch Camera ({facingMode === 'user' ? 'Front' : 'Back'})
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-blue-800 mb-1">Selfie Tips</div>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Look directly at the camera</li>
                  <li>• Ensure good lighting on your face</li>
                  <li>• Remove sunglasses or hats</li>
                  <li>• Keep a neutral expression</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-8">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};
