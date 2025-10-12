
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useTextToSpeech from '../../hooks/useTextToSpeech';

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
  const resumeButtonRef = useRef(null);
  const stopButtonRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
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
      utterance.onstart = () => {
        toast.success('🔊 Reading started', {
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
        setCurrentIndex(0);
      };
      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          setCurrentIndex(event.charIndex);
        }
      };
      synth.speak(utterance);
      utteranceRef.current = utterance;
    },
    [settings.tts, voices, synth]
  );

  const resumeFromIndex = useCallback(
    (newRate = settings.tts.rate, newVolume = settings.tts.volume) => {
      if (isPaused && utteranceRef.current) {
        synth.cancel();
        const text = window.getSelection().toString().trim() || getPageText();
        const remaining = text.slice(currentIndex);
        if (remaining) {
          const utterance = new SpeechSynthesisUtterance(remaining);
          const selectedVoice = voices.find((v) => v.name === settings.tts.voice);
          if (selectedVoice) utterance.voice = selectedVoice;
          utterance.rate = newRate;
          utterance.volume = newVolume;
          utterance.onstart = () => {
            toast.success('🔄 Reading resumed', {
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
          utterance.onend = () => {
            setIsPaused(false);
            setCurrentIndex(0);
          };
          utterance.onboundary = (event) => {
            if (event.name === 'word' || event.name === 'sentence') {
              setCurrentIndex(currentIndex + event.charIndex);
            }
          };
          synth.speak(utterance);
          utteranceRef.current = utterance;
        }
      }
    },
    [isPaused, currentIndex, settings.tts, voices, synth]
  );

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
    if (synth.paused && utteranceRef.current) {
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
      if (resumeButtonRef.current) {
        resumeButtonRef.current.focus();
      }
    }
  }, [synth]);

  const handleStop = useCallback(() => {
    if (synth.speaking || synth.paused) {
      synth.cancel();
      setIsPaused(false);
      setCurrentIndex(0);
      utteranceRef.current = null;
      toast.success('⏹ Reading stopped', {
        duration: TOAST_MS,
        position: 'top-center',
        style: {
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #15803d',
        },
      });
      if (stopButtonRef.current) {
        stopButtonRef.current.focus();
      }
    }
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
    setCurrentIndex(0);
    utteranceRef.current = null;
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
        } else if (synth.speaking) {
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
  }, [handleSpeak, handleReadHighlighted, handlePause, handleResume, handleStop, synth]);

  return (
    <>
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 z-50"
        aria-label={isOpen ? 'Close Accessibility Reader' : 'Open Accessibility Reader'}
      >
        {isOpen ? '✖' : '🗣️'}
      </button>
      {isOpen && (
        <div
          id="accessibility-reader"
          ref={panelRef}
          onMouseDown={onMouseDown}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            cursor: 'move',
          }}
          className="bg-gray-100 dark:bg-gray-800 shadow-lg rounded-lg p-4 w-80 sm:w-96 border z-50"
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
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
              value={settings.tts.voice}
              onChange={(e) =>
                setSettings({ ...settings, tts: { ...settings.tts, voice: e.target.value } })
              }
              aria-label="Select text-to-speech voice"
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
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 min-h-[44px] text-sm sm:text-base"
              aria-label="Speak page or highlighted text"
              disabled={speaking && !isPaused}
            >
              ▶ Speak
            </button>
            <button
              onClick={handleReadHighlighted}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 min-h-[44px] text-sm sm:text-base"
              aria-label="Read highlighted text"
              disabled={speaking && !isPaused}
            >
              📖 Read Highlighted
            </button>
            <button
              onClick={handlePause}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 min-h-[44px] text-sm sm:text-base"
              aria-label={isPaused ? 'Resume reading' : 'Pause reading'}
              aria-pressed={isPaused}
              disabled={!speaking || isPaused}
            >
              {isPaused ? '🔄 Resume' : '⏸ Pause'}
            </button>
            <button
              ref={resumeButtonRef}
              onClick={handleResume}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[44px] text-sm sm:text-base"
              aria-label="Resume reading"
              disabled={!isPaused}
            >
              🔄 Resume
            </button>
            <button
              ref={stopButtonRef}
              onClick={handleStop}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 min-h-[44px] text-sm sm:text-base"
              aria-label="Stop reading"
              disabled={!speaking && !isPaused}
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
                  if (isPaused) resumeFromIndex(newRate, settings.tts.volume);
                }}
                className="w-full accent-blue-600 dark:accent-blue-400"
                aria-label="Adjust text-to-speech speed"
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
                  if (isPaused) resumeFromIndex(settings.tts.rate, newVolume);
                }}
                className="w-full accent-blue-600 dark:accent-blue-400"
                aria-label="Adjust text-to-speech volume"
              />
            </label>
          </div>
          <div
            className="text-sm text-gray-600 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            Status: {speaking ? (isPaused ? 'Paused' : 'Speaking') : 'Idle'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Shortcuts: <br />
            <kbd>Alt+R</kbd> Speak page/highlight <br />
            <kbd>Alt+H</kbd> Read highlighted only <br />
            <kbd>Alt+P</kbd> Pause/Resume <br />
            <kbd>Alt+S</kbd> Stop
          </p>
        </div>
      )}
    </>
  );
};

export default AccessibilityReader;
