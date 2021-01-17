import { spawnSync } from "child_process";
import fs from "fs";

// ffprobe-static seems to be giving incaccurate results,
// it says duration of all files are a few milliseconds long.
// Use local ffprobe intsallation instead, for now.
// const ffprobe = require("ffprobe-static");

async function analyze(filePath: string) {
  var proc = spawnSync("ffprobe", [
    // "-v",
    // "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);
  if (proc.status != 0) {
    throw new Error(
      "Non-0 status returned by ffprobe. " + proc.stderr.toString()
    );
  }
  const ffp = JSON.parse(proc.stdout.toString());
  // return ffp;
  const stream = ffp.streams[0];
  const {
    codec_name: codecName,
    channels,
    channel_layout: channelLayout,
  } = stream;
  const { duration, size, bit_rate: bitrate, format_name: format } = ffp.format;

  if (!duration && format === "matroska,webm") {
    // Repackaging webm files sseems to write
    // duration and bitrate to the new file.
    const newFile = filePath + "-copy.webm";
    proc = spawnSync("ffmpeg", [
      "-i",
      filePath,
      "-vcodec",
      "copy",
      "-acodec",
      "copy",
      "-y",
      newFile,
    ]);
    const analysis = analyze(newFile);
    fs.unlinkSync(newFile);
    return analysis;
  }

  return {
    duration: parseFloat(duration).toFixed(2) + " sec",
    size: (parseFloat(size) / (1024 * 1024)).toFixed(2) + " MB",
    bitrate: Math.round(bitrate / 1000) + " kb/s",
    format,
    codecName,
    channels,
    channelLayout,
  };
}

export { analyze };
