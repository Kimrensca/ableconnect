import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import apiFetch from '../utils/api';

const useTextToSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [settings, setSettings] = useState({ tts: { voice: '', rate: 1, volume: 1 } });
  const [voices, setVoices] = useState([]);
  const isVoiceInitialized = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length && !isVoiceInitialized.current) {
        isVoiceInitialized.current = true;
        setSettings((prev) => ({
          ...prev,
          tts: { ...prev.tts, voice: availableVoices[0]?.name || '' },
        }));
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const fetchSettings = async () => {
      try {
        const data = await apiFetch('/settings');
        setSettings({ tts: data.tts || { voice: '', rate: 1, volume: 1 } });
      } catch (err) {
        console.error('Failed to load TTS settings:', err.message);
        // Use default settings on error
        setSettings({ tts: { voice: '', rate: 1, volume: 1 } });
      }
    };

    fetchSettings();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis) {
      toast.error('Your browser does not support Text-to-Speech', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#fef3f3',
          color: '#b91c1c',
          border: '1px solid #b91c1c',
        },
      });
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find((v) => v.name === settings.tts.voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = settings.tts.rate;
    utterance.volume = settings.tts.volume;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return { speak, speaking, settings, setSettings };
};

export default useTextToSpeech;