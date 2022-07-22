// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Channel {
    name;
    callback;
    constructor(name, cb){
        this.callback = cb;
        this.name = name;
    }
}
class Client {
    id;
    uuid = "";
    socket;
    constructor(id, socket){
        this.id = id;
        this.socket = socket;
    }
    send(message) {
        this.socket.send(message);
    }
}
function delay(ms, options = {}) {
    const { signal  } = options;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve, reject)=>{
        const abort = ()=>{
            clearTimeout(i);
            reject(new DOMException("Delay was aborted.", "AbortError"));
        };
        const done = ()=>{
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, {
            once: true
        });
    });
}
const ERROR_SERVER_CLOSED = "Server closed";
const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
const MAX_ACCEPT_BACKOFF_DELAY = 1000;
class Server {
    #port;
    #host;
    #handler;
    #closed = false;
    #listeners = new Set();
    #httpConnections = new Set();
    #onError;
    constructor(serverInit){
        this.#port = serverInit.port;
        this.#host = serverInit.hostname;
        this.#handler = serverInit.handler;
        this.#onError = serverInit.onError ?? function(error) {
            console.error(error);
            return new Response("Internal Server Error", {
                status: 500
            });
        };
    }
    async serve(listener) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#trackListener(listener);
        try {
            return await this.#accept(listener);
        } finally{
            this.#untrackListener(listener);
            try {
                listener.close();
            } catch  {}
        }
    }
    async listenAndServe() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listen({
            port: this.#port ?? 80,
            hostname: this.#host ?? "0.0.0.0",
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    async listenAndServeTls(certFile, keyFile) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listenTls({
            port: this.#port ?? 443,
            hostname: this.#host ?? "0.0.0.0",
            certFile,
            keyFile,
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    close() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#closed = true;
        for (const listener of this.#listeners){
            try {
                listener.close();
            } catch  {}
        }
        this.#listeners.clear();
        for (const httpConn of this.#httpConnections){
            this.#closeHttpConn(httpConn);
        }
        this.#httpConnections.clear();
    }
    get closed() {
        return this.#closed;
    }
    get addrs() {
        return Array.from(this.#listeners).map((listener)=>listener.addr);
    }
    async #respond(requestEvent, httpConn, connInfo) {
        let response;
        try {
            response = await this.#handler(requestEvent.request, connInfo);
        } catch (error) {
            response = await this.#onError(error);
        }
        try {
            await requestEvent.respondWith(response);
        } catch  {
            return this.#closeHttpConn(httpConn);
        }
    }
    async #serveHttp(httpConn1, connInfo1) {
        while(!this.#closed){
            let requestEvent;
            try {
                requestEvent = await httpConn1.nextRequest();
            } catch  {
                break;
            }
            if (requestEvent === null) {
                break;
            }
            this.#respond(requestEvent, httpConn1, connInfo1);
        }
        this.#closeHttpConn(httpConn1);
    }
    async #accept(listener) {
        let acceptBackoffDelay;
        while(!this.#closed){
            let conn;
            try {
                conn = await listener.accept();
            } catch (error) {
                if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }
                    if (acceptBackoffDelay >= 1000) {
                        acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
                    }
                    await delay(acceptBackoffDelay);
                    continue;
                }
                throw error;
            }
            acceptBackoffDelay = undefined;
            let httpConn;
            try {
                httpConn = Deno.serveHttp(conn);
            } catch  {
                continue;
            }
            this.#trackHttpConnection(httpConn);
            const connInfo = {
                localAddr: conn.localAddr,
                remoteAddr: conn.remoteAddr
            };
            this.#serveHttp(httpConn, connInfo);
        }
    }
     #closeHttpConn(httpConn2) {
        this.#untrackHttpConnection(httpConn2);
        try {
            httpConn2.close();
        } catch  {}
    }
     #trackListener(listener1) {
        this.#listeners.add(listener1);
    }
     #untrackListener(listener2) {
        this.#listeners.delete(listener2);
    }
     #trackHttpConnection(httpConn3) {
        this.#httpConnections.add(httpConn3);
    }
     #untrackHttpConnection(httpConn4) {
        this.#httpConnections.delete(httpConn4);
    }
}
class Server1 {
    #options;
    channels = new Map();
    clients = new Map();
    #server;
    #serverPromise;
    constructor(options){
        this.#options = options;
    }
    get address() {
        return `${this.#options.protocol}://${this.#options.hostname}:${this.#options.port}`;
    }
    broadcast(channelName, message, id) {
        for (const clientId of this.clients.keys()){
            if (clientId !== id) {
                this.#send(clientId, channelName, message);
            }
        }
    }
    to(channelName, message, onlySendTo) {
        if (onlySendTo !== undefined) {
            const id = onlySendTo;
            this.#send(id, channelName, message);
            return;
        }
        for (const clientId of this.clients.keys()){
            this.#send(clientId, channelName, message);
        }
    }
    on(channelName, cb) {
        const channel = new Channel(channelName, cb);
        this.channels.set(channelName, channel);
    }
    run() {
        this.#server = new Server({
            hostname: this.#options.hostname,
            port: this.#options.port,
            handler: this.#getHandler()
        });
        if (this.#options.protocol === "ws") {
            this.#serverPromise = this.#server.listenAndServe();
        }
        if (this.#options.protocol === "wss") {
            this.#serverPromise = this.#server.listenAndServeTls(this.#options.certFile, this.#options.keyFile);
        }
    }
    async close() {
        try {
            this.#server.close();
            await this.#serverPromise;
        } catch (_e) {}
    }
     #getHandler() {
        const clients = this.clients;
        const channels = this.channels;
        const options = this.#options;
        return async function(r) {
            const url = new URL(r.url);
            const { pathname  } = url;
            if (options.path && options.path !== pathname) {
                return new Response("The client has not specified the correct path that the server is listening on.", {
                    status: 406
                });
            }
            const { socket , response  } = Deno.upgradeWebSocket(r);
            let id = 1;
            while(true){
                if (clients.get(id)) {
                    id++;
                    continue;
                }
                break;
            }
            const client = new Client(id, socket);
            clients.set(id, client);
            socket.onopen = ()=>{
                const channel = channels.get("connect");
                const connectEvent = new CustomEvent("connect", {
                    detail: {
                        id: client.id,
                        queryParams: url.searchParams
                    }
                });
                if (channel) channel.callback(connectEvent);
            };
            socket.onmessage = (message)=>{
                try {
                    if ("data" in message && typeof message.data === "string") {
                        const json = JSON.parse(message.data);
                        const channel = channels.get(json.channel);
                        if (!channel) {
                            socket.send(`The channel "${json.channel}" doesn't exist as the server hasn't created a listener for it`);
                            return;
                        }
                        const customEvent = new CustomEvent(channel.name, {
                            detail: {
                                packet: json.message,
                                id: client.id
                            }
                        });
                        const callback = channel.callback;
                        callback(customEvent);
                    }
                } catch (error) {
                    socket.send(error.message);
                }
            };
            socket.onclose = (ev)=>{
                clients.delete(client.id);
                const { code , reason  } = ev;
                const disconnectEvent = new CustomEvent("disconnect", {
                    detail: {
                        id: client.id,
                        code,
                        reason
                    }
                });
                const disconnectHandler = channels.get("disconnect");
                if (disconnectHandler) {
                    disconnectHandler.callback(disconnectEvent);
                }
            };
            return response;
        };
    }
     #send(clientId, channelName, message) {
        const client = this.clients.get(clientId);
        client.socket.send(JSON.stringify({
            channel: channelName,
            message: message
        }));
    }
}
class WebSocketClient extends WebSocket {
    #handlers = new Map();
    constructor(url){
        super(url);
        this.onmessage = (e)=>{
            try {
                const packet = JSON.parse(e.data);
                const { channel , message: message1  } = packet;
                const handler = this.#handlers.get(channel);
                if (handler) {
                    handler(message1);
                }
            } catch (err) {
                if (err instanceof SyntaxError && typeof e.data === "string") {
                    throw new Error(e.data);
                }
                throw err;
            }
        };
    }
    on(channelName1, cb) {
        this.#handlers.set(channelName1, cb);
    }
    to(channelName2, message2) {
        if (this.readyState === WebSocket.CONNECTING) {
            return this.to(channelName2, message2);
        }
        const packet = JSON.stringify({
            channel: channelName2,
            message: message2
        });
        this.send(packet);
    }
}
export { Channel as Channel };
export { Client as Client };
export { Server1 as Server };
export { WebSocketClient as WebSocketClient };
