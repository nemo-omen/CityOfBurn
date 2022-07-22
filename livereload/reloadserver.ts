import { serve } from "https://deno.land/std@0.148.0/http/server.ts";
import { refresh } from "./mod.ts";

const port = 2345;

// Construct the refresh middleware.
const refreshMiddleware = refresh();



serve((req: Request) => {
  // Handle custom refresh middleware requests.
  const res = refreshMiddleware(req);

  if (res) {
    return res;
  }
}, { port });

console.log("Live reload listening on http://localhost:2345");
