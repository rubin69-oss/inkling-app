"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { BookOpen, Search, Feather, Loader2, X, ImageOff, Download, Palette, Wand2, ArrowRight, Check, Menu, User, Mail, Lock, Share2, WifiOff } from "lucide-react";
import { STYLE_OPTIONS, DEFAULT_STYLE } from "./lib/styles";
import { initNativeChrome, cacheLastReveal, getCachedReveal, shareImage, notifyPortraitReady } from "./lib/native";
import {
  renderPoster,
  renderWallpaper,
  renderPrint,
  renderBookTokCard,
  renderAestheticBoard,
  renderPitchDeck,
  downloadCanvas,
  downloadDataUri,
  slugify,
} from "./lib/exportArt";

const POPULAR = [
  "Pride and Prejudice",
  "The Great Gatsby",
  "Jane Eyre",
  "Dracula",
  "Sherlock Holmes",
  "Little Women",
  "Moby-Dick",
  "Wuthering Heights",
];

const EXPORT_FORMATS = [
  { id: "poster", label: "Poster" },
  { id: "wallpaper-phone", label: "Wallpaper (Phone)" },
  { id: "wallpaper-desktop", label: "Wallpaper (Desktop)" },
  { id: "print", label: "Print (300 DPI)" },
  { id: "booktok", label: "BookTok Art Card" },
  { id: "aesthetic", label: "Aesthetic Board" },
  { id: "pitch", label: "Manuscript Pitch Deck" },
];

const MAX_SCENES = 4;

const PRICING_TIERS = [
  {
    id: "peek",
    name: "Peek",
    price: "Free",
    period: null,
    popular: false,
    features: ["3 starter credits, on us", "3 starter art styles", "Standard resolution"],
  },
  {
    id: "reader",
    name: "Reader Pack",
    price: "$4.99",
    period: "one-time",
    popular: true,
    features: ["20 reveal credits", "All 10 art styles", "No watermark", "Scene consistency", "Credits never expire"],
  },
  {
    id: "bibliophile",
    name: "Bibliophile Pack",
    price: "$9.99",
    period: "one-time",
    popular: false,
    features: ["60 reveal credits", "Everything in Reader Pack", "5 high-res downloads", "Early style access", "Credits never expire"],
  },
];

const CAST_REVIEWS = [
  {
    name: "Elizabeth Bennet",
    book: "Pride and Prejudice",
    quote: "I confess I did not expect to be rendered quite so becomingly. Mr. Darcy would certainly approve.",
  },
  {
    name: "Heathcliff",
    book: "Wuthering Heights",
    quote: "It has caught the moor's fury in my eyes. Cathy would know me at once.",
  },
  {
    name: "Sherlock Holmes",
    book: "The Adventures of Sherlock Holmes",
    quote: "Elementary — the likeness is exact down to the cheekbones. Watson will be astonished.",
  },
  {
    name: "Jonathan Harker",
    book: "Dracula",
    quote: "Rendered in exactly the shadow I remember from that terrible night in Transylvania.",
  },
  {
    name: "Jay Gatsby",
    book: "The Great Gatsby",
    quote: "Old sport, this portrait catches the green light in my eye precisely. Daisy would know me across the bay.",
  },
  {
    name: "Captain Ahab",
    book: "Moby-Dick",
    quote: "The eyes are right — that same fire chasing the white whale. Ishmael himself couldn't have set it down truer.",
  },
];

const HERO_CARDS = [
  {
    name: "Elizabeth",
    src: "/hero/elizabeth.png",
    style: { left: "1%", top: "8%", width: "37%", height: "55%", "--tilt": "-9deg", zIndex: 1 },
  },
  {
    name: "Jane",
    src: "/hero/jane-eyre.png",
    style: { left: "65%", top: "10%", width: "33%", height: "54%", "--tilt": "10deg", zIndex: 2 },
  },
  {
    name: "Heathcliff",
    src: "/hero/heathcliff.png",
    style: { left: "34%", top: "1%", width: "40%", height: "63%", "--tilt": "3deg", zIndex: 3 },
  },
];

