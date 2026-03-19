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
    <div className="space-y-6">
      <div className="border-l-4 border-amber-500 pl-4">
        <div className="text-sm font-medium text-gray-500 mb-1">{t.crossroad?.kicker ?? '岔路口对话'}</div>
        <h3 className="text-xl font-semibold text-gray-900">{t.crossroad?.title ?? '你的分身看完三条路径后的反应'}</h3>
        <p className="text-sm text-gray-600 mt-2">
          {t.crossroad?.description ?? '你的 SecondMe Agent 会代表你生成第一人称反应，然后三个 persona 会依次回应。'}
        </p>
      </div>

      {currentPhase === 'idle' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
          <p className="text-sm text-amber-900 leading-6">
            {t.crossroad?.idleHint ?? '你的 SecondMe 分身将读取三条路径，说出你的真实反应——然后三个 persona 会直接回应你的处境。'}
          </p>
          <button
            onClick={startConversation}
            className="pathsplit-cta"
          >
            {t.crossroad?.startButton ?? '开始岔路口对话'}
          </button>
        </div>
      )}

      {currentPhase !== 'idle' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-2">
              {currentPhase === 'user-reflecting' ? '正在生成你的反应...' : '你的内心反应'}
            </div>
            <div className="text-gray-800 whitespace-pre-wrap">{userReflection || '...'}</div>
          </div>

          {currentPhase !== 'user-reflecting' && (
            <div className="space-y-3">
              {agents.map((agent) => {
                const reply = personaReplies[agent.id];
                const isReplying = currentReplyingAgent === agent.id;

                return (
                  <div key={agent.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {agent.label} {isReplying && '正在回应...'}
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{reply || (isReplying ? '...' : '')}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
