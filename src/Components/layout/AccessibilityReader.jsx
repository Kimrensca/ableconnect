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
        toast.error('No text available to read.', {
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
      if (synth.speaking) synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.name === settings.tts.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = settings.tts.rate;
      utterance.volume = settings.tts.volume;
      utterance.onstart = () =>
        toast.success('🔊 Reading started', {
          duration: TOAST_MS,
          position: 'top-center',
          style: {
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #15803d',
          },
        });
      utterance.onend = () => {
        toast.success('✅ Reading finished', {
          duration: TOAST_MS,
          position: 'top-center',
          style: {
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #15803d',
          },
        });
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
    if (text && synth.speaking) {
      synth.cancel();
      const remaining = text.slice(currentIndex);
      speak(remaining);
    }
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
    fixed bottom-6 right-6 sm:bottom-4 sm:right-4
    bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700
    text-lg z-50
  "
  aria-label="Toggle Accessibility Reader"
>
  {isOpen ? '✖' : '🗣️'}
</button>

      {isOpen && (
  <div
    id="accessibility-reader"
    ref={panelRef}
    onMouseDown={(e) => window.innerWidth > 768 && onMouseDown(e)} // disable drag on small screens
    style={
      window.innerWidth > 768
        ? { position: 'fixed', bottom: '80px', right: '24px', cursor: 'move' }
        : {}
    }
    className={`
      fixed z-50 border p-4 shadow-lg rounded-lg
      bg-gray-100 dark:bg-gray-800
      transition-all duration-300 ease-in-out
      ${window.innerWidth > 768
        ? 'w-80 h-auto'
        : 'bottom-0 left-0 right-0 w-full h-[70vh] rounded-t-2xl overflow-y-auto'}
    `}
    role="region"
    aria-label="Accessibility reader controls"
  >

          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Accessibility Reader</h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100" htmlFor="tts-voice">
              Voice
            </label>
            <select
              id="tts-voice"
              className="w-full border rounded p-1 mb-3 dark:bg-gray-700 dark:text-white"
              value={settings.tts.voice}
              onChange={(e) =>
                setSettings({ ...settings, tts: { ...settings.tts, voice: e.target.value } })
              }
              aria-label="Select TTS voice"
            >
              {voices.map((v, idx) => (
                <option key={idx} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={handleSpeak}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              aria-label="Speak page or highlighted text"
            >
              ▶ Speak
            </button>
            <button
              onClick={handleReadHighlighted}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              aria-label="Read highlighted text"
            >
              📖 Read Highlighted
            </button>
            <button
              onClick={handlePause}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              aria-label="Pause reading"
            >
              ⏸ Pause
            </button>
            <button
              onClick={handleResume}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              aria-label="Resume reading"
            >
              🔄 Resume
            </button>
            <button
              onClick={handleStop}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              aria-label="Stop reading"
            >
              ⏹ Stop
            </button>
          </div>
          <div className="space-y-2 mb-3">
            <label className="block text-sm text-gray-900 dark:text-gray-100">
              Speed: {settings.tts.rate.toFixed(1)}
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.tts.rate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value);
                  setSettings({ ...settings, tts: { ...settings.tts, rate: newRate } });
                  resumeFromIndex(newRate, settings.tts.volume);
                }}
                className="w-full"
                aria-label="Adjust TTS speed"
              />
            </label>
            <label className="block text-sm text-gray-900 dark:text-gray-100">
              Volume: {Math.round(settings.tts.volume * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.tts.volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setSettings({ ...settings, tts: { ...settings.tts, volume: newVolume } });
                  resumeFromIndex(settings.tts.rate, newVolume);
                }}
                className="w-full"
                aria-label="Adjust TTS volume"
              />
            </label>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Status: {speaking ? (isPaused ? 'Paused' : 'Speaking') : 'Idle'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Shortcuts: <br />
            <strong>Alt+R</strong> Speak page/highlight <br />
            <strong>Alt+H</strong> Read highlighted only <br />
            <strong>Alt+P</strong> Pause/Resume <br />
            <strong>Alt+S</strong> Stop
          </p>
        </div>
      )}
    </>
  );
};

export default AccessibilityReader;