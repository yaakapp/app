import {useState} from "react";
import reactLogo from "./assets/react.svg";
import {invoke} from "@tauri-apps/api/tauri";
import "./App.css";
import Editor from "./Editor";

function App() {
    const [responseBody, setResponseBody] = useState<string>("");
    const [url, setUrl] = useState("");

    async function sendRequest() {
        const body = await invoke("send_request", {url: url}) as string;
        setResponseBody(body);
    }

    return (
        <div className="container">
            <h1>Welcome to Twosomnia!</h1>

            <div className="row">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendRequest();
                    }}
                >
                    <input
                        id="greet-input"
                        onChange={(e) => setUrl(e.currentTarget.value)}
                        placeholder="Enter a URL..."
                    />
                    <button type="submit">Send</button>
                    <Editor value={responseBody}/>
                </form>
            </div>
        </div>
    );
}

export default App;
