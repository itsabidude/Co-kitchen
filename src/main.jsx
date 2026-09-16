import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Heart } from 'lucide-react';
import './styles.css';

const MEALS = [
  {
    id: 'lunch',
    title: 'Lunch',
    delivery: 'Delivery by 12:30 PM',
    items: ['Pothichoru', 'Veg', 'Egg', 'Chicken'],
  },
  {
    id: 'dinner',
    title: 'Dinner',
    delivery: 'Delivery by 7:30 PM',
    items: ['Appam', 'Veg stew', 'Chicken stew', 'Chiratta Puttu', 'Kadala curry', 'Chicken curry'],
  },
];

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
  }).format(date).toUpperCase();
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function App() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      <div className="page-background" aria-hidden="true" />
      <div className="page-wash" aria-hidden="true" />

      <header className="site-header">
        <div className="brand-lockup">
          <span className="brand-name">CO-CO KITCHEN</span>
          <span className="brand-subtitle">HOMELY KERALA FLAVOURS</span>
        </div>
        <span className="since">Since 2024</span>
      </header>

      <main className="content">
        <section className="welcome-card">
          <div className="welcome-inner">
            <h1>Made with love.</h1>
            <p className="welcome-subtitle">Homely Kerala flavours</p>
            <div className="heart-rule" aria-hidden="true">
              <span />
              <Heart size={29} strokeWidth={1.7} fill="none" />
              <span />
            </div>
          </div>
        </section>

        <section className="date-block" aria-label="Today">
          <span className="today-label">TODAY</span>
          <strong>{formatDate(now)}</strong>
          <span className="live-time">{formatTime(now)}</span>
        </section>

        <div className="instruction-box">Choose one to proceed</div>

        <section className="meal-list" aria-label="Meal slots">
          {MEALS.map((meal) => (
            <article className="meal-card" key={meal.id}>
              <div className="meal-heading">
                <div>
                  <span className="meal-kicker">PRE-ORDER {meal.title.toUpperCase()}</span>
                  <h2>Pre-order {meal.title}</h2>
                  <p>{meal.delivery}</p>
                </div>
              </div>

              <div className="meal-items">
                {meal.items.map((item, index) => (
                  <React.Fragment key={item}>
                    <span>{item}</span>
                    {index < meal.items.length - 1 && <i>·</i>}
                  </React.Fragment>
                ))}
              </div>

              <button className="start-button" type="button">
                START PRE-ORDER <ArrowRight size={18} strokeWidth={2.2} />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
