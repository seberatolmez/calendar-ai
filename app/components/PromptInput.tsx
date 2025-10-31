// main prompt input component

'use client';

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar
} from '@/components/ui/shadcn-io/ai/prompt-input';
import { useState, type FormEventHandler } from 'react';

const PromptBox = () => {
  const [text, setText] = useState<string>('');
  const [status, setStatus] = useState<'submitted' | 'streaming' | 'ready' | 'error'>('ready');

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text) return;

    setStatus('submitted');
    setTimeout(() => setStatus('streaming'), 200);
    setTimeout(() => {
      setStatus('ready');
      setText('');
    }, 2000);
  };

  return (
    <div className="p-8 w-full">
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          value={text}
          placeholder="Type your message..."
        />
        <PromptInputToolbar>
          <PromptInputSubmit disabled={!text} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
};

export default PromptBox;
