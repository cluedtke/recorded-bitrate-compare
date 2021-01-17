const btnStartMediaRecorder = document.getElementById(
  "btn-start-mediarecorder"
);
const btnStopMediaRecorder = document.getElementById("btn-stop-mediarecorder");
const btnStartRecordRTC = document.getElementById("btn-start-recordrtc");
const btnStopRecordRTC = document.getElementById("btn-stop-recordrtc");

const stopwatch = new Stopwatch(document.querySelector("time"));
var recorder;

// MediaRecorder
// ---
btnStartMediaRecorder.onclick = function () {
  var chunks = [];

  getAudioStream((stream) => {
    ui.toggleRecording(true);
    btnStopMediaRecorder.classList.remove("disabled");

    recorder = new MediaRecorder(stream, {
      audioBitsPerSecond: 128_000, // 96_000 | 128_000
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      var blob = new Blob(chunks, { type: chunks[0].type });
      var url = URL.createObjectURL(blob);

      var audioElement = document.querySelector("audio");
      audioElement.src = url;
      audioElement.controls = true;

      // download(url);
      await analyze(blob);
      ui.toggleRecording(false);
    };

    recorder.start();
    stopwatch.start();
  });
};

btnStopMediaRecorder.onclick = function () {
  recorder.stop();
  stopwatch.stop();
};

// RecordRTC
// ---
btnStartRecordRTC.onclick = function () {
  getAudioStream((stream) => {
    ui.toggleRecording(true);
    btnStopRecordRTC.classList.remove("disabled");

    recorder = new RecordRTC(stream, {
      recorderType: RecordRTC.MediaStreamRecorder,
      disableLogs: true,

      //
      // Optimal Settings
      //
      // Mac + Chrome
      // ---
      // No further configuration. Creates webm file with very low bit rate (~31kbps).
      // Honors "audioBitsPerSecond" config, which generates a larger file, in this case.
      //
      // Mac + Safari
      // ---
      mimeType: "audio/mp4",
      audioBitsPerSecond: 128_000, // 96_000 | 128_000
      // ^^ only honors "audioBitsPerSecond" when "mimeType" is also provided.
      // audio/mp4 + 128K seems to produced the smalles file.
    });

    recorder.startRecording();
    stopwatch.start();
  });
};

btnStopRecordRTC.onclick = function () {
  recorder.stopRecording(async () => {
    const blob = await recorder.getBlob();
    const url = URL.createObjectURL(blob);

    var audioElement = document.querySelector("audio");
    audioElement.src = url;
    audioElement.controls = true;

    // download(url);
    analyze(blob);
    ui.toggleRecording(false);
  });
  stopwatch.stop();
};

// Helpers
// ---
function getAudioStream(callback) {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then(callback);
}

function download(url) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "test";
  a.click();
  // window.URL.revokeObjectURL(url);
}

async function analyze(blob) {
  var formData = new FormData();
  formData.append("file", blob);
  const analysis = JSON.parse(await xhr("POST", "/analyze", formData));
  analysis.recorder = recorder.constructor.name;
  var pre = document.createElement("pre");
  pre.innerHTML = JSON.stringify(analysis, null, 2);
  document.body.appendChild(pre);
}

// UI
// ---
const ui = {
  toggleRecording(isRecording) {
    if (isRecording) {
      btnStartMediaRecorder.classList.add("disabled");
      btnStartRecordRTC.classList.add("disabled");
      btnStopRecordRTC.classList.add("disabled");
      btnStopMediaRecorder.classList.add("disabled");
      document.getElementById("ico-recording").style = "display: inline;";
    } else {
      btnStartMediaRecorder.classList.remove("disabled");
      btnStartRecordRTC.classList.remove("disabled");
      btnStopRecordRTC.classList.add("disabled");
      btnStopMediaRecorder.classList.add("disabled");
      document.getElementById("ico-recording").style = "display: none;"
    }
  },
};
