import { exec, spawn } from "child_process";

export function execute(loc, cmd, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(
      cmd,
      args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))),
    );

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
      reject(stderr);
    });

    process.on("close", (code) => {
      resolve({
        statusCode: code,
        data: JSON.parse(stdout),
        stderr: stderr,
      });
    });
  });
}

export async function runTestCases(loc, cmd, testCases) {
    const results = await Promise.all(
        testCases.map(async (testCase) => {
            const result = await execute(loc, cmd, [...testCase.input]);
            if (result.statusCode !== 0 && result.stderr !== "") return {
                status: 500,
                message: "code failed due to error",
                error: result.stderr
            } 

            if (JSON.stringify(result.data.output) != JSON.stringify(testCase.expected)) {
                return {
                    status: 400,
                    message: 'Test case failed, wrong answer'
                }
            }

            return {
                status: 200,
                message: "ok"
            }
        })
    )

    return results;
}
