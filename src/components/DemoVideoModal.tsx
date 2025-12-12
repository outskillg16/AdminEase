import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {
          setVideoError(true);
        });
      }, 300);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
      setVideoError(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleSpaceKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && isOpen && videoRef.current) {
        e.preventDefault();
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    };

    const handleFKey = (e: KeyboardEvent) => {
      if (e.key === 'f' && isOpen && videoRef.current) {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          videoRef.current.requestFullscreen();
        }
      }
    };

    const handleMKey = (e: KeyboardEvent) => {
      if (e.key === 'm' && isOpen && videoRef.current) {
        e.preventDefault();
        videoRef.current.muted = !videoRef.current.muted;
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleSpaceKey);
    document.addEventListener('keydown', handleFKey);
    document.addEventListener('keydown', handleMKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', handleSpaceKey);
      document.removeEventListener('keydown', handleFKey);
      document.removeEventListener('keydown', handleMKey);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-6xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-full p-2"
            aria-label="Close video modal"
          >
            <X size={32} />
          </button>

          {videoError ? (
            <div className="bg-gray-900 rounded-lg p-12 text-center text-white">
              <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
              <h3 className="text-xl font-bold mb-2">Demo Video Coming Soon</h3>
              <p className="mb-6 text-gray-300">
                We're creating an amazing demo video to showcase AdminEase's features.
                In the meantime, feel free to explore the platform by signing up!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="relative bg-black rounded-lg shadow-2xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                controls
                controlsList="nodownload"
                playsInline
                poster="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200"
                onError={() => setVideoError(true)}
              >
                <source
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  type="video/mp4"
                />
                <track
                  kind="captions"
                  srcLang="en"
                  label="English"
                />
                Your browser does not support the video tag.
              </video>

              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                <p className="font-semibold">Keyboard Shortcuts:</p>
                <p className="text-xs text-gray-300">Space: Play/Pause • F: Fullscreen • M: Mute • ESC: Close</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
