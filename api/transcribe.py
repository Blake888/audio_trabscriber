import sys
import os
import subprocess
import whisper
import logging

logging.basicConfig(level=logging.INFO)

def preprocess_audio(input_path, output_path):
    try:
        subprocess.run([
            'ffmpeg', '-i', input_path,
            '-ar', '16000',  # Set sample rate to 16kHz
            '-ac', '1',      # Set to mono
            '-c:a', 'pcm_s16le',  # Set codec to PCM 16-bit
            output_path
        ], check=True)
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Error in preprocessing audio: {e}")
        return False

def remove_silence_ffmpeg(input_path, output_path):
    try:
        subprocess.run([
            'ffmpeg', '-i', input_path,
            '-af', 'silenceremove=stop_threshold=-40dB:stop_duration=0.5:stop_periods=-1',
            output_path
        ], check=True)
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Error in removing silence: {e}")
        return False

def transcribe_audio(input_audio_path, output_text_path="transcription.txt"):
    try:
        # Preprocess audio
        preprocessed_path = input_audio_path + "_preprocessed.wav"
        if not preprocess_audio(input_audio_path, preprocessed_path):
            return None

        # Remove silence
        cleaned_path = input_audio_path + "_cleaned.wav"
        if not remove_silence_ffmpeg(preprocessed_path, cleaned_path):
            return None

        # Load Whisper model
        model = whisper.load_model("base")

        # Transcribe
        result = model.transcribe(cleaned_path, language="en")

        # Save transcription
        with open(output_text_path, "w") as f:
            f.write(result["text"])

        # Clean up temporary files
        os.remove(preprocessed_path)
        os.remove(cleaned_path)

        return result["text"]

    except Exception as e:
        logging.error(f"Error in transcription process: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <input_audio_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    transcription = transcribe_audio(input_path)

    if transcription:
        print(transcription)
    else:
        print("Transcription failed")

