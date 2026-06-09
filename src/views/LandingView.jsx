import React from 'react';
import { Link } from 'react-router-dom';
import LetterRiverBrand from '../components/LetterRiverBrand.jsx';
import Icon from '../components/Icon.jsx';
import { HOME_ASSETS } from '../components/home/homeAssets.js';
import './LandingView.css';

const audienceCards = [
  {
    icon: 'route',
    title: 'New Olim',
    body: 'Build early Hebrew confidence for daily life in Israel without starting from a wall of grammar.'
  },
  {
    icon: 'dictionary',
    title: 'Adult beginners',
    body: 'Practice letters, sounds, and recognition in short sessions that feel approachable after a long day.'
  },
  {
    icon: 'child_care',
    title: 'Parents',
    body: 'Give children a gentle way to meet Hebrew through play, repetition, and visible progress.'
  },
  {
    icon: 'school',
    title: 'Teachers & tutors',
    body: 'Use a focused practice tool that can support homework, warmups, or extra review between lessons.'
  }
];

const learningSteps = [
  {
    icon: 'text_fields',
    title: 'See the letter',
    body: 'Start with clear Hebrew letter shapes, not crowded lessons.'
  },
  {
    icon: 'volume_up',
    title: 'Hear the sound',
    body: 'Pair each symbol with pronunciation and memory cues.'
  },
  {
    icon: 'videogame_asset',
    title: 'Play to remember',
    body: 'Repeat through interaction, small goals, and a river path that shows progress.'
  }
];

const featureCards = [
  {
    icon: 'stars',
    title: 'Built for motivation',
    body: 'Short loops, milestones, and visible wins make practice easier to return to.'
  },
  {
    icon: 'shield',
    title: 'Beginner-safe pacing',
    body: 'The experience starts small so learners do not feel punished for not knowing yet.'
  },
  {
    icon: 'trending_up',
    title: 'Designed to expand',
    body: 'Letter River can grow from letters into words, reading, and conversation practice.'
  }
];

export default function LandingView() {
  React.useEffect(() => {
    document.body.classList.add('letter-river-landing-route');
    return () => document.body.classList.remove('letter-river-landing-route');
  }, []);

  return (
    <div className="landing-page" dir="ltr">
      <header className="landing-nav" aria-label="Letter River landing navigation">
        <Link className="landing-nav__brand" to="/" aria-label="Letter River home">
          <LetterRiverBrand label="Letter River" />
          <span>Learn Hebrew Through Play</span>
        </Link>
        <nav className="landing-nav__links" aria-label="Landing page sections">
          <a href="#how-it-works">How it works</a>
          <a href="#audience">Who it helps</a>
          <a href="#testing">Early testing</a>
        </nav>
        <Link className="landing-nav__cta" to="/home">
          Try the demo
        </Link>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero__copy">
            <p className="landing-eyebrow">
              <Icon name="stars" size={17} filled />
              Hebrew letters, sounds, and confidence — one step at a time
            </p>
            <h1 id="landing-title">Learn Hebrew through play.</h1>
            <p className="landing-hero__subtitle">
              Letter River turns early Hebrew practice into a gentle game path, helping beginners recognize letters, hear sounds, and keep coming back without feeling overwhelmed.
            </p>
            <div className="landing-hero__actions">
              <Link className="landing-button landing-button--primary" to="/home">
                <Icon name="play_arrow" size={20} filled />
                Try the demo
              </Link>
              <a className="landing-button landing-button--secondary" href="#testing">
                Join early testers
              </a>
            </div>
            <div className="landing-proof" aria-label="Product highlights">
              <span><Icon name="task_alt" size={17} /> Beginner friendly</span>
              <span><Icon name="schedule" size={17} /> Short practice loops</span>
              <span><Icon name="shield" size={17} /> Built for focused learning</span>
            </div>
          </div>

          <div className="landing-hero__visual" aria-label="Letter River product preview">
            <div className="landing-game-card">
              <div className="landing-game-card__topbar">
                <LetterRiverBrand label="Letter River" />
                <span><Icon name="water" size={16} filled /> 120</span>
                <span><Icon name="stars" size={16} filled /> 24</span>
              </div>
              <div className="landing-game-card__map" style={{ backgroundImage: `url(${HOME_ASSETS.heroRiverValley})` }}>
                <div className="landing-game-card__milestone">
                  <strong>Milestone</strong>
                  <span>Learn 5 letters</span>
                  <div><i style={{ width: '60%' }} /></div>
                </div>
                <span className="landing-node landing-node--one">1</span>
                <span className="landing-node landing-node--two">2</span>
                <span className="landing-node landing-node--current">3</span>
                <span className="landing-node landing-node--four">4</span>
                <span className="landing-node landing-node--five">5</span>
              </div>
              <div className="landing-lesson-card">
                <small>Today's lesson</small>
                <strong lang="he">ב</strong>
                <span>Bet · Sound: B</span>
                <button type="button">Let's play</button>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section landing-section--steps" aria-labelledby="how-title">
          <div className="landing-section__heading">
            <p>How it works</p>
            <h2 id="how-title">A tiny learning loop learners can actually repeat.</h2>
          </div>
          <div className="landing-card-grid landing-card-grid--three">
            {learningSteps.map((step) => (
              <article className="landing-info-card" key={step.title}>
                <span className="landing-info-card__icon"><Icon name={step.icon} size={22} /></span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="audience" className="landing-section" aria-labelledby="audience-title">
          <div className="landing-section__heading landing-section__heading--split">
            <div>
              <p>Who it helps</p>
              <h2 id="audience-title">Start with the people who feel the pain most clearly.</h2>
            </div>
            <span>Focused first on Hebrew beginners, with room to grow into a wider language-learning ecosystem.</span>
          </div>
          <div className="landing-card-grid landing-card-grid--four">
            {audienceCards.map((card) => (
              <article className="landing-audience-card" key={card.title}>
                <Icon name={card.icon} size={24} />
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-section--features" aria-labelledby="features-title">
          <div className="landing-section__heading">
            <p>Why this is different</p>
            <h2 id="features-title">Less intimidation. More return visits.</h2>
          </div>
          <div className="landing-feature-row">
            {featureCards.map((card) => (
              <article className="landing-feature-card" key={card.title}>
                <Icon name={card.icon} size={23} />
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="testing" className="landing-testing" aria-labelledby="testing-title">
          <div>
            <p className="landing-eyebrow landing-eyebrow--light">
              <Icon name="forum" size={17} /> Early tester program
            </p>
            <h2 id="testing-title">Help shape the first real version.</h2>
            <p>
              The next step is feedback from learners, olim, parents, teachers, and tutors. Try the demo, then share what felt useful, confusing, too easy, or worth expanding.
            </p>
          </div>
          <div className="landing-testing__card">
            <strong>Best next action</strong>
            <p>Play the current demo and send feedback about the first-session experience.</p>
            <div className="landing-testing__actions">
              <Link className="landing-button landing-button--primary" to="/home">Open demo</Link>
              <a className="landing-button landing-button--secondary" href="mailto:hello@letterriver.app?subject=Letter%20River%20early%20tester%20feedback">Email feedback</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
