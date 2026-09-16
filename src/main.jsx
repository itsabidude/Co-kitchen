import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Clock3, ShoppingBag, ChevronRight, Plus, Minus, Leaf, MapPin } from 'lucide-react';
import './styles.css';

const MENU = [
  { id: 'paneer-paratha', name: 'Paneer Paratha', category: 'Parathas', price: 80, description: 'Flaky whole-wheat paratha stuffed with spiced paneer.', tag: 'Popular' },
  { id: 'aloo-paratha', name: 'Aloo Paratha', category: 'Parathas', price: 60, description: 'Comforting potato-stuffed paratha with fresh herbs.' },
  { id: 'rajma-rice', name: 'Rajma Rice', category: 'Main Course', price: 90, description: 'Slow-cooked rajma served with steamed basmati rice.', tag: 'Bestseller' },
  { id: 'chole-rice', name: 'Chole Rice', category: 'Main Course', price: 90, description: 'Homestyle chickpea curry with fragrant rice.' },
  { id: 'curd', name: 'Fresh Curd', category: 'Add-ons', price: 20, description: 'Cool, creamy homemade curd.' },
  { id: 'salad', name: 'Fresh Salad', category: 'Add-ons', price: 15, description: 'Crisp seasonal vegetables with lemon.' },
];

const CATEGORIES = ['All', 'Parathas', 'Main Course', 'Add-ons'];
const CUTOFF_HOUR = 10;
const CUTOFF_MINUTE = 30;

function isOrderingOpen() {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(CUTOFF_HOUR, CUTOFF_MINUTE, 0, 0);
  return now < cutoff;
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});
  const orderingOpen = isOrderingOpen();

  const visibleItems = useMemo(
    () => activeCategory === 'All' ? MENU : MENU.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = MENU.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);

  const updateQty = (id, delta) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  };

  return (
    <div className="app-shell">
      <header className="header">
        <a className="brand" href="#top" aria-label="Co-Kitchen home">
          <span className="brand-mark"><Leaf size={18} strokeWidth={2.5} /></span>
          <span>co-kitchen</span>
        </a>
        <button className="cart-button" aria-label="Open cart">
          <ShoppingBag size={20} />
          <span>Cart</span>
          {totalItems > 0 && <b>{totalItems}</b>}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className={orderingOpen ? 'status-dot' : 'status-dot closed'} />{orderingOpen ? 'Orders are open' : 'Orders are closed'}</div>
            <h1>Good food.<br /><em>Made for your day.</em></h1>
            <p>Fresh, homestyle meals prepared with care and delivered to you.</p>
            <div className="delivery-note"><Clock3 size={17} /> Order before <strong>10:30 AM</strong> · Delivery <strong>1:00–2:00 PM</strong></div>
          </div>
          <div className="hero-card">
            <span>Today at a glance</span>
            <strong>{MENU.length} fresh choices</strong>
            <p>Made in small batches. Pre-order before the cutoff.</p>
          </div>
        </section>

        <section className="location-bar">
          <MapPin size={17} /> <span>Delivering to</span> <strong>NMIMS Hyderabad</strong>
        </section>

        <section className="menu-section">
          <div className="section-heading">
            <div><span className="eyebrow plain">THE MENU</span><h2>What's cooking today?</h2></div>
            <span className="item-count">{visibleItems.length} items</span>
          </div>

          <nav className="category-tabs" aria-label="Menu categories">
            {CATEGORIES.map((category) => (
              <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </nav>

          <div className="menu-grid">
            {visibleItems.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <article className="food-card" key={item.id}>
                  <div className={`food-visual visual-${item.id}`}><span>{item.category === 'Add-ons' ? 'SIDE' : 'FRESH'}</span></div>
                  <div className="food-content">
                    <div className="food-topline">
                      <div><h3>{item.name}</h3>{item.tag && <span className="tag">{item.tag}</span>}</div>
                      <strong className="price">₹{item.price}</strong>
                    </div>
                    <p>{item.description}</p>
                    {qty === 0 ? (
                      <button className="add-button" disabled={!orderingOpen} onClick={() => updateQty(item.id, 1)}>
                        {orderingOpen ? <>Add <Plus size={17} /></> : 'Unavailable'}
                      </button>
                    ) : (
                      <div className="quantity-control"><button onClick={() => updateQty(item.id, -1)} aria-label={`Decrease ${item.name}`}><Minus size={16} /></button><strong>{qty}</strong><button onClick={() => updateQty(item.id, 1)} aria-label={`Increase ${item.name}`}><Plus size={16} /></button></div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {totalItems > 0 && orderingOpen && (
        <div className="cart-dock">
          <div><strong>{totalItems} {totalItems === 1 ? 'item' : 'items'}</strong><span>₹{totalPrice}</span></div>
          <button>View cart <ChevronRight size={18} /></button>
        </div>
      )}

      <footer><span>co-kitchen</span><span>Fresh food, made simple.</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
