'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import type { AgentMeta, CrossroadProfile } from '@/lib/types';

interface CrossroadConversationProps {
  topic: string;
  agents: AgentMeta[];
  narratives: Record<string, string>;
  onComplete: (profile: CrossroadProfile) => void;
}

export function CrossroadConversation({ topic, agents, narratives, onComplete }: CrossroadConversationProps) {
  const { t } = useI18n();
  const [userReflection, setUserReflection] = useState('');
  const [personaReplies, setPersonaReplies] = useState<Record<string, string>>({});
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'user-reflecting' | 'personas-replying' | 'done'>('idle');
  const [currentReplyingAgent, setCurrentReplyingAgent] = useState<string | null>(null);

  const startConversation = async () => {
    setCurrentPhase('user-reflecting');
    setUserReflection('');
    setPersonaReplies({});

    try {
      const response = await fetch('/api/crossroad/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, agents, narratives }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start crossroad conversation');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReflection = '';
      const replies: Record<string, string> = {};

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          const line = frame.replace(/^data: /, '').trim();
          if (!line) continue;

          const event = JSON.parse(line);

          switch (event.type) {
            case 'user_agent_chunk':
              fullReflection += event.data.content;
              setUserReflection(fullReflection);
              break;

            case 'user_agent_done':
              fullReflection = event.data.reflection;
              setUserReflection(fullReflection);
              setCurrentPhase('personas-replying');
              break;

            case 'persona_reply_start':
              setCurrentReplyingAgent(event.data.agentId);
              replies[event.data.agentId] = '';
              setPersonaReplies({ ...replies });
              break;

            case 'persona_reply_chunk':
              replies[event.data.agentId] = (replies[event.data.agentId] ?? '') + event.data.content;
              setPersonaReplies({ ...replies });
              break;

            case 'persona_reply_done':
              setCurrentReplyingAgent(null);
              break;

            case 'crossroad_profile':
              setCurrentPhase('done');
              onComplete(event.data);
              break;

            case 'error':
              console.error('Crossroad conversation error:', event.data.message);
              setCurrentPhase('idle');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to consume crossroad SSE:', error);
      setCurrentPhase('idle');
    }
  };

  return (
    <section className="pathsplit-card space-y-6">
      <div className="space-y-3">
        <div className="pathsplit-section-kicker">{t.crossroad.kicker}</div>
        <h3 className="text-2xl font-semibold tracking-tight text-stone-950">{t.crossroad.title}</h3>
        <p className="max-w-3xl text-[0.9rem] leading-7 text-stone-600">
          {t.crossroad.description}
        </p>
      </div>

      <div className="pathsplit-crossroad-steps">
        {[t.crossroad.step1, t.crossroad.step2, t.crossroad.step3].map((step, index) => (
          <div key={step ?? index} className="pathsplit-crossroad-step">
            <span className="pathsplit-crossroad-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-[0.78rem] tracking-[0.12em] text-stone-600 uppercase">{step}</span>
          </div>
        ))}
      </div>

      {currentPhase === 'idle' && (
        <div className="pathsplit-crossroad-intro space-y-4">
          <p className="text-[0.9rem] leading-7 text-stone-700">
            {t.crossroad.idleHint}
          </p>
          <button
            onClick={startConversation}
            className="pathsplit-cta"
          >
            {t.crossroad.startButton}
          </button>
        </div>
      )}

      {currentPhase !== 'idle' && (
        <div className="space-y-4">
          <div className="pathsplit-crossroad-reaction">
            <div className="pathsplit-meta-label text-amber-800 mb-2">
              {currentPhase === 'user-reflecting'
                ? t.crossroad.userReflecting
                : t.crossroad.userReflectionDone}
            </div>
            <div className="text-stone-800 whitespace-pre-wrap text-[0.9rem] leading-7">{userReflection || '...'}</div>
          </div>

          {currentPhase !== 'user-reflecting' && (
            <div className="grid gap-3 lg:grid-cols-3">
              {agents.map((agent) => {
                const reply = personaReplies[agent.id];
                const isReplying = currentReplyingAgent === agent.id;

                return (
                  <div key={agent.id} className="pathsplit-crossroad-reply">
                    <div className="text-sm font-medium text-stone-900 mb-2">
                      {agent.label} {isReplying && t.crossroad.personaReplying}
                    </div>
                    <div className="text-stone-700 whitespace-pre-wrap text-[0.84rem] leading-6">{reply || (isReplying ? '...' : '')}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
