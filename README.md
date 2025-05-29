# Ollama + Mistral Chat App

A simple AI chat application built with Next.js (App Router) that integrates with [Ollama](https://ollama.com/) to chat with locally installed language models like Mistral, LLaMA 3, Gemma, and Phi.  
Supports streaming responses and file upload input.

---

## Features

- Fetches installed Ollama models dynamically
- Chat UI with Markdown and syntax-highlighted code blocks
- Streaming AI responses
- Upload `.txt` or `.md` files to append input
- Save chat history in localStorage
- Model selection from available Ollama models

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Ollama CLI](https://ollama.com/docs/cli) installed and accessible in your system PATH

---

## Installation

### 1. Install Ollama CLI

Follow official instructions:  
[https://ollama.com/docs/cli](https://ollama.com/docs/cli)

Verify installation:

```bash
ollama version
```
### 2. Install Ollama Models
Example:

```bash
ollama pull mistral
```

Make sure these models are installed locally by running:

```aiignore
ollama list
```

###  Setup and run Next.js app
Clone this repo and install dependencies:

```aiignore
git clone <your-repo-url>
cd <your-repo-directory>
npm install
```

Start development server:

```aiignore
npm run dev
```

Open http://localhost:3000 in your browser.

### Project Structure Highlights
/app/api/models/route.js - API route fetching installed models by executing ollama list

/app/page.jsx - Main chat page with UI and client-side logic

Uses React hooks and streaming fetch to provide smooth chat experience

Markdown rendering with react-markdown and syntax highlighting with rehype-highlight

### Usage
Select a model from the dropdown
Type messages and press Enter or click Send
Upload .txt or .md files to append to the input area
Chat history is saved in browser localStorage
