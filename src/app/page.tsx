"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
const categories = [
  {
    name: "Engineering",
    description: "Build what’s next.",
    q: "engineer",
    icon: "⌘",
  },
  {
    name: "Design & creative",
    description: "Make ideas matter.",
    q: "design",
    icon: "✳",
  },
  {
    name: "Marketing",
    description: "Start a conversation.",
    q: "marketing",
    icon: "↗",
  },
  {
    name: "Business & operations",
    description: "Move things forward.",
    q: "operations",
    icon: "◈",
  },
];
export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("candidate");
  const employer = audience === "employer";
  return (
    <div className="dual-home">
      <main id="main">
        <section className="d-hero d-container">
          <div className="d-copy">
            <div className="d-audience" aria-label="Choose your journey">
              <button
                aria-pressed={!employer}
                className={!employer ? "active" : ""}
                onClick={() => setAudience("candidate")}
              >
                <Icon name="user" size={15} />
                I’m looking for work
              </button>
              <button
                aria-pressed={employer}
                className={employer ? "active" : ""}
                onClick={() => setAudience("employer")}
              >
                <Icon name="bag" size={15} />
                I’m hiring
              </button>
            </div>
            <div className="d-eyebrow">
              <span />
              GOOD PEOPLE. NEW POSSIBILITIES.
            </div>
            <h1>
              {employer ? (
                <>
                  Your next hire.
                  <br />
                  <em>A stronger team.</em>
                </>
              ) : (
                <>
                  Your next chapter.
                  <br />
                  <em>A better fit.</em>
                </>
              )}
            </h1>
            <p>
              {employer
                ? "Find the people who bring fresh skills, good ideas, and real energy to your team."
                : "Find work that fits your skills, your ambitions, and the life you want to build. Your next move starts here."}
            </p>
            {employer ? (
              <div className="d-employer-actions">
                <Link href="/register?role=employer" className="btn primary">
                  Find my next teammate <Icon name="arrow" size={18} />
                </Link>
                <Link href="/for-employers" className="text-link">
                  Explore employer tools →
                </Link>
              </div>
            ) : (
              <form
                className="d-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  const p = new URLSearchParams();
                  if (q.trim()) p.set("q", q.trim());
                  if (location.trim()) p.set("location", location.trim());
                  router.push(`/jobs?${p}`);
                }}
              >
                <label>
                  <Icon name="search" size={18} />
                  <input
                    aria-label="Job title or keyword"
                    placeholder="Job title or keyword"
                    maxLength={100}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </label>
                <label>
                  <Icon name="pin" size={18} />
                  <input
                    aria-label="Location"
                    placeholder="City or remote"
                    maxLength={150}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </label>
                <button className="btn primary">
                  Find jobs <Icon name="arrow" size={17} />
                </button>
              </form>
            )}
            <div className="d-popular">
              {employer ? (
                <>
                  <Icon name="shield" size={15} />
                  <span>Thoughtful listings. A clear hiring process.</span>
                </>
              ) : (
                <>
                  <span>Popular searches</span>
                  {["Frontend", "Design", "Remote"].map((t) => (
                    <Link
                      key={t}
                      href={
                        t === "Remote"
                          ? "/jobs?work_mode=remote"
                          : `/jobs?q=${t}`
                      }
                    >
                      {t} ↗
                    </Link>
                  ))}
                </>
              )}
            </div>
            <div className="d-proof">
              <span>
                <Icon name="shield" size={16} />
                Reviewed listings
              </span>
              <span>
                <Icon name="bookmark" size={16} />
                Personal shortlist
              </span>
              <span>
                <Icon name="bag" size={16} />
                Private resumes
              </span>
            </div>
          </div>
          <div
            className="d-preview"
            aria-label="Illustration of the jobboard workspace"
          >
            <div className="d-preview-top">
              <span className="d-window-dots">
                <i />
                <i />
                <i />
              </span>
              <span>YOUR NEXT CHAPTER</span>
              <Icon name="grid" size={15} />
            </div>
            <div className="d-preview-body">
              <div className="d-preview-intro">
                <span className="d-preview-logo">↗</span>
                <span>
                  A little clarity.
                  <br />
                  <strong>A world of possibility.</strong>
                </span>
                <span className="d-preview-check">
                  <Icon name="check" size={17} />
                </span>
              </div>
              <div className="d-feature-card">
                <span className="d-card-kicker">
                  {employer
                    ? "BUILD SOMETHING WORTH JOINING"
                    : "A GOOD PLACE TO START"}
                </span>
                <h2>
                  {employer ? (
                    <>
                      Great people.
                      <br />
                      Even better possibilities.
                    </>
                  ) : (
                    <>
                      Your skills.
                      <br />
                      Your ambitions.
                      <br />
                      <span>Your next move.</span>
                    </>
                  )}
                </h2>
                <div className="d-card-tags">
                  <span>Your kind of work</span>
                  <span>Room to grow</span>
                </div>
                <div className="d-card-foot">
                  <span>Make the next chapter yours.</span>
                  <span>↗</span>
                </div>
              </div>
              <div className="d-preview-stats">
                <div>
                  <Icon name="search" size={19} />
                  <span>
                    Discover
                    <br />
                    <strong>Your kind of role</strong>
                  </span>
                </div>
                <div>
                  <Icon name="bag" size={19} />
                  <span>
                    Keep track
                    <br />
                    <strong>Every next step</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="d-float-note">
              <span>
                <Icon name="check" size={18} />
              </span>
              <div>
                <strong>Good things ahead.</strong>
                <small>Let’s find your next chapter.</small>
              </div>
              <Icon name="spark" size={23} />
            </div>
          </div>
        </section>
        <section className="d-category-section d-container">
          <div className="d-section-heading">
            <div>
              <div className="d-eyebrow">FIND YOUR DIRECTION</div>
              <h2>There’s a place for your talent.</h2>
            </div>
            <Link href="/jobs" className="text-link">
              Explore all opportunities <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="d-category-grid">
            {categories.map((c, i) => (
              <Link
                key={c.name}
                href={`/jobs?q=${c.q}`}
                className={`d-category d-category-${i}`}
              >
                <div>
                  <span>{c.icon}</span>
                  <Icon name="arrow" size={18} />
                </div>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="d-journey d-container">
          <div>
            <div className="d-eyebrow">LESS FRICTION. MORE FORWARD.</div>
            <h2>
              Your next chapter,
              <br />
              <em>three simple steps.</em>
            </h2>
            <p>
              A clear path from “what’s next?”
              <br />
              to your next opportunity.
            </p>
            <Link href="/register" className="btn primary">
              Let’s get started <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="d-steps">
            {[
              [
                "01",
                "Make it yours",
                "Create an account and make a good first introduction.",
              ],
              [
                "02",
                "Find your people",
                "Search by skills, work style, experience, location, and salary.",
              ],
              [
                "03",
                "Make your move",
                "Apply with your resume and follow every application in one place.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <Icon name="arrow" size={17} />
              </article>
            ))}
          </div>
        </section>
        <section className="d-container">
          <div className="d-team-banner">
            <div>
              <div className="d-eyebrow">
                GREAT PEOPLE. GREAT POSSIBILITIES.
              </div>
              <h2>
                Your next great hire.
                <br />
                Someone’s next big move.
              </h2>
              <p>Give the right people a reason to join your team.</p>
              <Link href="/register?role=employer" className="btn">
                Build your team <Icon name="arrow" size={18} />
              </Link>
            </div>
            <span aria-hidden="true">↗</span>
          </div>
        </section>
      </main>
      <footer className="d-footer d-container">
        <Link href="/" className="brand">
          jobboard<span className="brand-dot">.</span>
        </Link>
        <span>Good work starts with a good connection.</span>
        <nav aria-label="Footer">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
