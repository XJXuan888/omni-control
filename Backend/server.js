const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = 8080;

// keep track of any running FFmpeg commands
const ffmpegProcesses = new Set();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Route to handle the video stream
app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'video/mp2t',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
  });

  const command = ffmpeg()
    .input('tcp://0.0.0.0:1234')
    .videoCodec('libx264')
    .size('320x240')
    .fps(15)
    .outputOptions([
      '-preset ultrafast',
      '-tune zerolatency',
      '-b:v 500k',
    ])
    .format('mpegts')
    .on('start', (cmd) => {
      console.log('FFmpeg started:', cmd);
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err.message);
      res.end();
    })
    .on('end', () => {
      console.log('FFmpeg process finished');
      res.end();
    })
    .pipe(res, { end: true });

  // remember it so we can kill it on shutdown
  ffmpegProcesses.add(command);

  // when the client disconnects, kill only this ffmpeg
  req.on('close', () => {
    console.log('Client disconnected, killing ffmpeg.');
    command.kill('SIGKILL');
    ffmpegProcesses.delete(command);
  });

  console.log('Streaming video...');
});

// start Express and grab the returned http.Server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// ----- GRACEFUL SHUTDOWN HANDLERS -----

// stop accepting new connections, kill any ffmpeg, then exit
function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down…`);
  
  // stop HTTP server
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // kill any running ffmpeg pipelines
  for (const proc of ffmpegProcesses) {
    console.log('Killing ffmpeg process');
    proc.kill('SIGKILL');
  }
  
  // if still not exited after 10s, force it
  setTimeout(() => {
    console.error('Could not close cleanly, forcing exit.');
    process.exit(1);
  }, 10_000);
}

// catch Ctrl-C and docker stop, etc.
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
