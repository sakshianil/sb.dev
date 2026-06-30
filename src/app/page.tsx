"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const MIN_ZOOM = 0.38;
const MAX_ZOOM = 1.14;
const UNLOCK_ZOOM = 0.46;

const projects = [
  {
    title: "AI Career Ops",
    year: "2026",
    skills: ["Next.js", "Automation", "Agents", "Data"],
    description:
      "A local-first workflow for researching roles, preparing applications, and keeping the human approval step visible before anything is submitted.",
    image: "/images/writing-buddy.png",
    alt: "Application workspace screenshot",
  },
  {
    title: "Website Cloner",
    year: "2026",
    skills: ["TypeScript", "Next.js", "UI", "Reverse Engineering"],
    description:
      "A clean implementation of the retro computer portfolio pattern, adapted into a modern Next app while keeping the pixel typography, terminal language, and long-scroll rhythm.",
    image: "/images/edsites.png",
    alt: "Retro website screenshot",
  },
  {
    title: "Agent Experiments",
    year: "2025-26",
    skills: ["LangChain", "Python", "Evaluation", "UX"],
    description:
      "Experiments around agentic workflows, prompt systems, and pragmatic interfaces that make automation useful without hiding what it is doing.",
    image: "/images/cyber-heist.png",
    alt: "Digital project preview",
  },
  {
    title: "Creative Systems",
    year: "Ongoing",
    skills: ["Design", "Research", "Content", "Prototyping"],
    description:
      "Small tools, polished web surfaces, and research artifacts that turn rough ideas into something testable, readable, and easier to share.",
    image: "/images/pavilion.png",
    alt: "Rendered design preview",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 .2a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.6-.9-2.6-.9-.3-.8-.8-1-.8-1-.7-.5.1-.5.1-.5.7.1 1.1.8 1.1.8.7 1.1 1.7.8 2.2.6.1-.5.3-.8.5-1-1.7-.2-3.5-.9-3.5-3.8 0-.8.3-1.6.8-2.1-.1-.2-.3-1 .1-2.1 0 0 .7-.2 2.2.8A7.5 7.5 0 0 1 8 4.1c.7 0 1.4.1 2 .3 1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3-1.8 3.6-3.5 3.8.3.3.5.8.5 1.5v2.2c0 .2.1.5.5.4A8 8 0 0 0 8 .2Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M2.1 3.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6ZM.4 5h3.5v10.8H.4V5Zm5.6 0h3.4v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.1 2.3 4.1 5.2v5.9h-3.5v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.3H6V5Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <rect width="16" height="3" />
      <rect y="6.5" width="16" height="3" />
      <rect y="13" width="16" height="3" />
    </svg>
  );
}

