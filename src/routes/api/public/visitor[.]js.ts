import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Serves a tiny tracking script: <script src=".../api/public/visitor.js?k=KEY"></script>
export const Route = createFileRoute("/api/public/visitor.js")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("k") || "";
        const origin = url.origin;
        const js = `(function(){try{var k=${JSON.stringify(key)};if(!k)return;var p={k:k,u:location.href,r:document.referrer||''};fetch(${JSON.stringify(origin)}+"/api/public/visitor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p),keepalive:true}).catch(function(){});}catch(e){}})();`;
        return new Response(js, {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
