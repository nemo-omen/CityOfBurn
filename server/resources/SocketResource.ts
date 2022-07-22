import { Drash } from '../deps.ts';

export class SocketResource extends Drash.Resource {
  paths = ['/game'];

  public GET(request: Drash.Request, response: Drash.Response): void {
    if (
      request.headers.has("connection") &&
      request.headers.has("upgrade") &&
      request.headers.get("connection")!.toLowerCase().includes("upgrade") &&
      request.headers.get("upgrade")!.toLowerCase() == "websocket"
    ) {
      try {
        const {
          socket,
          response: socketResponse,
        } = Deno.upgradeWebSocket(request);

        this.#addEventHandlers(socket);

        return response.upgrade(socketResponse);
      } catch (error) {
        console.log(error);
        return response.text(error);
      }
    }

    // Otherwise, just send a message
    return response.text("Hello!");
  }

  #addEventHandlers(socket: WebSocket): void {
    // When the connection opens, log that it has been opened
    socket.onopen = () => {
      console.log("WebSocket connection opened!");
    };

    // When a message is received from the client, log it and send a message to
    // the client confirming that the message was received
    socket.onmessage = (e: MessageEvent) => {
      console.log(`Message received:`, e.data);
      socket.send(`We received your message! You sent: ${e.data}`);
    };

    // When the connection closes, log that it has been closed
    socket.onclose = () => {
      console.log("Connection closed.");
    };

    // When an error occurs during the connection, log the error
    socket.onerror = (e: Event) => {
      console.log("WebSocket error:", e);
      socket.send(`Woops! We hit a snag: ${e}`);
    };
  }
}