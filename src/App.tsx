import { useEffect, useRef, useState } from "react";

type AppMode = "home" | "editing" | "teleprompter";
type Theme = "dark" | "light" | "contrast";

type FontFamily =
  | "inter"
  | "dm-sans"
  | "manrope"
  | "roboto-slab"
  | "lora"
  | "jetbrains";

type Alignment = "left" | "center";

type Script = {
  id: string;
  title: string;
  content: string;
  fontSize: number;
  speed: number;
  mirror: boolean;
  theme: Theme;
  fontFamily: FontFamily;
  alignment: Alignment;
  updatedAt: number;
};

const STORAGE_KEY = "cuetify-scripts";

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [mode, setMode] = useState<AppMode>("home");

  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const [activeScriptId, setActiveScriptId] =
    useState<string | null>(null);

  const [showNewScript, setShowNewScript] =
    useState(false);

  const [showRename, setShowRename] =
    useState(false);

  const [newScriptTitle, setNewScriptTitle] =
    useState("");

  const [renameText, setRenameText] =
    useState("");

  const [script, setScript] = useState("");
  const [title, setTitle] =
    useState("Untitled Script");

  const [fontSize, setFontSize] = useState(42);
  const [speed, setSpeed] = useState(1);

  const [isMirrored, setIsMirrored] =
    useState(false);

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [fontFamily, setFontFamily] =
    useState<FontFamily>("inter");

  const [alignment, setAlignment] =
    useState<Alignment>("center");

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [countdown, setCountdown] =
    useState<number | null>(null);

  const [showGuide, setShowGuide] =
    useState(true);

  const [showControls, setShowControls] =
    useState(true);

  const [showMoreControls, setShowMoreControls] =
    useState(false);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const lastTimeRef =
    useRef<number | null>(null);

  const hideControlsTimer =
    useRef<number | null>(null);

  /* LOAD */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setScripts(parsed);
        }
      }
    } catch {
      console.log(
        "Unable to load scripts."
      );
    }

    setScriptsLoaded(true);
  }, []);

  /* SAVE */

  useEffect(() => {
    if (!scriptsLoaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(scripts)
    );
  }, [scripts, scriptsLoaded]);

  /* FONT */

  const fontStack =
    fontFamily === "inter"
      ? "'Inter', sans-serif"
      : fontFamily === "dm-sans"
        ? "'DM Sans', sans-serif"
        : fontFamily === "manrope"
          ? "'Manrope', sans-serif"
          : fontFamily === "roboto-slab"
            ? "'Roboto Slab', serif"
            : fontFamily === "lora"
              ? "'Lora', serif"
              : "'JetBrains Mono', monospace";

  const fontWeight =
    fontFamily === "jetbrains"
      ? 400
      : 500;

  /* AUTOSAVE */

  useEffect(() => {
    if (
      !activeScriptId ||
      !scriptsLoaded
    ) {
      return;
    }

    setScripts((current) =>
      current.map((item) =>
        item.id === activeScriptId
          ? {
              ...item,
              title,
              content: script,
              fontSize,
              speed,
              mirror: isMirrored,
              theme,
              fontFamily,
              alignment,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  }, [
    title,
    script,
    fontSize,
    speed,
    isMirrored,
    theme,
    fontFamily,
    alignment,
    activeScriptId,
    scriptsLoaded,
  ]);

  /* NEW SCRIPT */

  const openNewScript = () => {
    setNewScriptTitle("");
    setShowNewScript(true);
  };

  const startNewScript = () => {
    const newTitle =
      newScriptTitle.trim() ||
      "Untitled Script";

    const newScript: Script = {
      id: crypto.randomUUID(),
      title: newTitle,
      content: "",
      fontSize: 42,
      speed: 1,
      mirror: false,
      theme: "dark",
      fontFamily: "inter",
      alignment: "center",
      updatedAt: Date.now(),
    };

    setScripts((current) => [
      newScript,
      ...current,
    ]);

    setActiveScriptId(newScript.id);
    setTitle(newTitle);
    setScript("");

    setFontSize(42);
    setSpeed(1);
    setIsMirrored(false);
    setTheme("dark");
    setFontFamily("inter");
    setAlignment("center");

    setShowNewScript(false);
    setShowLanding(false);
    setMode("editing");
  };

  /* OPEN SCRIPT */

  const openScript = (item: Script) => {
    setActiveScriptId(item.id);

    setTitle(item.title);
    setScript(item.content);

    setFontSize(
      item.fontSize ?? 42
    );

    setSpeed(
      item.speed ?? 1
    );

    setIsMirrored(
      item.mirror ?? false
    );

    setTheme(
      item.theme ?? "dark"
    );

    setFontFamily(
      item.fontFamily ?? "inter"
    );

    setAlignment(
      item.alignment ?? "center"
    );

    setShowLanding(false);
    setMode("editing");

    setIsPlaying(false);
    setProgress(0);
  };

  /* DELETE */

  const deleteScript = (id: string) => {
    setScripts((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    if (
      activeScriptId === id
    ) {
      setActiveScriptId(null);
    }
  };

  /* RENAME */

  const openRename = () => {
    setRenameText(title);
    setShowRename(true);
  };

  const saveRename = () => {
    const newTitle =
      renameText.trim() ||
      "Untitled Script";

    setTitle(newTitle);
    setShowRename(false);
  };

  /* HOME */

  const goHome = () => {
    setIsPlaying(false);
    setCountdown(null);
    setMode("home");
  };

  /* TELEPROMPTER */

  const startTeleprompter = () => {
    if (!script.trim()) return;

    setMode("teleprompter");
    setIsPlaying(false);
    setCountdown(null);
    setProgress(0);

    setShowControls(true);
    setShowMoreControls(false);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    });
  };

  const exitTeleprompter = () => {
    setIsPlaying(false);
    setCountdown(null);
    setMode("editing");
  };

  const restartTeleprompter = () => {
    setIsPlaying(false);
    setCountdown(null);
    setProgress(0);

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    setShowControls(true);
    revealControls();
  };

  /* COUNTDOWN */

  const startCountdown = () => {
    if (
      isPlaying ||
      countdown !== null
    ) {
      return;
    }

    let value = 3;

    setCountdown(value);

    const timer =
      window.setInterval(() => {
        value -= 1;

        if (value <= 0) {
          window.clearInterval(timer);
          setCountdown(null);
          setIsPlaying(true);
        } else {
          setCountdown(value);
        }
      }, 700);
  };

  /* CONTROLS */

  const revealControls = () => {
    setShowControls(true);

    if (hideControlsTimer.current) {
      window.clearTimeout(
        hideControlsTimer.current
      );
    }

    if (isPlaying) {
      hideControlsTimer.current =
        window.setTimeout(() => {
          setShowControls(false);
        }, 2500);
    }
  };

  /* AUTO SCROLL */

  useEffect(() => {
    if (
      mode !== "teleprompter" ||
      !isPlaying ||
      countdown !== null
    ) {
      lastTimeRef.current = null;

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      animationFrameRef.current =
        null;

      return;
    }

    const animate = (
      time: number
    ) => {
      const container =
        scrollRef.current;

      if (!container) return;

      if (
        lastTimeRef.current === null
      ) {
        lastTimeRef.current = time;
      }

      const delta =
        time -
        lastTimeRef.current;

      lastTimeRef.current = time;

      const pixelsPerSecond =
        42 * speed;

      container.scrollTop +=
        (pixelsPerSecond * delta) /
        1000;

      const maxScroll =
        container.scrollHeight -
        container.clientHeight;

      const current =
        container.scrollTop;

      const percentage =
        maxScroll > 0
          ? (current / maxScroll) *
            100
          : 100;

      setProgress(
        Math.min(
          100,
          Math.max(
            0,
            percentage
          )
        )
      );

      if (
        current >=
        maxScroll - 2
      ) {
        setIsPlaying(false);
        setProgress(100);
        setShowControls(true);
        return;
      }

      animationFrameRef.current =
        requestAnimationFrame(
          animate
        );
    };

    animationFrameRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      animationFrameRef.current =
        null;

      lastTimeRef.current =
        null;
    };
  }, [
    mode,
    isPlaying,
    speed,
    countdown,
  ]);

  /* KEYBOARD */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        target.tagName ===
          "TEXTAREA" ||
        target.tagName ===
          "INPUT"
      ) {
        return;
      }

      if (
        mode !== "teleprompter"
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();

        if (isPlaying) {
          setIsPlaying(false);
          setShowControls(true);
        } else {
          startCountdown();
        }

        revealControls();
      }

      if (
        event.key.toLowerCase() ===
        "r"
      ) {
        restartTeleprompter();
      }

      if (
        event.key.toLowerCase() ===
        "m"
      ) {
        setIsMirrored(
          (value) => !value
        );

        revealControls();
      }

      if (
        event.key.toLowerCase() ===
        "f"
      ) {
        toggleFullscreen();
      }

      if (
        event.key.toLowerCase() ===
        "g"
      ) {
        setShowGuide(
          (value) => !value
        );

        revealControls();
      }

      if (
        event.key.toLowerCase() ===
        "c"
      ) {
        setShowMoreControls(
          (value) => !value
        );

        setShowControls(true);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSpeed((value) =>
          Math.min(
            3,
            Number(
              (
                value + 0.1
              ).toFixed(1)
            )
          )
        );

        revealControls();
      }

      if (
        event.key === "ArrowDown"
      ) {
        event.preventDefault();

        setSpeed((value) =>
          Math.max(
            0.2,
            Number(
              (
                value - 0.1
              ).toFixed(1)
            )
          )
        );

        revealControls();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        event.preventDefault();

        setFontSize((value) =>
          Math.max(
            24,
            value - 2
          )
        );

        revealControls();
      }

      if (
        event.key === "ArrowRight"
      ) {
        event.preventDefault();

        setFontSize((value) =>
          Math.min(
            80,
            value + 2
          )
        );

        revealControls();
      }

      if (
        event.key === "Escape"
      ) {
        exitTeleprompter();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    mode,
    isPlaying,
    speed,
  ]);

  /* FULLSCREEN */

  const toggleFullscreen =
    async () => {
      try {
        if (
          !document.fullscreenElement
        ) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch {
        console.log(
          "Fullscreen unavailable."
        );
      }
    };

  /* DATE */

  const formatDate = (
    timestamp: number
  ) => {
    const difference =
      Date.now() - timestamp;

    const minutes =
      Math.floor(
        difference / 60000
      );

    if (minutes < 1)
      return "Just now";

    if (minutes < 60)
      return `${minutes}m ago`;

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24)
      return `${hours}h ago`;

    const days =
      Math.floor(
        hours / 24
      );

    if (days === 1)
      return "Yesterday";

    return `${days}d ago`;
  };

  /* TELEPROMPTER THEME */

  const teleprompterBackground =
    theme === "light"
      ? "bg-[#F8F6F2] text-[#242321]"
      : theme === "contrast"
        ? "bg-black text-white"
        : "bg-[#111110] text-white";

  /* ═══════════════════════
     LANDING PAGE
  ═══════════════════════ */

  if (showLanding) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8F6F2] text-[#242321]">

        <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#F8F6F2]/85 backdrop-blur-xl">

          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#B8D8C0] text-base">
                ✦
              </div>

              <span className="text-[15px] font-semibold tracking-tight">
                Cuetify
              </span>

            </div>

            <button
              onClick={() => {
                setShowLanding(false);
                setMode("home");
              }}
              className="rounded-full bg-[#242321] px-4 py-2 text-xs font-medium text-white transition hover:opacity-80"
            >
              Open App
            </button>

          </div>

        </header>

        <main className="flex-1">

          <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-24 md:pt-24">

            <div className="text-center">

              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-black/40">
                CUETIFY
              </p>

              <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-7xl lg:text-[84px]">
                Your words.
                <br />
                Right in front of you.
              </h1>

              <p className="mx-auto mt-6 max-w-md text-[15px] leading-6 text-black/50 md:text-base">
                A focused teleprompter for people
                who have something to say.
              </p>

              <button
                onClick={() => {
                  setShowLanding(false);
                  setMode("home");
                }}
                className="mt-7 rounded-full bg-[#242321] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
              >
                Start Writing
                <span className="ml-2">
                  →
                </span>
              </button>

            </div>

            <div className="mt-16 overflow-hidden rounded-[26px] bg-[#111110] shadow-[0_30px_80px_rgba(0,0,0,0.16)] md:mt-20">

              <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-5">

                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                </div>

                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                  Cuetify
                </span>

                <div className="w-12" />

              </div>

              <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden px-8 md:min-h-[500px]">

                <div className="pointer-events-none absolute left-8 right-8 top-1/2 border-t border-white/[0.08]" />

                <p className="relative max-w-4xl text-center text-[28px] font-medium leading-[1.55] tracking-[-0.02em] text-white md:text-4xl lg:text-5xl">
                  Your words should be easy to read,
                  <br />
                  so you can focus on the moment.
                </p>

              </div>

              <div className="flex justify-center border-t border-white/[0.06] px-5 py-5">

                <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-2">

                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-white">
                    ▶
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-white/70">
                    ↻
                  </span>

                  <div className="mx-3 h-1 w-24 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/3 rounded-full bg-white/60" />
                  </div>

                  <span className="px-2 text-[11px] text-white/50">
                    1.0×
                  </span>

                </div>

              </div>

            </div>

          </section>

          <section className="bg-[#111110] px-6 py-24 text-white md:py-32">

            <div className="mx-auto max-w-6xl">

              <div className="max-w-xl">

                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/35">
                  WRITE
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.035em] md:text-6xl">
                  Get the words
                  <br />
                  out of your head.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-white/45 md:text-base">
                  Write your script in a clean,
                  distraction-free editor.
                  Everything stays right where
                  you left it.
                </p>

              </div>

              <div className="mt-14 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#181817] shadow-2xl">

                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">

                  <span className="text-xs font-medium text-white/70">
                    Untitled Script
                  </span>

                  <span className="text-[10px] text-white/25">
                    Saved automatically
                  </span>

                </div>

                <div className="min-h-[330px] px-7 py-8 md:px-12 md:py-12">

                  <p className="max-w-3xl text-2xl font-medium leading-[1.7] text-white/85 md:text-4xl">
                    Hello everyone.
                    <br />
                    Today we're going to talk
                    about something simple.
                    <br />
                    <br />
                    How to stay focused
                    when the camera turns on.
                  </p>

                </div>

                <div className="flex justify-center border-t border-white/[0.06] py-4">

                  <div className="flex items-center gap-3 rounded-full bg-white/[0.05] px-4 py-2">

                    <span className="text-[10px] text-white/30">
                      A−
                    </span>

                    <span className="text-[10px] text-white/40">
                      42
                    </span>

                    <span className="text-[10px] text-white/30">
                      A+
                    </span>

                    <span className="mx-2 h-4 w-px bg-white/10" />

                    <span className="text-[10px] text-white/40">
                      Inter
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

          <section className="bg-[#F8F6F2] px-6 py-24 md:py-32">

            <div className="mx-auto max-w-6xl">

              <div className="max-w-xl">

                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-black/35">
                  READ
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.035em] md:text-6xl">
                  Every word.
                  <br />
                  At your pace.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-black/45 md:text-base">
                  Adjust the text until it feels
                  natural. Change the size, font,
                  speed, alignment, and more.
                </p>

              </div>

              <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {[
                  ["Type", "6 carefully selected fonts"],
                  ["Size", "24 — 80px"],
                  ["Speed", "0.2× — 3.0×"],
                  ["Mirror", "For glass & studio setups"],
                ].map(
                  ([name, description]) => (
                    <div
                      key={name}
                      className="rounded-2xl border border-black/[0.08] bg-white/55 p-5"
                    >
                      <p className="text-sm font-semibold">
                        {name}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-black/40">
                        {description}
                      </p>
                    </div>
                  )
                )}

              </div>

            </div>

          </section>

          <section className="px-6 pb-28 pt-10 md:pb-36">

            <div className="mx-auto max-w-6xl">

              <div className="rounded-[28px] bg-[#B8D8C0] px-7 py-20 text-center md:px-12 md:py-28">

                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-black/40">
                  PRESENT
                </p>

                <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
                  Stop thinking about
                  <br />
                  what comes next.
                </h2>

                <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/50 md:text-base">
                  Cuetify keeps your words moving
                  so you can focus on delivering
                  them.
                </p>

                <button
                  onClick={() => {
                    setShowLanding(false);
                    setMode("home");
                  }}
                  className="mt-8 rounded-full bg-[#242321] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  Open Cuetify
                  <span className="ml-2">
                    →
                  </span>
                </button>

              </div>

            </div>

          </section>

        </main>

        {/* LANDING FOOTER */}

        <footer className="border-t border-black/[0.07] px-6 py-8">

          <div className="mx-auto flex max-w-6xl items-center justify-between">

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B8D8C0] text-xs">
                ✦
              </div>

              <span className="text-xs font-semibold tracking-tight">
                Cuetify
              </span>

            </div>

            <span className="text-[10px] text-black/30">
              Built for focus.
            </span>

          </div>

        </footer>

      </div>
    );
  }

  /* ═══════════════════════
     HOME / SCRIPTS
  ═══════════════════════ */

  if (mode === "home") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8F6F2] text-[#242321]">

        <header className="flex items-center justify-between px-8 py-6">

          <button
            onClick={() =>
              setShowLanding(true)
            }
            className="flex items-center gap-2"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B8D8C0] text-lg">
              ✦
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Cuetify
            </span>

          </button>

          <button
            onClick={() =>
              setShowLanding(true)
            }
            className="rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-black/5"
          >
            About
          </button>

        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-8 pb-20 pt-14">

          <div className="mx-auto max-w-3xl text-center">

            <p className="mb-4 text-sm font-medium tracking-[0.18em] text-[#7A7771]">
              TELEPROMPTER
            </p>

            <h1 className="text-5xl font-semibold tracking-tight">
              Your script. Your cue. Your moment.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#77736D]">
              A simple, distraction-free
              teleprompter for creators,
              presenters, and anyone who
              needs the right words at the
              right time.
            </p>

          </div>

          <section className="mt-20">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-lg font-semibold">
                Your Scripts
              </h2>

              {scripts.length > 0 && (
                <button
                  onClick={openNewScript}
                  className="rounded-xl bg-[#242321] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  + New Script
                </button>
              )}

            </div>

            {scripts.length === 0 ? (

              <button
                onClick={openNewScript}
                className="group w-full rounded-2xl border border-dashed border-black/15 bg-white/40 p-10 text-center transition hover:border-black/25 hover:bg-white"
              >

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B8D8C0] text-xl transition group-hover:scale-105">
                  +
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Create your first script
                </h3>

                <p className="mt-1 text-sm text-black/40">
                  Your scripts will be saved automatically.
                </p>

              </button>

            ) : (

              <div className="grid gap-3 sm:grid-cols-2">

                {scripts.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="group relative rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md"
                    >

                      <button
                        onClick={() =>
                          openScript(item)
                        }
                        className="block w-full text-left"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EEE9]">
                            📄
                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-semibold">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-xs text-black/40">
                              {formatDate(
                                item.updatedAt
                              )}
                            </p>

                          </div>

                        </div>

                        <p className="mt-4 min-h-[40px] text-sm leading-5 text-black/45">
                          {item.content ||
                            "No content yet. Click to start writing."}
                        </p>

                      </button>

                      <button
                        onClick={() =>
                          deleteScript(item.id)
                        }
                        className="absolute right-4 top-4 rounded-lg px-2 py-1 text-xs text-black/25 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      >
                        Delete
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </main>

        {/* HOME FOOTER */}

        <footer className="border-t border-black/[0.07] px-8 py-8">

          <div className="mx-auto flex max-w-5xl items-center justify-between">

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B8D8C0] text-xs">
                ✦
              </div>

              <span className="text-xs font-semibold tracking-tight">
                Cuetify
              </span>

            </div>

            <span className="text-[10px] text-black/30">
              Built for focus.
            </span>

          </div>

        </footer>

        {/* NEW SCRIPT MODAL */}

        {showNewScript && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm"
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowNewScript(false);
              }
            }}
          >

            <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B8D8C0]">
                  📄
                </div>

                <div>

                  <h2 className="text-lg font-semibold">
                    New Script
                  </h2>

                  <p className="text-sm text-black/45">
                    Give your script a name to get started.
                  </p>

                </div>

              </div>

              <input
                autoFocus
                value={newScriptTitle}
                onChange={(event) =>
                  setNewScriptTitle(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {
                    startNewScript();
                  }

                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setShowNewScript(
                      false
                    );
                  }

                }}
                placeholder="Untitled Script"
                className="mt-6 w-full rounded-xl border border-black/10 bg-[#F8F6F2] px-4 py-3 text-sm outline-none focus:border-black/20 focus:ring-2 focus:ring-black/5"
              />

              <div className="mt-6 flex gap-2">

                <button
                  onClick={() =>
                    setShowNewScript(
                      false
                    )
                  }
                  className="flex-1 rounded-xl bg-black/5 py-2.5 text-sm font-medium hover:bg-black/10"
                >
                  Cancel
                </button>

                <button
                  onClick={startNewScript}
                  className="flex-1 rounded-xl bg-[#242321] py-2.5 text-sm font-semibold text-white hover:opacity-85"
                >
                  Start
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  /* ═══════════════════════
     EDITOR
  ═══════════════════════ */

  if (mode === "editing") {
    return (
      <div className="min-h-screen bg-[#F8F6F2] text-[#242321]">

        <header className="flex h-16 items-center border-b border-black/10 px-6">

          <button
            onClick={goHome}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/60 hover:bg-black/5"
          >
            ←
            <span>Home</span>
          </button>

          <div className="mx-4 h-5 w-px bg-black/10" />

          <button
            onClick={openRename}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5"
          >
            📄
            <span>{title}</span>
            <span className="text-xs text-black/35">
              ✎
            </span>
          </button>

          <span className="ml-auto text-xs text-black/35">
            Saved automatically
          </span>

        </header>

        <main className="mx-auto max-w-5xl px-8 py-10">

          <textarea
            value={script}
            onChange={(event) =>
              setScript(
                event.target.value
              )
            }
            autoFocus
            spellCheck
            placeholder="Start writing your script here..."
            className="min-h-[60vh] w-full resize-none rounded-2xl border border-black/10 bg-white p-8 leading-relaxed text-[#242321] outline-none placeholder:text-black/25 focus:border-black/20 focus:ring-2 focus:ring-black/5"
            style={{
              fontFamily: fontStack,
              fontWeight,
              fontSize: `${Math.max(
                18,
                Math.min(
                  42,
                  fontSize * 0.55
                )
              )}px`,
            }}
          />

          <div className="mt-6 flex justify-center">

            <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm">

              <button
                onClick={
                  startTeleprompter
                }
                disabled={!script.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 disabled:opacity-30"
              >
                ▶
              </button>

              <div className="mx-1 h-5 w-px bg-black/10" />

              <button
                onClick={() =>
                  setFontSize(
                    (value) =>
                      Math.max(
                        24,
                        value - 2
                      )
                  )
                }
                className="rounded-lg px-2 py-1 text-xs hover:bg-black/5"
              >
                A−
              </button>

              <span className="w-8 text-center text-xs text-black/50">
                {fontSize}
              </span>

              <button
                onClick={() =>
                  setFontSize(
                    (value) =>
                      Math.min(
                        80,
                        value + 2
                      )
                  )
                }
                className="rounded-lg px-2 py-1 text-xs hover:bg-black/5"
              >
                A+
              </button>

              <select
                value={fontFamily}
                onChange={(event) =>
                  setFontFamily(
                    event.target
                      .value as FontFamily
                  )
                }
                className="rounded-lg bg-black/5 px-3 py-1.5 text-xs outline-none"
                style={{
                  fontFamily:
                    fontStack,
                  fontWeight,
                }}
              >

                <option value="inter">
                  Inter
                </option>

                <option value="dm-sans">
                  DM Sans
                </option>

                <option value="manrope">
                  Manrope
                </option>

                <option value="roboto-slab">
                  Roboto Slab
                </option>

                <option value="lora">
                  Lora
                </option>

                <option value="jetbrains">
                  JetBrains Mono
                </option>

              </select>

              <button
                onClick={() =>
                  setIsMirrored(
                    (value) => !value
                  )
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isMirrored
                    ? "bg-black text-white"
                    : "hover:bg-black/5"
                }`}
              >
                Mirror
              </button>

            </div>

          </div>

        </main>

        {/* RENAME */}

        {showRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">

            <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl">

              <h2 className="text-lg font-semibold">
                Rename Script
              </h2>

              <p className="mt-1 text-sm text-black/45">
                Give your script a new name.
              </p>

              <input
                autoFocus
                value={renameText}
                onChange={(event) =>
                  setRenameText(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {
                    saveRename();
                  }

                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setShowRename(
                      false
                    );
                  }

                }}
                className="mt-5 w-full rounded-xl border border-black/10 bg-[#F8F6F2] px-4 py-3 text-sm outline-none"
              />

              <div className="mt-5 flex gap-2">

                <button
                  onClick={() =>
                    setShowRename(
                      false
                    )
                  }
                  className="flex-1 rounded-xl bg-black/5 py-2.5 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={saveRename}
                  className="flex-1 rounded-xl bg-[#242321] py-2.5 text-sm font-semibold text-white"
                >
                  Save
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  /* ═══════════════════════
     TELEPROMPTER
  ═══════════════════════ */

  return (
    <div
      className={`fixed inset-0 ${teleprompterBackground}`}
      onMouseMove={revealControls}
      onClick={() => {
        if (isPlaying) {
          revealControls();
        }
      }}
    >

      <div
        className={`absolute left-5 right-5 top-5 z-30 flex items-center justify-between transition-all duration-500 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >

        <button
          onClick={
            exitTeleprompter
          }
          className={`rounded-full px-4 py-2 text-sm backdrop-blur-xl ${
            theme === "light"
              ? "bg-black/5 text-black/60 hover:bg-black/10"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          ← Exit
        </button>

        <div
          className={`rounded-full px-4 py-2 text-xs backdrop-blur-xl ${
            theme === "light"
              ? "bg-black/5 text-black/45"
              : "bg-white/10 text-white/45"
          }`}
        >
          {title}
        </div>

        <button
          onClick={
            toggleFullscreen
          }
          className={`rounded-full px-4 py-2 text-sm backdrop-blur-xl ${
            theme === "light"
              ? "bg-black/5 text-black/60 hover:bg-black/10"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          ⛶
        </button>

      </div>

      {/* GUIDE */}

      <div
        className={`pointer-events-none absolute left-0 right-0 top-1/2 z-20 -translate-y-1/2 transition-opacity duration-500 ${
          showGuide
            ? "opacity-100"
            : "opacity-0"
        }`}
      >

        <div className="relative mx-auto max-w-5xl border-y border-current/10 py-12">

          <div className="absolute left-0 right-0 top-1/2 border-t border-current/20" />

        </div>

      </div>

      {/* SCRIPT */}

      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto overscroll-none"
        style={{
          scrollbarWidth: "none",
        }}
      >

        <div
          style={{
            height: "42vh",
          }}
        />

        <div
          className={`mx-auto max-w-5xl px-12 pb-[70vh] ${
            alignment === "center"
              ? "text-center"
              : "text-left"
          }`}
          style={{
            transform: isMirrored
              ? "scaleX(-1)"
              : undefined,
          }}
        >

          <p
            className="whitespace-pre-wrap"
            style={{
              fontFamily: fontStack,
              fontWeight,
              fontSize: `${fontSize}px`,
              lineHeight: 1.55,
              letterSpacing:
                fontFamily ===
                "jetbrains"
                  ? "0"
                  : "-0.01em",
            }}
          >
            {script}
          </p>

        </div>

      </div>

      {/* COUNTDOWN */}

      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">

          <div className="animate-pulse text-8xl font-semibold">
            {countdown}
          </div>

        </div>
      )}

      {/* PROGRESS */}

      <div
        className={`pointer-events-none absolute bottom-[94px] left-8 right-8 z-30 transition-opacity duration-500 ${
          showControls
            ? "opacity-100"
            : "opacity-0"
        }`}
      >

        <div className="h-1 overflow-hidden rounded-full bg-current/10">

          <div
            className="h-full rounded-full bg-current/50 transition-[width] duration-100"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* CONTROLS */}

      <div
        className={`absolute bottom-6 left-0 right-0 z-30 flex justify-center px-4 transition-all duration-500 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >

        <div
          className={`flex items-center gap-1 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${
            theme === "light"
              ? "border-black/10 bg-white/90"
              : "border-white/10 bg-[#222220]/85"
          }`}
        >

          <button
            onClick={() => {

              if (isPlaying) {
                setIsPlaying(false);
                setShowControls(true);
              } else {
                startCountdown();
              }

            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm transition hover:bg-current/10"
            title="Play / Pause"
          >
            {isPlaying
              ? "Ⅱ"
              : "▶"}
          </button>

          <button
            onClick={
              restartTeleprompter
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm opacity-70 transition hover:bg-current/10 hover:opacity-100"
            title="Restart"
          >
            ↻
          </button>

          <div className="mx-2 h-6 w-px bg-current/10" />

          <div className="flex items-center gap-2 px-2">

            <span className="text-[11px] uppercase tracking-wide opacity-35">
              Speed
            </span>

            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={speed}
              onChange={(event) =>
                setSpeed(
                  Number(
                    event.target.value
                  )
                )
              }
              className="w-24"
            />

            <span className="w-8 text-center text-xs opacity-70">
              {speed.toFixed(1)}×
            </span>

          </div>

          <div className="mx-2 h-6 w-px bg-current/10" />

          <div className="flex items-center">

            <button
              onClick={() =>
                setFontSize(
                  (value) =>
                    Math.max(
                      24,
                      value - 2
                    )
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs opacity-65 hover:bg-current/10 hover:opacity-100"
            >
              A−
            </button>

            <span className="w-8 text-center text-xs opacity-50">
              {fontSize}
            </span>

            <button
              onClick={() =>
                setFontSize(
                  (value) =>
                    Math.min(
                      80,
                      value + 2
                    )
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs opacity-65 hover:bg-current/10 hover:opacity-100"
            >
              A+
            </button>

          </div>

          <button
            onClick={() =>
              setShowMoreControls(
                (value) => !value
              )
            }
            className={`ml-1 flex h-10 items-center gap-2 rounded-xl px-3 text-xs transition ${
              showMoreControls
                ? "bg-current/10"
                : "opacity-70 hover:bg-current/10 hover:opacity-100"
            }`}
          >

            <span>
              {showMoreControls
                ? "Less"
                : "More"}
            </span>

            <span
              className={`transition-transform ${
                showMoreControls
                  ? "rotate-180"
                  : ""
              }`}
            >
              ˅
            </span>

          </button>

          {showMoreControls && (
            <>

              <div className="mx-2 h-6 w-px bg-current/10" />

              <select
                value={fontFamily}
                onChange={(event) =>
                  setFontFamily(
                    event.target
                      .value as FontFamily
                  )
                }
                className={`rounded-xl px-3 py-2 text-xs outline-none ${
                  theme === "light"
                    ? "bg-black/5"
                    : "bg-white/10"
                }`}
                style={{
                  fontFamily:
                    fontStack,
                  fontWeight,
                }}
              >

                <option value="inter">
                  Inter
                </option>

                <option value="dm-sans">
                  DM Sans
                </option>

                <option value="manrope">
                  Manrope
                </option>

                <option value="roboto-slab">
                  Roboto Slab
                </option>

                <option value="lora">
                  Lora
                </option>

                <option value="jetbrains">
                  JetBrains Mono
                </option>

              </select>

              <button
                onClick={() =>
                  setAlignment(
                    (value) =>
                      value ===
                      "center"
                        ? "left"
                        : "center"
                  )
                }
                className="rounded-xl px-3 py-2 text-xs opacity-70 hover:bg-current/10 hover:opacity-100"
              >
                {alignment ===
                "center"
                  ? "Center"
                  : "Left"}
              </button>

              <select
                value={theme}
                onChange={(event) =>
                  setTheme(
                    event.target
                      .value as Theme
                  )
                }
                className={`rounded-xl px-3 py-2 text-xs outline-none ${
                  theme === "light"
                    ? "bg-black/5"
                    : "bg-white/10"
                }`}
              >

                <option value="dark">
                  Dark
                </option>

                <option value="light">
                  Light
                </option>

                <option value="contrast">
                  Contrast
                </option>

              </select>

              <button
                onClick={() =>
                  setShowGuide(
                    (value) => !value
                  )
                }
                className={`rounded-xl px-3 py-2 text-xs ${
                  showGuide
                    ? "bg-current/10"
                    : "opacity-45"
                }`}
              >
                Guide
              </button>

              <button
                onClick={() =>
                  setIsMirrored(
                    (value) => !value
                  )
                }
                className={`rounded-xl px-3 py-2 text-xs ${
                  isMirrored
                    ? "bg-current/10"
                    : "opacity-45"
                }`}
              >
                Mirror
              </button>

            </>
          )}

        </div>

      </div>

      {!isPlaying &&
        progress === 0 &&
        !countdown && (
          <div
            className={`pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 text-center text-xs transition-opacity duration-500 ${
              showControls
                ? "opacity-40"
                : "opacity-0"
            }`}
          >
            Press Space to start
          </div>
        )}

    </div>
  );
}

export default App;