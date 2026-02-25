const server = Bun.serve({
  port: Number(process.env.PORT) || 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/index.js') {
      const result = await Bun.build({
        entrypoints: ['./src/index.tsx'],
      });
      if (!result.success) {
        console.error('Build failed:', result.logs);
        return new Response('Build failed\n' + result.logs.join('\n'), { status: 500 });
      }
      return new Response(result.outputs[0], {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    if (url.pathname === '/app.css') {
      return new Response(Bun.file('./src/App.css'), {
        headers: { 'Content-Type': 'text/css' },
      });
    }

    return new Response(Bun.file('./index.html'), {
      headers: { 'Content-Type': 'text/html' },
    });
  },
});

console.log(`Dev server running at http://localhost:${server.port}`);