export default function Home() {
  const [zoom, setZoom] = useState(() => (typeof window !== "undefined" && window.innerWidth < 760 ? 0.68 : 0.82));
  const [typed, setTyped] = useState("");
  const [history, setHistory] = useState<string[]>(["SBOS v0.2", "boot: keyboard and camera online"]);
  const stageRef = useRef<HTMLElement | null>(null);
  const unlocked = zoom <= UNLOCK_ZOOM;

  const terminalLines = useMemo(() => {
    const text = typed || "type here";
    return [...history.slice(-4), "~/home/user $ show title.md", `~/home/user $ ${text}`];
  }, [history, typed]);

  useEffect(() => {
    document.body.dataset.unlocked = unlocked ? "true" : "false";
    document.body.style.overflow = unlocked ? "" : "hidden";

    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.unlocked;
    };
  }, [unlocked]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        setTyped((value) => value.slice(0, -1));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        setHistory((value) => [...value, `> ${typed || "hello"}`, "ok"]);
        setTyped("");
        return;
      }

      if (event.key.length === 1) {
        event.preventDefault();
        setTyped((value) => `${value}${event.key}`.slice(-34));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [typed]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function onWheel(event: WheelEvent) {
      const nextZoom = clamp(zoom - event.deltaY * 0.0014, MIN_ZOOM, MAX_ZOOM);
      const stillZooming = !unlocked || nextZoom > UNLOCK_ZOOM || event.deltaY < 0;

      if (stillZooming) {
        event.preventDefault();
        setZoom(nextZoom);
      }
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [unlocked, zoom]);

  function zoomBy(amount: number) {
    setZoom((value) => clamp(value + amount, MIN_ZOOM, MAX_ZOOM));
  }

  return (
    <>
      <input id="menu-toggle" className="menu-toggle" type="checkbox" aria-label="Toggle navigation" />
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="menu-bar">
          <label className="retro-btn icon-btn" htmlFor="menu-toggle" title="Menu">
            <MenuIcon />
            <span className="sr-only">Menu</span>
          </label>
          <div className="socials">
            <a className="retro-btn icon-btn" href="https://github.com/sakshianil" target="_blank" rel="noreferrer" title="GitHub">
              <GithubIcon />
              <span className="sr-only">GitHub</span>
            </a>
            <a className="retro-btn icon-btn" href="https://www.linkedin.com/" target="_blank" rel="noreferrer" title="LinkedIn">
              <LinkedinIcon />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>
        <div className="menu-body">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="scroll-tip">{unlocked ? "Scroll down" : "Zoom out"}</div>
      </nav>

      <header id="home" ref={stageRef} className="hero interactive-stage" data-unlocked={unlocked ? "true" : "false"}>
        <div className="zoom-controls" aria-label="Zoom controls">
          <button className="retro-btn mini-btn" type="button" onClick={() => zoomBy(0.12)}>
            +
          </button>
          <button className="retro-btn mini-btn" type="button" onClick={() => zoomBy(-0.12)}>
            -
          </button>
        </div>
        <div className="interaction-hint">{unlocked ? "Portfolio unlocked" : "Type on the keyboard. Use mouse wheel to zoom out."}</div>

        <div className="desk" style={{ "--zoom": zoom } as CSSProperties}>
          <div className="desktop-card profile-card">
            <Image
              src="https://github.com/sakshianil.png?size=240"
              width={240}
              height={240}
              alt="Sakshi GitHub profile in retro desktop frame"
              unoptimized
            />
            <span>sakshianil</span>
          </div>
          <div className="desktop-card note-card">
            <span>sb.dev</span>
            <small>AI builder notes</small>
          </div>

          <div className="computer" aria-label="Interactive retro computer terminal">
            <div className="monitor">
              <div className="screen">
                <div className="scanlines" />
                <div className="terminal-copy">
                  {terminalLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <h1>sb.dev</h1>
                  <ul>
                    <li>AI Builder</li>
                    <li>Full Stack Explorer</li>
                    <li>Automation Designer</li>
                  </ul>
                  <div className="cursor-line">
                    <span>{typed}</span>
                    <b />
                  </div>
                </div>
              </div>
            </div>
            <div className="computer-base">
              <div className="drive-slot" />
              <div className="keys">
                {Array.from({ length: 34 }).map((_, index) => (
                  <span key={index} className={typed.length % 34 === index ? "active-key" : ""} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="content" data-ready={unlocked ? "true" : "false"}>
        <section id="about" className="section-block">
          <h2>Hi there</h2>
          <p>
            This is <strong>sb.dev</strong>, an interactive retro computer portfolio cloned from the behavior and structure of edh.dev and rebuilt
            in this Next.js template.
          </p>
          <p>
            Type anywhere to send characters to the terminal, use the mouse wheel or the buttons to zoom the computer out, and scroll after the
            portfolio unlocks.
          </p>
          <div className="terminal-panel">
            <div className="terminal-title">Available commands</div>
            <div className="command-grid">
              {["help", "ls", "cd ~/projects", "show -all"].map((command) => (
                <code key={command}>$ {command}</code>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section-block projects">
          <h2>Projects</h2>
          {projects.map((project) => (
            <article className="project" key={project.title}>
              <hr />
              <h3>{project.title}</h3>
              <p className="project-year">{project.year}</p>
              <ul className="skills">
                {project.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <p>{project.description}</p>
              <div className="image-frame">
                <Image src={project.image} width={1200} height={760} alt={project.alt} sizes="(max-width: 900px) 95vw, 900px" />
              </div>
            </article>
          ))}
        </section>

        <section id="contact" className="section-block contact">
          <h2>Contact</h2>
          <p>
            Reach out through the links in the top-left terminal controls, or keep building from this repo and connect the final production
            profiles when you are ready.
          </p>
          <a className="retro-btn" href="mailto:hello@sb.dev">hello@sb.dev</a>
        </section>
      </main>

      <footer className="footer">
        <div>Developed as sb.dev from the retro computer website reference.</div>
        <div>Original reference: edhinrichsen/retro-computer-website.</div>
      </footer>
    </>
  );
}
