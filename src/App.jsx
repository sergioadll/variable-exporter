import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { Octokit } from "octokit";
import { format } from "date-fns";

// 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

const octokit = new Octokit({
  auth: "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",
});

function App() {
  const [isGithubTokenValid, setIsGithubTokenValid] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const handleFileInput = async (event) => {
    const file = event.target.files[0];

    const base64File = await convertFileToBase64(file);

    setSelectedFile(base64File);

    console.log({ selectedFile: base64File });
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result.replace(/^data:.+;base64,/, ""));
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const logTest = () => {
    console.log({ selectedFile });
  };

  const validateToken = async () => {
    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated();
    setIsGithubTokenValid(login);
  };

  const createBranch = async (branchName) => {
    const {
      data: { object },
    } = await octokit.rest.git.getRef({
      owner: "sergioadll",
      repo: "variable-exporting-test",
      ref: "heads/main",
    });
    const createRefResp = await octokit.rest.git.createRef({
      owner: "sergioadll",
      repo: "variable-exporting-test",
      ref: `refs/heads/${branchName}`,
      sha: object.sha,
    });

    console.log({ createRefResp });
  };

  const addFile = async (branchName) => {
    const resp = await octokit.request(
      "PUT /repos/sergioadll/variable-exporting-test/contents/TEST.json",
      {
        owner: "OWNER",
        repo: "REPO",
        path: "PATH",
        branch: branchName,
        message: "Update tailwind theme",
        content: selectedFile,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log({ resp });
  };

  const createPR = async (branchName) => {
    const createPRResp = await octokit.request(
      "POST /repos/sergioadll/variable-exporting-test/pulls",
      {
        owner: "sergioadll",
        repo: "variable-exporting-test",
        title: "Amazing new feature",
        body: "Please pull these awesome changes in!",
        head: branchName,
        base: "main",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log({ createPRResp });
  };

  const handleFileUpload = async () => {
    const branchName = `THEME-UPDATE_${format(
      new Date(),
      "dd-MM-yy:HH-mm-ss"
    )}`;
    try {
      await validateToken();
      await createBranch(branchName);
      await addFile(branchName);
      await createPR(branchName);
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card flex flex-col gap-3">
        <button onClick={validateToken} className="bg-blue-300">
          VALIDATE TOKEN {isGithubTokenValid}
        </button>

        <button
          className="text-3xl font-bold underline text-center bg-red-300"
          onClick={handleFileUpload}
        >
          UPLOAD FILE
        </button>

        <input type="file" onChange={handleFileInput} />
      </div>
      <button onClick={logTest} className="bg-blue-300">
        PUSH TO LOG
      </button>
    </>
  );
}

export default App;
