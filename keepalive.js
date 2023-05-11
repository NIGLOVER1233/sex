const { spawn } = require('child_process');

function runScript() {
  const script = spawn('node', ['bot.js']);

  script.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  script.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  script.on('error', (err) => {
    console.error(`Failed to start script: ${err}`);
    runScript();
  });

  script.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Script exited with code ${code}`);
      runScript();
    }
  });
}

runScript();
