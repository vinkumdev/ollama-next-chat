'use client';

import { useState, useRef } from 'react';
import copy from 'copy-to-clipboard';

export default function CodeBlock({ node, inline, className, children, ...props }) {
    const codeRef = useRef(null);
    const [copied, setCopied] = useState(false);

    if (inline) {
        return (
            <code className="bg-gray-200 px-1 rounded text-sm font-mono">
                {children}
            </code>
        );
    }

    const handleCopy = () => {
        if (codeRef.current) {
            copy(codeRef.current.innerText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="relative group my-4">
            <pre className={`${className} rounded-md p-4 overflow-x-auto`} ref={codeRef}>
                <code>{children}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-xs px-2 py-1 bg-white border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
}
