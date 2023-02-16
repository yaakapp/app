import {useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import "./App.css";
import Editor from "./Editor";

interface Response {
    body: string;
    status: string;
    elapsed: number;
    elapsed2: number;
}

function App() {
    const [responseBody, setResponseBody] = useState<Response | null>(null);
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    async function sendRequest() {
        setLoading(true);
        const body = await invoke("send_request", {url: url}) as Response;
        setResponseBody(body);
        setLoading(false);
    }

    return (
        <div className="container">
            <h1>Welcome, Friend!</h1>
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
                <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
            </form>
            {responseBody !== null && (
                <>
                    <div style={{paddingTop: "2rem"}}>
                        {responseBody?.status}
                        &nbsp;&bull;&nbsp;
                        {responseBody?.elapsed}ms
                        &nbsp;&bull;&nbsp;
                        {responseBody?.elapsed2}ms
                    </div>
                    <div className="row">
                        <Editor value={responseBody?.body}/>
                        <div className="iframe-wrapper">
                            <iframe srcDoc={responseBody.body}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
