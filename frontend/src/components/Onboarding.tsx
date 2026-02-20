import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '@/lib/backend';

const USER_NAME_KEY = 'brian_user_name';

/** Get the stored user name (used by other components like HomeView). */
export function getUserName(): string | null {
  return localStorage.getItem(USER_NAME_KEY);
}

// ── Brian Logo (static, colored squares from loading.svg) ───────────────────

function BrianLogo({ size = 14, gap = 2 }: { size?: number; gap?: number }) {
  const grid = [
    ['#FF8000', '#D5FF00', '#FF2F00', '#00E1FF', '#8A38F5'],
    ['#00E1FF', '#8A38F5', '#FF8000', '#D5FF00', '#FF2F00'],
    ['#FF8000', '#FF2F00', '#D5FF00', '#00E1FF', '#8A38F5'],
  ];

  return (
    <div
      className="relative"
      style={{
        width: 5 * size + 4 * gap,
        height: 3 * size + 2 * gap,
      }}
    >
      {grid.map((row, r) =>
        row.map((color, c) => (
          <div
            key={`${r}-${c}`}
            className="absolute rounded-[1.5px]"
            style={{
              width: size,
              height: size,
              left: c * (size + gap),
              top: r * (size + gap),
              backgroundColor: color,
            }}
          />
        ))
      )}
    </div>
  );
}

// ── Step 0: Login / Landing ─────────────────────────────────────────────────

function LoginStep({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-start gap-10 w-full max-w-sm"
    >
      <BrianLogo size={22} gap={3} />

      <p className="text-sm text-muted-foreground font-light tracking-wide">
        Keep your knowledge local
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors"
        />

        <button
          type="submit"
          disabled={!name.trim()}
          className="self-end px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-20 disabled:cursor-not-allowed"
        >
          Log in
        </button>
      </form>
    </motion.div>
  );
}

// ── Step 1: This is Brian ───────────────────────────────────────────────────

function WelcomeStep({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-start gap-10 w-full max-w-sm"
    >
      <BrianLogo size={20} gap={3} />

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-light text-foreground">
          Hey {name}, this is Brian
        </h1>
        <p className="text-base text-muted-foreground font-light leading-relaxed">
          Your personal knowledge base. Save notes, links, code snippets, and
          papers — then search and connect them with AI.
        </p>
      </div>

      <button
        onClick={onNext}
        className="self-end px-8 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
      >
        Get Started
      </button>
    </motion.div>
  );
}

// ── Step 2: Connect AI Tools ────────────────────────────────────────────────

function ConnectToolsStep({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check which tools are already connected on mount
  useState(() => {
    fetch(`${getApiBaseUrl()}/tools/status`)
      .then((res) => res.json())
      .then((status: Record<string, boolean>) => {
        const alreadyConnected = Object.entries(status)
          .filter(([, v]) => v)
          .map(([k]) => k);
        if (alreadyConnected.length > 0) {
          setConnected(alreadyConnected);
        }
      })
      .catch(() => {});
  });

  const tools = [
    {
      id: 'goose',
      name: 'Goose',
      description: "Block's open-source AI agent",
      icon: '🪿',
    },
    {
      id: 'claude',
      name: 'Claude Desktop',
      description: "Anthropic's desktop assistant",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm2.07-7.75l-.9.92C11.45 10.9 11 11.5 11 13H9v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H6c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      ),
    },
    {
      id: 'cursor',
      name: 'Cursor',
      description: 'AI-powered code editor',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M4 4l16 8-16 8V4z" />
        </svg>
      ),
    },
  ];

  const handleConnect = async (toolId: string) => {
    setConnecting(toolId);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/tools/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId }),
      });
      if (res.ok) {
        setConnected((prev) => [...prev, toolId]);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Connection failed');
      }
    } catch {
      setError('Could not reach backend');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-8 max-w-md text-center"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-light text-foreground">
          Connect Your AI Tools
        </h2>
        <p className="text-sm text-muted-foreground font-light">
          Brian works as an MCP server — connect it to your favourite AI
          assistant so it can search your knowledge base.
        </p>
      </div>

      <div className="w-full flex flex-col gap-2">
        {tools.map((tool) => {
          const isConnected = connected.includes(tool.id);
          const isConnecting = connecting === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => !isConnected && handleConnect(tool.id)}
              disabled={isConnecting}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                isConnected
                  ? 'border-border bg-muted/50'
                  : 'border-border/50 bg-card hover:bg-muted/50 hover:border-border'
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-foreground/70 text-xl shrink-0">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{tool.name}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
              <div className="shrink-0">
                {isConnected ? (
                  <svg className="w-5 h-5 text-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isConnecting ? (
                  <div className="w-4 h-4 border-2 border-border border-t-foreground/60 rounded-full animate-spin" />
                ) : (
                  <span className="text-xs text-muted-foreground">Connect</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="flex gap-3 w-full">
        <button
          onClick={onSkip}
          className="flex-1 px-6 py-2.5 rounded-lg text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          className="flex-1 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 3: Add First Item ──────────────────────────────────────────────────

function AddFirstItemStep({ onComplete }: { onComplete: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || title.trim(),
          item_type: 'note',
          tags: ['getting-started'],
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(onComplete, 800);
      }
    } catch {
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-8 max-w-md text-center"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-light text-foreground">
          Add Your First Note
        </h2>
        <p className="text-sm text-muted-foreground font-light">
          Save anything — a thought, a link, a code snippet. Brian will make it
          searchable and connected.
        </p>
      </div>

      {!saved ? (
        <div className="w-full flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors"
          />
          <textarea
            placeholder="Write something... (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors resize-none"
          />
          <div className="flex gap-3 mt-2">
            <button
              onClick={onComplete}
              className="flex-1 px-6 py-2.5 rounded-lg text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex-1 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save & Finish'}
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <svg className="w-8 h-8 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-sm text-muted-foreground">Saved! Launching Brian...</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Step Indicator ──────────────────────────────────────────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-foreground/50'
              : i < current
                ? 'w-1.5 bg-foreground/25'
                : 'w-1.5 bg-foreground/10'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main Onboarding Component ───────────────────────────────────────────────

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const totalSteps = 4;

  const handleLogin = (name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-background">
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <LoginStep key="login" onNext={handleLogin} />
          )}
          {step === 1 && (
            <WelcomeStep key="welcome" name={userName} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <ConnectToolsStep
              key="connect"
              onNext={() => setStep(3)}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <AddFirstItemStep key="add-item" onComplete={onComplete} />
          )}
        </AnimatePresence>
      </div>

      <div className="pb-10">
        <StepDots total={totalSteps} current={step} />
      </div>
    </div>
  );
}

export default Onboarding;
