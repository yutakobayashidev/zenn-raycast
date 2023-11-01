import { spawn } from "child_process";
import { getPreferenceValues, open } from "@raycast/api";
import { showToast, Toast } from "@raycast/api";
const { zennFolder } = getPreferenceValues();

export default async () => {
  const cmd = `/Users/yuta/.asdf/shims/npx`;

  // Arguments for the command
  const args = ["zenn", "preview"];

  // Options for the command
  const options = {
    cwd: zennFolder,
    env: {
      ...process.env,
      PATH: `/bin:/usr/bin:/Users/yuta/.asdf/shims:${process.env.PATH}`,
    },
  };

  const childProcess = spawn(cmd, args, options);

  // Listen to error events on the child process
  childProcess.on("error", async (error) => {
    await showToast({
      style: Toast.Style.Failure,
      title: error.message,
    });
    console.error(`Error spawning process: ${error}`);
  });

  childProcess.on("exit", (code) => {
    console.error(`Child process exited with code ${code}`);
  });

  childProcess.stdout.on("data", async (data) => {
    await showToast({ title: data });
    console.log(`stdout: ${data}`);
  });

  // Listen to data from the standard error
  childProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  // Delay for a few seconds to give the server time to start
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Now open the browser
  await open("http://localhost:8000");
};
