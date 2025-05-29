import { exec } from 'child_process';

export async function GET() {
    return new Promise((resolve) => {
        exec('ollama list', (error, stdout, stderr) => {
            if (error) {
                resolve(new Response(JSON.stringify({ error: stderr || error.message }), { status: 500 }));
                return;
            }
            // Split lines, skip header (first line), and filter empty lines
            const lines = stdout.split('\n').slice(1).filter(Boolean);

            // Each line looks like: 'mistral           123abc      45MB     2024-05-29'
            // We want just the NAME (first column)
            const models = lines.map(line => line.trim().split(/\s+/)[0]);

            resolve(new Response(JSON.stringify({ models }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }));
        });
    });
}
