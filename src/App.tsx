import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";

import { Octokit } from "octokit";
import { format } from "date-fns";

function App() {
  const [token, setToken] = useState(import.meta.env.VITE_GITHUB_TOKEN);
  const [isGithubTokenValid, setIsGithubTokenValid] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  const octokitRef = useRef<Octokit | null>(null);

  useEffect(() => {
    octokitRef.current = new Octokit({
      auth: token,
    });
  }, [token]);

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];

    const base64File = await convertFileToBase64(file);

    setSelectedFile(base64File);

    console.log({ selectedFile: base64File });
  };

  const octokit = octokitRef.current;

  const convertFileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        if (typeof fileReader.result === "string") {
          resolve(fileReader.result.replace(/^data:.+;base64,/, "") as string);
        } else {
          reject("Unexpected result type");
        }
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // ! REMOVE
  const logTest = () => {
    console.log({ selectedFile });
  };
  // ! REMOVE

  const validateToken = async () => {
    const {
      data: { login },
    } = await octokit!.rest.users.getAuthenticated();
    setIsGithubTokenValid(login);
  };

  const createBranch = async (branchName: string) => {
    const {
      data: { object },
    } = await octokit!.rest.git.getRef({
      owner: "sergioadll",
      repo: "variable-exporting-test",
      ref: "heads/main",
    });
    const createRefResp = await octokit!.rest.git.createRef({
      owner: "sergioadll",
      repo: "variable-exporting-test",
      ref: `refs/heads/${branchName}`,
      sha: object.sha,
    });

    console.log({ createRefResp });
  };

  const addFile = async (branchName: string) => {
    const resp = await octokit!.request(
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

  const createPR = async (branchName: string) => {
    const createPRResp = await octokit!.request(
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
    if (!octokit) return;
    const branchName = `THEME-UPDATE_${format(
      new Date(),
      "dd-MM-yy:HH-mm-ss"
    )}`;
    try {
      // await validateToken();
      // await createBranch(branchName);
      // await addFile(branchName);
      // await createPR(branchName);
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div>
        <PasswordInput
          value={token}
          handleChange={(e) => setToken(e.target.value)}
        />
      </div>

      <h1>FILE STUFF</h1>
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

interface Props {
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = ({ value, handleChange }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={handleChange}
        className="w-full pr-10 pl-3 py-2 border rounded-lg"
      />
      <button
        onClick={toggleVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition ease-in-out duration-150"
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
};
