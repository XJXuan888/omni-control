const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = 8080;

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
        .on('start', (commandLine) => {
            console.log('FFmpeg process started with command:', commandLine);
        })
        .on('error', (err) => {
            console.error('FFmpeg error:', err);
            res.end();
        })
        .on('end', () => {
            console.log('FFmpeg process finished');
            res.end();
        })
        .pipe(res, { end: true });

    // Handle client disconnection
    req.on('close', () => {
        console.log('Client disconnected');
        command.kill();
    });

    console.log('Streaming video...');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});