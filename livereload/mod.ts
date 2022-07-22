const sockets: Set<WebSocket> = new Set();

export function refresh(): (request: Request) => Response | null {
  watch();
  return refreshMiddleware;
}

async function watch() {
  const watcher = Deno.watchFs('./');

  for await (const event of watcher) {
    if (['any', 'access'].includes(event.kind)) {
      continue;
    }

    sockets.forEach((socket) => {
      socket.send('refresh');
    });
  }
}

function refreshMiddleware(request: Request): Response | null {
  if (request.url.endsWith('/refresh')) {
    const { response, socket } = Deno.upgradeWebSocket(request);

    sockets.add(socket);

    socket.onclose = () => {
      sockets.delete(socket);
    };

    return response;
  }

  return null;
}