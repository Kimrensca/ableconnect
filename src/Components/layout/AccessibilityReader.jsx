import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import  useTextToSpeech  from '../../hooks/useTextToSpeech';

const TOAST_MS = 1700;

const AccessibilityReader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { speak: speakHook, settings, setSettings, speaking } = useTextToSpeech();
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [, setIsAdjusting] = useState(false);
  const isAdjustingRef = useRef(false); // synchronous flag to avoid race conditions
  const location = useLocation();
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const panelRef = useRef(null);
  const dragData = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    setVoices(synth.getVoices());
    synth.onvoiceschanged = () => setVoices(synth.getVoices());
    return () => {
      synth.onvoiceschanged = null;
    };
  }, [synth]);

  const getPageText = () => {
    const readerPanel = document.getElementById('accessibility-reader');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (readerPanel && readerPanel.contains(node.parentElement)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );
    let text = '';
    while (walker.nextNode()) {
      text += walker.currentNode.textContent + ' ';
    }
    return text.trim();
  };

  const speak = useCallback(
    (text) => {
      if (!text) {
        toast.error('No text available to read.');
        return;
      }
  
      // Cancel any ongoing speech
      if (synth.speaking || synth.pending || synth.paused) {
        synth.cancel();
      }
  
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.name === settings.tts.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = settings.tts.rate;
      utterance.volume = settings.tts.volume;
  
      utterance.onstart = () => {
        // clear both state and ref when real speech starts
        setIsAdjusting(false);
        isAdjustingRef.current = false;
        toast.success('Reading started', { duration: TOAST_MS });
      };
  
      utterance.onend = () => {
        toast.success('Reading finished', { duration: TOAST_MS });
        setIsPaused(false);
        setCurrentIndex(0);
      };
  
      utterance.onerror = (event) => {
        // Only ignore "interrupted" if we were intentionally adjusting.
        // Use the ref for a synchronous check to avoid race with setState.
        if (event.error === 'interrupted' && isAdjustingRef.current) {
          setIsAdjusting(false);
          isAdjustingRef.current = false;
          return;
        }
        toast.error(`Reading error: ${event.error}`);
        setIsPaused(false);
      };
  
      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          setCurrentIndex(event.charIndex);
        }
      };
  
      synth.speak(utterance);
      utteranceRef.current = utterance;
      setIsPaused(false);
    },
    [settings.tts, voices, synth]
  );

  const resumeFromIndex = (newRate = settings.tts.rate, newVolume = settings.tts.volume) => {
    const text = window.getSelection().toString().trim() || getPageText();
    if (!text || (!synth.speaking && !synth.paused)) return;
  
    // Mark that we’re intentionally cancelling for adjustment (set both state + ref)
    setIsAdjusting(true);
    isAdjustingRef.current = true;
    synth.cancel();
  
    // Tiny delay ensures the cancel completes before new speak()
    setTimeout(() => {
      const remaining = text.slice(currentIndex);
      // update settings if provided (caller usually already setSettings)
      // Speak remaining text using updated settings
      speak(remaining);
      // Do NOT clear isAdjusting here — utterance.onstart will clear it when real speech begins
    }, 100);
  };

  const handleSpeak = useCallback(() => {
    const text = window.getSelection().toString().trim() || getPageText();
    speak(text);
    speakHook(text);
  }, [speak, speakHook]);

  const handleReadHighlighted = useCallback(() => {
    const text = window.getSelection().toString().trim();
    if (!text) {
      toast.error('Please highlight some text first!', {
        duration: TOAST_MS,
        position: 'top-center',
        style: {
          background: '#fef3f3',
          color: '#b91c1c',
          border: '1px solid #b91c1c',
        },
      });
      return;
    }
    speak(text);
    speakHook(text);
  }, [speak, speakHook]);

  const handlePause = useCallback(() => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      toast.success('⏸ Reading paused', {
        duration: TOAST_MS,
        position: 'top-center',
        style: {
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #15803d',
        },
      });
    }
  }, [synth]);

  const handleResume = useCallback(() => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
      toast.success('🔄 Reading resumed', {
        duration: TOAST_MS,
        position: 'top-center',
        style: {
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #15803d',
        },
      });
    }
  }, [synth]);

  const handleStop = useCallback(() => {
    synth.cancel();
    setIsPaused(false);
    toast.success('⏹ Reading stopped', {
      duration: TOAST_MS,
      position: 'top-center',
      style: {
        background: '#f0fdf4',
        color: '#15803d',
        border: '1px solid #15803d',
      },
    });
  }, [synth]);

  const onMouseDown = (e) => {
    if (!panelRef.current) return;
    dragData.current.dragging = true;
    dragData.current.offsetX = e.clientX - panelRef.current.getBoundingClientRect().left;
    dragData.current.offsetY = e.clientY - panelRef.current.getBoundingClientRect().top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragData.current.dragging) return;
    panelRef.current.style.left = `${e.clientX - dragData.current.offsetX}px`;
    panelRef.current.style.top = `${e.clientY - dragData.current.offsetY}px`;
  };

  const onMouseUp = useCallback(() => {
    dragData.current.dragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseUp]);

  useEffect(() => {
    synth.cancel();
    setIsPaused(false);
  }, [location.pathname, synth]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.altKey && e.code === 'KeyR') {
        e.preventDefault();
        handleSpeak();
      }
      if (e.altKey && e.code === 'KeyH') {
        e.preventDefault();
        handleReadHighlighted();
      }
      if (e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        if (synth.paused) {
          handleResume();
        } else {
          handlePause();
        }
      }
      if (e.altKey && e.code === 'KeyS') {
        e.preventDefault();
        handleStop();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSpeak, handleReadHighlighted, handlePause, handleResume, handleStop, synth.paused]);

  return (
    <>
      <button
  onClick={() => setIsOpen((s) => !s)}
  className="
    fixed bottom-5 right-5 
    bg-blue-600 hover:bg-blue-700 text-white 
    w-12 h-12 rounded-full shadow-xl 
    flex items-center justify-center 
    text-2xl font-bold 
    transition-all duration-200 
    active:scale-95 
    z-50
  "
  aria-label="Toggle Accessibility Reader"
>
  {isOpen ? '✖' : '🗣️'}
</button>

{isOpen && (
  <>
    {/* Optional subtle backdrop (click outside to close) */}
    <div 
      className="fixed inset-0 z-40" 
      onClick={() => setIsOpen(false)}
    />

    {/* Floating Draggable + Scrollable Panel */}
    <div
      id="accessibility-reader"
      ref={panelRef}
      className="fixed z-50 w-11/12 max-w-sm sm:w-96 
                 bottom-20 right-4 sm:bottom-24 sm:right-6
                 bg-white dark:bg-gray-800 
                 border-2 border-blue-600 dark:border-blue-500
                 rounded-2xl shadow-2xl
                 flex flex-col
                 max-h-[80vh]               /* ← Limits total height */
                 transition-all duration-300 select-none"
      style={{ touchAction: 'none' }}
      // Draggable on mouse + touch
      onMouseDown={onMouseDown}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        dragData.current.dragging = true;
        dragData.current.offsetX = touch.clientX - panelRef.current.getBoundingClientRect().left;
        dragData.current.offsetY = touch.clientY - panelRef.current.getBoundingClientRect().top;
      }}
    >
      {/* Header — grab handle */}
      <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 flex items-center justify-between cursor-move flex-shrink-0">
        <h3 className="text-lg font-bold">Accessibility Reader</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-full transition"
          aria-label="Close reader"
        >
          Close
        </button>
      </div>

      {/* Scrollable Body — this is the magic part */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Voice
          </label>
          <select
            className="w-full border rounded p-2 mb-4 dark:bg-gray-700 dark:text-white"
            value={settings.tts.voice}
            onChange={(e) => setSettings({ ...settings, tts: { ...settings.tts, voice: e.target.value } })}
          >
            {voices.map((v, idx) => (
              <option key={idx} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <button onClick={handleSpeak} className="flex-1 min-w-[110px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Speak
          </button>
          <button onClick={handleReadHighlighted} className="flex-1 min-w-[110px] px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Read Highlighted
          </button>
          <button onClick={handlePause} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Pause
          </button>
          <button onClick={handleResume} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Resume
          </button>
          <button onClick={handleStop} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Stop
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Speed: {settings.tts.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5" max="2" step="0.1"
              value={settings.tts.rate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setSettings({ ...settings, tts: { ...settings.tts, rate: newRate } });
                resumeFromIndex(newRate, settings.tts.volume);
              }}
              className="w-full h-3 rounded-lg accent-blue-600 mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Volume: {Math.round(settings.tts.volume * 100)}%
            </label>
            <input
              type="range"
              min="0" max="1" step="0.1"
              value={settings.tts.volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setSettings({ ...settings, tts: { ...settings.tts, volume: newVolume } });
                resumeFromIndex(settings.tts.rate, newVolume);
              }}
              className="w-full h-3 rounded-lg accent-blue-600 mt-2"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Status:</strong> {speaking ? (isPaused ? 'Paused' : 'Speaking') : 'Ready'}</p>
          <p className="mt-3 leading-relaxed">
            <strong>Shortcuts:</strong><br />
            Alt+R → Speak page/highlight<br />
            Alt+H → Read highlighted only<br />
            Alt+P → Pause/Resume<br />
            Alt+S → Stop
          </p>
        </div>
      </div>
      {/* End of scrollable body */}
    </div>
  </>
)}
    </>
  );
};

export default AccessibilityReader;