function HeroCards() {
  return (
    <div className="hero-card-stack">
      {HERO_CARDS.map((c) => (
        <div key={c.name} className="hero-photo-card" style={c.style}>
          <img src={c.src} alt={`AI-generated portrait of ${c.name}`} />
          <div className="hero-photo-label">{c.name}</div>
        </div>
      ))}
    </div>
  );
}

function stripQuotes(s) {
  return s.replace(/^[\s"'“‘]+/, "").replace(/[\s"'”’]+$/, "").trim();
}

function StylePicker({ value, onChange }) {
  return (
    <div className="style-picker">
      {STYLE_OPTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={"style-pill" + (value === s.id ? " active" : "")}
          onClick={() => onChange(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function CharacterCard({ c, book, tilt, defaultStyle, onDismiss }) {
  const [image, setImage] = useState(null);
  const [imgStatus, setImgStatus] = useState("idle"); // idle | loading | done | error
  const [style, setStyle] = useState(defaultStyle);
  const [exportKind, setExportKind] = useState("poster");
  const [exporting, setExporting] = useState(false);
  const [scenes, setScenes] = useState([]); // { sceneText, status, image }
  const [sceneText, setSceneText] = useState("");
  const [sharing, setSharing] = useState(false);

  const fetchPortrait = (useStyle) => {
    setImgStatus("loading");
    setScenes([]);
    fetch("/api/portrait", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: c.name,
        book,
        era: c.era,
        appearance: c.appearance,
        style: useStyle,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.image) {
          setImage(data.image);
          setImgStatus("done");
          notifyPortraitReady(c.name);
        } else {
          setImgStatus("error");
        }
      })
      .catch(() => setImgStatus("error"));
  };

  const paintNow = () => fetchPortrait(style);

  const retry = () => fetchPortrait(style);

  const changeStyle = (newStyle) => {
    setStyle(newStyle);
    if (imgStatus === "done" || imgStatus === "error") {
      fetchPortrait(newStyle);
    }
  };

  const generateScene = () => {
    if (!sceneText.trim() || imgStatus !== "done" || !image || scenes.length >= MAX_SCENES) return;
    const text = sceneText.trim();
    setSceneText("");
    const idx = scenes.length;
    setScenes((prev) => [...prev, { sceneText: text, status: "loading", image: null }]);
    fetch("/api/scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceImage: image, name: c.name, book, scene: text, style }),
    })
      .then((r) => r.json())
      .then((data) => {
        setScenes((prev) =>
          prev.map((s, i) => (i === idx ? { ...s, status: data.image ? "done" : "error", image: data.image || null } : s))
        );
      })
      .catch(() => {
        setScenes((prev) => prev.map((s, i) => (i === idx ? { ...s, status: "error" } : s)));
      });
  };

  const removeScene = (idx) => {
    setScenes((prev) => prev.filter((_, i) => i !== idx));
  };

  const quote = c.quotes && c.quotes.length > 0 ? stripQuotes(c.quotes[0]) : null;
  const slug = slugify(`${c.name}-${book}`);
  const styleLabel = STYLE_OPTIONS.find((s) => s.id === style)?.label || "";

  const doExport = async () => {
    if (!image || imgStatus !== "done") return;
    setExporting(true);
    try {
      let canvas;
      if (exportKind === "poster") {
        canvas = await renderPoster({ imageSrc: image, name: c.name, book, quote });
        downloadCanvas(canvas, `${slug}-poster.png`);
      } else if (exportKind === "wallpaper-phone") {
        canvas = await renderWallpaper({ imageSrc: image, name: c.name, book }, "phone");
        downloadCanvas(canvas, `${slug}-wallpaper-phone.png`);
      } else if (exportKind === "wallpaper-desktop") {
        canvas = await renderWallpaper({ imageSrc: image, name: c.name, book }, "desktop");
        downloadCanvas(canvas, `${slug}-wallpaper-desktop.png`);
      } else if (exportKind === "print") {
        canvas = await renderPrint({ imageSrc: image, name: c.name, book, quote });
        downloadCanvas(canvas, `${slug}-print.png`);
      } else if (exportKind === "booktok") {
        canvas = await renderBookTokCard({ imageSrc: image, name: c.name, book, quote, era: c.era, styleLabel });
        downloadCanvas(canvas, `${slug}-booktok.png`);
      } else if (exportKind === "aesthetic") {
        const sceneImages = scenes.filter((s) => s.status === "done").map((s) => s.image);
        canvas = await renderAestheticBoard({
          mainImageSrc: image,
          sceneImages,
          name: c.name,
          book,
          quote,
          era: c.era,
          styleLabel,
        });
        downloadCanvas(canvas, `${slug}-aesthetic-board.png`);
      } else if (exportKind === "pitch") {
        canvas = await renderPitchDeck({ imageSrc: image, name: c.name, book, blurb: c.blurb, bio: c.bio, quote, era: c.era });
        downloadCanvas(canvas, `${slug}-pitch-deck.png`);
      }
    } finally {
      setExporting(false);
    }
  };

  const doShare = async () => {
    if (!image || imgStatus !== "done" || sharing) return;
    setSharing(true);
    try {
      await shareImage(image, `${slug}.png`, `${c.name} — ${book}`);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="index-card" style={{ "--tilt": `${tilt}deg` }}>
      <div className="portrait-frame">
        {imgStatus === "idle" && (
          <button className="paint-prompt" onClick={paintNow} aria-label={`Paint a portrait of ${c.name}`}>
            <Wand2 size={22} />
            <span>Paint this portrait</span>
          </button>
        )}
        {imgStatus === "loading" && (
          <div className="portrait-skeleton">
            <Loader2 className="spin" size={22} />
            <span>painting…</span>
          </div>
        )}
        {imgStatus === "done" && image && (
          <img src={image} alt={`AI-generated portrait of ${c.name}`} />
        )}
        {imgStatus === "error" && (
          <div className="portrait-skeleton">
            <ImageOff size={20} />
            <span>couldn't render</span>
          </div>
        )}
        <button
          className="portrait-close"
          onClick={onDismiss}
          aria-label={`Remove ${c.name} from these results`}
          title={`Remove ${c.name}`}
        >
          <X size={14} />
        </button>
      </div>
      <div className="card-name">{c.name}</div>
      <div className="card-book">{book}</div>
      {c.era && <div className="card-era">{c.era}</div>}
      <div className="card-blurb">{c.blurb}</div>
      {c.bio && <div className="card-bio">{c.bio}</div>}
      {quote && <blockquote className="card-quote">&ldquo;{quote}&rdquo;</blockquote>}

      {imgStatus === "error" && (
        <button className="card-retry" onClick={retry}>
          Try rendering again
        </button>
      )}

      <div className="card-style-row">
        <Palette size={13} className="style-icon" />
        <select
          className="style-select"
          value={style}
          onChange={(e) => changeStyle(e.target.value)}
          disabled={imgStatus === "loading"}
          aria-label={`Art style for ${c.name}`}
        >
          {STYLE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {imgStatus === "done" && (
        <>
          <div className="scene-section">
            <div className="scene-label">Same character, new scene</div>
            <div className="scene-row">
              <input
                className="scene-input"
                placeholder="e.g. wearing armor at dawn, in a moonlit garden…"
                value={sceneText}
                onChange={(e) => setSceneText(e.target.value)}
                disabled={scenes.length >= MAX_SCENES}
              />
              <button
                className="scene-btn"
                onClick={generateScene}
                disabled={!sceneText.trim() || scenes.some((s) => s.status === "loading") || scenes.length >= MAX_SCENES}
                aria-label="Paint this scene with the same character"
              >
                {scenes.some((s) => s.status === "loading") ? (
                  <Loader2 className="spin" size={12} />
                ) : (
                  <Wand2 size={12} />
                )}
              </button>
            </div>
            {scenes.length > 0 && (
              <div className="scene-filmstrip">
                {scenes.map((s, i) => (
                  <div
                    key={i}
                    className={"scene-thumb" + (s.status === "error" ? " error" : "")}
                    title={s.status === "done" ? `Download: ${s.sceneText}` : s.sceneText}
                    onClick={() => s.status === "done" && downloadDataUri(s.image, `${slug}-scene-${i + 1}.png`)}
                  >
                    {s.status === "loading" && <Loader2 className="spin" size={14} />}
                    {s.status === "done" && <img src={s.image} alt={`${c.name} — ${s.sceneText}`} />}
                    {s.status === "error" && <ImageOff size={14} />}
                    <button
                      className="scene-thumb-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScene(i);
                      }}
                      aria-label={`Remove this scene`}
                      title="Remove this scene"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {scenes.length >= MAX_SCENES && <div className="scene-limit">Up to {MAX_SCENES} scenes per character</div>}
          </div>

          <div className="export-row">
            <select
              className="export-select"
              value={exportKind}
              onChange={(e) => setExportKind(e.target.value)}
              aria-label={`Export format for ${c.name}`}
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <button className="export-btn" onClick={doExport} disabled={exporting}>
              {exporting ? <Loader2 className="spin" size={12} /> : <Download size={12} />}
              Download
            </button>
            <button className="export-btn share-btn" onClick={doShare} disabled={sharing} title={`Share ${c.name}`}>
              {sharing ? <Loader2 className="spin" size={12} /> : <Share2 size={12} />}
              Share
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OutOfCreditsModal({ onClose, onBuy, checkoutLoadingPlan }) {
  const packs = PRICING_TIERS.filter((t) => t.id !== "peek");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box credit-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h3 className="credit-modal-title">Out of reveal credits</h3>
        <p className="credit-modal-sub">
          You've used all your free credits. Grab a pack to keep revealing characters.
        </p>
        <div className="credit-pack-list">
          {packs.map((tier) => (
            <div key={tier.id} className={"credit-pack-row" + (tier.popular ? " popular" : "")}>
              <div className="credit-pack-info">
                <div className="credit-pack-name">
                  {tier.name}
                  {tier.popular && <span className="credit-pack-badge">Most popular</span>}
                </div>
                <div className="credit-pack-price">
                  {tier.price} <span className="credit-pack-period">{tier.period}</span>
                </div>
                <div className="credit-pack-credits">{tier.features[0]}</div>
              </div>
              <button
                className="go-btn credit-pack-btn"
                type="button"
                onClick={() => onBuy(tier.id)}
                disabled={checkoutLoadingPlan === tier.id}
              >
                {checkoutLoadingPlan === tier.id ? <Loader2 className="spin" size={14} /> : "Buy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthModal({ mode, onModeChange, onClose, onAuthed }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | confirm
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("idle"); // idle | loading | sent | error
  const [forgotError, setForgotError] = useState("");

  const switchMode = (m) => {
    onModeChange(m);
    setStatus("idle");
    setError("");
    setShowForgot(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(mode === "signin" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signin" ? { email, password } : { email, password, name }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setStatus("error");
        setError(data.error || "Something went wrong.");
        return;
      }

      if (mode === "signup" && data.needsConfirmation) {
        setStatus("confirm");
        return;
      }

      onAuthed(data.user);
      onClose();
    } catch (err) {
      setStatus("error");
      setError("Couldn't reach the server. Try again.");
    }
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus("loading");
    setForgotError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setForgotStatus("error");
        setForgotError(data.error || "Something went wrong.");
        return;
      }

      setForgotStatus("sent");
    } catch (err) {
      setForgotStatus("error");
      setForgotError("Couldn't reach the server. Try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {showForgot ? (
          <>
            <button
              type="button"
              className="modal-back-link"
              onClick={() => {
                setShowForgot(false);
                setForgotStatus("idle");
                setForgotError("");
              }}
            >
              ← Back to sign in
            </button>
            {forgotStatus === "sent" ? (
              <p className="modal-note modal-confirm">
                If <strong>{email}</strong> has an Inkling account, a password reset link is on its
                way. Click it to set a new password.
              </p>
            ) : (
              <>
                <form className="modal-form" onSubmit={onForgotSubmit}>
                  <div className="field modal-field">
                    <Mail className="icon" />
                    <input
                      type="email"
                      placeholder="Email address"
                      aria-label="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button className="go-btn modal-submit" type="submit" disabled={forgotStatus === "loading"}>
                    {forgotStatus === "loading" ? <Loader2 className="spin" size={16} /> : "Send Reset Link"}
                  </button>
                </form>
                {forgotStatus === "error" && <p className="modal-error">{forgotError}</p>}
              </>
            )}
          </>
        ) : (
          <>
            <div className="modal-tabs">
              <button
                type="button"
                className={"modal-tab" + (mode === "signin" ? " active" : "")}
                onClick={() => switchMode("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={"modal-tab" + (mode === "signup" ? " active" : "")}
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>
            </div>

            {status === "confirm" ? (
              <p className="modal-note modal-confirm">
                Almost there — we sent a confirmation link to <strong>{email}</strong>. Click it,
                then sign in here.
              </p>
            ) : (
              <>
                <form className="modal-form" onSubmit={onSubmit}>
                  {mode === "signup" && (
                    <div className="field modal-field">
                      <User className="icon" />
                      <input
                        type="text"
                        placeholder="Your name"
                        aria-label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="field modal-field">
                    <Mail className="icon" />
                    <input
                      type="email"
                      placeholder="Email address"
                      aria-label="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field modal-field">
                    <Lock className="icon" />
                    <input
                      type="password"
                      placeholder="Password"
                      aria-label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                  {mode === "signin" && (
                    <button type="button" className="modal-forgot-link" onClick={() => setShowForgot(true)}>
                      Forgot password?
                    </button>
                  )}
                  <button className="go-btn modal-submit" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? (
                      <Loader2 className="spin" size={16} />
                    ) : mode === "signin" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
                {status === "error" && <p className="modal-error">{error}</p>}
                <p className="modal-note">
                  Real accounts, stored in Supabase. Passwords are never visible to us in plain text.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState("title"); // 'title' | 'passage'
  const [book, setBook] = useState("");
  const [showBookSuggestions, setShowBookSuggestions] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [character, setCharacter] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [excerptSource, setExcerptSource] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error | empty | outofcredits
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [hiddenNames, setHiddenNames] = useState([]);
  const [globalStyle, setGlobalStyle] = useState(DEFAULT_STYLE);
  const [navOpen, setNavOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null | 'signin' | 'signup'
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const resultsRef = useRef(null);
  const appRef = useRef(null);
  const aboutRef = useRef(null);
  const reviewsRef = useRef(null);
  const pricingRef = useRef(null);

  const [offline, setOffline] = useState(false);

  useEffect(() => {
    initNativeChrome();
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => setCredits(null));
  }, [user]);

  const signOut = async () => {
    setNavOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const buyCredits = async (planId) => {
    if (!user) {
      setAuthMode("signin");
      return;
    }
    setCheckoutLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutLoadingPlan(null);
      }
    } catch {
      setCheckoutLoadingPlan(null);
    }
  };

  const scrollToRef = (ref) => {
    setNavOpen(false);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToApp = () => scrollToRef(appRef);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const refreshCredits = () => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => {});
  };

  const runSearch = async (bookTitle, characterName = "") => {
    if (!bookTitle.trim()) return;
    if (!user) {
      setAuthMode("signin");
      return;
    }
    setStatus("loading");
    setResult(null);
    setHiddenNames([]);
    setErrorMessage("");
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: bookTitle, character: characterName }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setStatus("idle");
        setAuthMode("signin");
        return;
      } else if (res.status === 402) {
        setStatus("outofcredits");
        setErrorMessage(data.error || "You're out of reveal credits.");
      } else if (!res.ok || data.error) {
        setStatus("error");
      } else if (!data.found || !data.characters || data.characters.length === 0) {
        setStatus("empty");
      } else {
        setResult(data);
        setStatus("done");
        setOffline(false);
        cacheLastReveal({ book: bookTitle, characters: data.characters });
        refreshCredits();
      }
    } catch (e) {
      const cached = await getCachedReveal();
      if (cached) {
        setResult(cached);
        setStatus("done");
        setOffline(true);
      } else {
        setStatus("error");
      }
    }
    scrollToResults();
  };

  const runExtract = async () => {
    if (!excerpt.trim()) return;
    if (!user) {
      setAuthMode("signin");
      return;
    }
    setStatus("loading");
    setResult(null);
    setHiddenNames([]);
    setErrorMessage("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excerpt, source: excerptSource }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setStatus("idle");
        setAuthMode("signin");
        return;
      } else if (res.status === 402) {
        setStatus("outofcredits");
        setErrorMessage(data.error || "You're out of reveal credits.");
      } else if (!res.ok || data.error) {
        setStatus("error");
      } else if (!data.found || !data.character) {
        setStatus("empty");
      } else {
        const passageResult = { book: data.book || excerptSource || "Untitled passage", characters: [data.character] };
        setResult(passageResult);
        setStatus("done");
        setOffline(false);
        cacheLastReveal(passageResult);
        refreshCredits();
      }
    } catch (e) {
      const cached = await getCachedReveal();
      if (cached) {
        setResult(cached);
        setStatus("done");
        setOffline(true);
      } else {
        setStatus("error");
      }
    }
    scrollToResults();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (mode === "title") {
      runSearch(book, character);
    } else {
      runExtract();
    }
  };

  const onChip = (title) => {
    setMode("title");
    setBook(title);
    setCharacter("");
    runSearch(title, "");
  };

  const pickSuggestion = (title) => {
    setBook(title);
    setShowBookSuggestions(false);
  };

  useEffect(() => {
    const q = book.trim();
    if (q.length < 2) {
      setBookSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const handle = setTimeout(() => {
      fetch(`/api/book-search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          const results = (data.titles || []).filter((t) => t.title.toLowerCase() !== q.toLowerCase());
          setBookSuggestions(results.slice(0, 6));
        })
        .catch(() => setBookSuggestions([]))
        .finally(() => setSuggestLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [book]);

  return (
    <div>
      <header className="site-nav">
        <div className="brand">
          <Image src="/logo-icon.png" alt="" width={34} height={34} className="brand-mark" priority unoptimized />
          <span className="brand-name">Inkling</span>
          <span className="brand-tag">· characters, reimagined</span>
        </div>

        <nav className={"nav-links" + (navOpen ? " open" : "")}>
          <button type="button" className="nav-link" onClick={() => scrollToRef(aboutRef)}>
            About Us
          </button>
          <a href="/features" className="nav-link">
            Features
          </a>
          <a href="/gallery" className="nav-link">
            Gallery
          </a>
          <a href="/blog" className="nav-link">
            Blog
          </a>
          <a href="/faq" className="nav-link">
            FAQ
          </a>
          <button type="button" className="nav-link" onClick={() => scrollToRef(reviewsRef)}>
            Reviews
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToRef(pricingRef)}>
            Pricing
          </button>
        </nav>

        <div className="nav-right">
          <div className="nav-auth">
            {!userLoading && user ? (
              <>
                <span className="nav-user">{user.email}</span>
                {credits !== null && (
                  <span className="nav-credits" title="Reveal credits remaining">
                    {credits} credit{credits === 1 ? "" : "s"}
                  </span>
                )}
                <button type="button" className="btn-ghost" onClick={signOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-ghost" onClick={() => setAuthMode("signin")}>
                  Sign In
                </button>
                <button type="button" className="btn-solid-sm" onClick={() => setAuthMode("signup")}>
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="nav-burger"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {authMode && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onAuthed={setUser}
        />
      )}

      {status === "outofcredits" && (
        <OutOfCreditsModal
          onClose={() => setStatus("idle")}
          onBuy={(planId) => {
            setStatus("idle");
            buyCredits(planId);
          }}
          checkoutLoadingPlan={checkoutLoadingPlan}
        />
      )}

      <section className="landing-hero">
        <div className="landing-grid">
          <div className="landing-copy">
            <div className="landing-eyebrow">Inkling</div>
            <h1>
              Every character you've <em>pictured</em>, finally standing still.
            </h1>
            <p className="landing-sub">Name a book. Watch its characters come to life.</p>
            <button type="button" className="cta-btn" onClick={scrollToApp}>
              Try it free
              <ArrowRight size={16} />
            </button>
            <p className="landing-note">Free account, 3 reveal credits on us to start.</p>
          </div>
          <div className="landing-illustration">
            <HeroCards />
          </div>
        </div>
      </section>

      <section className="hero" ref={appRef}>
        <p className="sub app-sub">
          Name a book — or paste a passage straight from the page — and Inkling reads it, casts
          its characters, and paints each one as an original portrait.
        </p>

        <div className="mode-tabs">
          <button
            type="button"
            className={"mode-tab" + (mode === "title" ? " active" : "")}
            onClick={() => setMode("title")}
          >
            By Book Title
          </button>
          <button
            type="button"
            className={"mode-tab" + (mode === "passage" ? " active" : "")}
            onClick={() => setMode("passage")}
          >
            Paste a Passage
          </button>
        </div>

        <form className="search-card" onSubmit={onSubmit}>
          {mode === "title" ? (
            <>
              <div className="search-row">
                <div className="field">
                  <BookOpen className="icon" />
                  <input
                    type="text"
                    placeholder="A book title — Dracula, Emma, Beloved…"
                    value={book}
                    onChange={(e) => {
                      setBook(e.target.value);
                      setShowBookSuggestions(true);
                    }}
                    onFocus={() => setShowBookSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowBookSuggestions(false), 150)}
                    aria-label="Book title"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showBookSuggestions && bookSuggestions.length > 0}
                    aria-autocomplete="list"
                  />
                  {showBookSuggestions && (suggestLoading || bookSuggestions.length > 0) && (
                    <ul className="book-suggestions" role="listbox">
                      {suggestLoading && bookSuggestions.length === 0 && (
                        <li className="book-suggestions-loading">
                          <Loader2 className="spin" size={13} /> Searching…
                        </li>
                      )}
                      {bookSuggestions.map((s) => (
                        <li key={s.title} role="option" aria-selected="false">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickSuggestion(s.title)}
                          >
                            <span className="suggestion-title">{s.title}</span>
                            {s.author && <span className="suggestion-author">{s.author}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className="go-btn" type="submit" disabled={status === "loading" || userLoading || !book.trim()}>
                  {status === "loading" ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
                  Reveal characters
                </button>
              </div>
              <div className="field" style={{ marginTop: 10 }}>
                <Feather className="icon" />
                <input
                  type="text"
                  placeholder="One character in mind? Name them (optional)"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  aria-label="Character name, optional"
                />
              </div>
            </>
          ) : (
            <>
              <textarea
                className="excerpt-field"
                placeholder={`Paste a passage that describes a character, e.g.:\n"He was a tall, thin man, with a beak-like nose, sallow skin, and eyes of a peculiarly light gray..."`}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={6}
                aria-label="Book passage"
              />
              <div className="search-row" style={{ marginTop: 10 }}>
                <div className="field">
                  <BookOpen className="icon" />
                  <input
                    type="text"
                    placeholder="Source title (optional)"
                    value={excerptSource}
                    onChange={(e) => setExcerptSource(e.target.value)}
                    aria-label="Source title, optional"
                  />
                </div>
                <button className="go-btn" type="submit" disabled={status === "loading" || userLoading || !excerpt.trim()}>
                  {status === "loading" ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
                  Extract &amp; Reveal
                </button>
              </div>
            </>
          )}

          <div className="style-label">Art style</div>
          <StylePicker value={globalStyle} onChange={setGlobalStyle} />
        </form>

        {mode === "title" && (
          <div className="chips">
            {POPULAR.map((title) => (
              <button key={title} className="chip" onClick={() => onChip(title)}>
                {title}
              </button>
            ))}
          </div>
        )}
      </section>

      <div ref={resultsRef}>
        {status === "loading" && (
          <div className="section" style={{ paddingTop: 10 }}>
            <p className="state-box">
              {mode === "title"
                ? `Reading ${book ? `"${book}"` : "the book"}, and looking closely at who's in it…`
                : "Reading that passage, and extracting who's in it…"}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="section" style={{ paddingTop: 10 }}>
            <p className="state-box">
              The casting call didn't go through. Check your API keys in <code>.env.local</code>,
              or try again in a moment.
            </p>
          </div>
        )}

        {status === "empty" && (
          <div className="section" style={{ paddingTop: 10 }}>
            <p className="state-box">
              {mode === "title"
                ? `The card catalog came up empty for "${book}." Check the spelling, or try one of the titles above.`
                : "Couldn't find a character in that passage. Try pasting a section with more physical description."}
            </p>
          </div>
        )}

        {status === "done" && result && (
          <div className="section" style={{ paddingTop: 10 }}>
            {offline && (
              <div className="offline-banner">
                <WifiOff size={14} />
                You're offline — showing your last revealed cast.
              </div>
            )}
            <div className="results-title">{result.book}</div>
            <div className="results-sub">Cast revealed</div>
            <div className="card-grid">
              {result.characters
                .filter((c) => !hiddenNames.includes(c.name))
                .map((c, i) => (
                  <CharacterCard
                    key={c.name + i}
                    c={c}
                    book={result.book}
                    tilt={(i % 2 === 0 ? -1 : 1) * (1.2 + (i % 3))}
                    defaultStyle={globalStyle}
                    onDismiss={() => setHiddenNames((prev) => [...prev, c.name])}
                  />
                ))}
            </div>
            <div className="clear-row">
              <button
                className="clear-btn"
                onClick={() => {
                  setStatus("idle");
                  setResult(null);
    setHiddenNames([]);
                }}
              >
                <X size={13} /> Start a new search
              </button>
            </div>
          </div>
        )}

        {status === "idle" && (
          <section className="section">
            <div className="section-head">
              <h2>Try a title above</h2>
              <p>Each portrait is generated fresh, right now, from your search.</p>
            </div>
          </section>
        )}
      </div>

      <section className="about-section" ref={aboutRef}>
        <div className="about-grid">
          <div className="about-copy">
            <div className="eyebrow">About Us</div>
            <h2>Built for people who read with their eyes closed</h2>
            <p>
              Inkling started from a simple itch: every reader pictures characters differently,
              and those pictures usually stay locked in your head. We built Inkling to put them on
              the page — literally. Name a book, or paste a line straight from it, and our models
              read the text the way you do: looking for the details that make a character
              memorable, then painting an original portrait from scratch.
            </p>
            <p>
              Nothing here is traced from an illustrator's artwork or a film adaptation. Every
              portrait is a fresh interpretation, generated the moment you ask for it, built only
              from the words on the page.
            </p>
          </div>
        </div>
      </section>

      <section className="reviews-section" ref={reviewsRef}>
        <div className="pricing-head">
          <div className="eyebrow">Reviews</div>
          <h2>What the cast has to say</h2>
          <p className="reviews-sub">
            Real reveals, imagined reactions — the characters weigh in on their own portraits.
          </p>
        </div>
        <div className="reviews-grid">
          {CAST_REVIEWS.map((r) => (
            <div key={r.name} className="review-card">
              <p className="review-quote">&ldquo;{r.quote}&rdquo;</p>
              <div className="review-name">{r.name}</div>
              <div className="review-book">{r.book}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing-section" ref={pricingRef}>
        <div className="pricing-head">
          <div className="eyebrow">Pricing</div>
          <h2>Choose your plan</h2>
        </div>
        <div className="pricing-grid">
          {PRICING_TIERS.map((tier) => (
            <div key={tier.id} className={"price-card" + (tier.popular ? " popular" : "")}>
              {tier.popular && <div className="popular-badge">Most popular</div>}
              <div className="price-tier">{tier.name}</div>
              <div className="price-amount">
                {tier.price}
                {tier.period && <span className="price-period">{tier.period}</span>}
              </div>
              <ul className="price-features">
                {tier.features.map((f) => (
                  <li key={f} className="price-feature">
                    <Check size={15} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.id !== "peek" && (
                <div className="price-cta">
                  <button
                    className="price-btn"
                    type="button"
                    onClick={() => buyCredits(tier.id)}
                    disabled={checkoutLoadingPlan === tier.id}
                  >
                    {checkoutLoadingPlan === tier.id ? <Loader2 className="spin" size={14} /> : "Buy Credits"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer>
        <strong>Inkling</strong> — portraits are original AI illustrations built from the text,
        not photographs of any real person. Every title above is public domain.
        <div className="footer-links">
          <button type="button" onClick={() => scrollToRef(aboutRef)}>About Us</button>
          <a href="/features">Features</a>
          <a href="/gallery">Gallery</a>
          <a href="/blog">Blog</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/cookies">Cookie Policy</a>
          <a href="/security">Security</a>
          <a href="/ai-policy">AI Policy</a>
          <a href="/contact">Contact Us</a>
        </div>
        <div className="footer-copyright">© 2026 Inkling. All rights reserved.</div>
      </footer>
    </div>
  );
}
