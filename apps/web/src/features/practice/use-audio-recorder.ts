import { useCallback, useRef, useState } from "react";

type RecorderStatus = "idle" | "recording" | "recorded";

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: recorder.mimeType }));
      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setStatus("recording");
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setStatus("recorded");
  }, []);

  const reset = useCallback(() => {
    setBlob(null);
    setStatus("idle");
  }, []);

  return { status, blob, start, stop, reset };
}
