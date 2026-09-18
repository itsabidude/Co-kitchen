import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, Heart, LockKeyhole, Utensils, ClipboardList,
  CreditCard, Clock3, PackageCheck, TrendingUp, ChevronRight,
  LogOut, AlertCircle
} from 'lucide-react';
import './styles.css';

const MEALS = [
  { id: 'lunch', title: 'Lunch', delivery: 'Delivery by 12:30 PM', items: ['Pothichoru', 'Veg', 'Egg', 'Chicken'] },
  { id: 'dinner', title: 'Dinner', delivery: 'Delivery by 7:30 PM', items: ['Appam', 'Veg stew', 'Chicken stew', 'Chiratta Puttu', 'Kadala curry', 'Chicken curry'] },
];

const PREP = [
  ['Pothichoru — Veg', 18], ['Pothichoru — Egg', 12], ['Pothichoru — Chicken', 25],
  ['Appam', 40], ['Puttu', 22], ['Kadala Curry', 18], ['Chicken Curry', 27]
];

const ORDERS = [
  { id: '#CK1024', name: 'Rahul Menon', meal: 'Lunch', total: '₹240', payment: 'VERIFIED', status: 'PREPARING' },
  { id: '#CK1025', name: 'Ananya Nair', meal: 'Dinner', total: '₹180', payment: 'PENDING', status: 'PLACED' },
  { id: '#CK1026', name: 'Arjun Kumar', meal: 'Lunch + Dinner', total: '₹320', payment: 'VERIFIED', status: 'READY' },
  { id: '#CK1027', name: 'Meera S.', meal: 'Dinner', total: '₹260', payment: 'PENDING', status: 'PLACED' },
];

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(date).toUpperCase();
}

function CustomerLanding() {
  const [now, setNow] = useState(new Date());
  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <div className="landing-page">
    <div className="page-background" aria-hidden="true" /><div className="page-wash" aria-hidden="true" />
    <header className="site-header"><div className="brand-lockup"><span className="brand-name">CO-CO KITCHEN</span><span className="brand-subtitle">HOMELY KERALA FLAVOURS</span></div><span className="since">Since 2024</span></header>
    <main className="content">
      <section className="welcome-card"><div className="welcome-inner"><h1>Made with love.</h1><p className="welcome-subtitle">Homely Kerala flavours</p><div className="heart-rule"><span/><Heart size={29} strokeWidth={1.7}/><span/></div></div></section>
      <section className="date-block"><span className="today-label">TODAY</span><strong>{formatDate(now).replace(/, 2026$/,'')}</strong><span className="live-time">{new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit',hour12:true}).format(now)}</span></section>
      <div className="instruction-box">CHOOSE ONE TO PROCEED</div>
      <section className="meal-list">{MEALS.map(meal => <article className="meal-card" key={meal.id}><div className="meal-card-top"/><div className="meal-heading"><span className="meal-kicker">PRE-ORDER {meal.title.toUpperCase()}</span><h2>Pre-order {meal.title}</h2><p>{meal.delivery}</p></div><div className="meal-items">{meal.items.map((item,i)=><React.Fragment key={item}><span>{item}</span>{i<meal.items.length-1&&<i>·</i>}</React.Fragment>)}</div><button className="start-button">START PRE-ORDER <ArrowRight size={18}/></button></article>)}</section>
    </main>
  </div>;
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => { e.preventDefault(); if (email.trim() && password.trim()) onLogin(); else setError('Please enter your administrator credentials.'); };
  return <div className="admin-shell login-shell">
    <div className="admin-login-card">
      <div className="admin-mark"><Utensils size={23}/></div>
      <span className="admin-eyebrow">CO-CO KITCHEN</span>
      <h1>Admin Portal</h1>
      <p className="admin-lead">Kitchen & order management</p>
      <div className="admin-rule"><span/><Heart size={15}/><span/></div>
      <form onSubmit={submit}>
        <label>ADMIN EMAIL<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" autoComplete="username"/></label>
        <label>PASSWORD<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"/></label>
        {error && <div className="login-error"><AlertCircle size={16}/>{error}</div>}
        <button className="admin-primary" type="submit">SIGN IN <ArrowRight size={18}/></button>
      </form>
      <div className="secure-note"><LockKeyhole size={14}/> AUTHORISED PERSONNEL ONLY</div>
    </div>
  </div>;
}

function StatCard({ icon: Icon, label, value, detail, alert }) {
  return <div className={'stat-card '+(alert?'stat-alert':'')}><div className="stat-icon"><Icon size={21}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function AdminDashboard({ onLogout }) {
  return <div className="admin-shell dashboard-shell">
    <header className="admin-header">
      <div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div>
      <div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div>
    </header>
    <main className="dashboard-content">
      <section className="dashboard-intro"><div><span className="admin-eyebrow">KITCHEN CONTROL CENTRE</span><h1>Good morning.</h1><p>Here is today's order and kitchen overview.</p></div><div className="service-status"><span className="status-dot"/> SERVICE OPEN</div></section>

      <section className="stats-grid">
        <StatCard icon={ClipboardList} label="TOTAL ORDERS" value="42" detail="Today's confirmed orders"/>
        <StatCard icon={CreditCard} label="PAYMENTS PENDING" value="05" detail="Awaiting verification" alert/>
        <StatCard icon={Utensils} label="TO PREPARE" value="89" detail="Meals across both slots"/>
        <StatCard icon={PackageCheck} label="READY FOR DELIVERY" value="14" detail="Orders completed"/>
        <StatCard icon={TrendingUp} label="TODAY'S REVENUE" value="₹9,840" detail="From 37 verified payments"/>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel kitchen-panel">
          <div className="panel-heading"><div><span className="panel-kicker">KITCHEN</span><h2>Preparation Summary</h2></div><button className="panel-link">VIEW KITCHEN <ChevronRight size={16}/></button></div>
          <div className="slot-tabs"><button className="active">LUNCH <span>24 orders</span></button><button>DINNER <span>18 orders</span></button></div>
          <div className="prep-list">{PREP.map(([name,count])=><div className="prep-row" key={name}><span>{name}</span><strong>{count}</strong></div>)}</div>
        </div>
        <div className="dashboard-panel payment-panel">
          <div className="panel-heading"><div><span className="panel-kicker">ACTION REQUIRED</span><h2>Payment Verification</h2></div><span className="count-badge">05 PENDING</span></div>
          <p className="panel-description">Payments marked as completed by customers are waiting for manual verification.</p>
          <div className="pending-list">{ORDERS.filter(o=>o.payment==='PENDING').map(o=><div className="pending-row" key={o.id}><div><strong>{o.id}</strong><span>{o.name} · {o.meal}</span></div><button>VERIFY <ChevronRight size={14}/></button></div>)}</div>
          <button className="full-panel-button">VIEW ALL PAYMENTS <ArrowRight size={16}/></button>
        </div>
      </section>

      <section className="dashboard-panel orders-panel">
        <div className="panel-heading"><div><span className="panel-kicker">TODAY</span><h2>Recent Orders</h2></div><button className="panel-link">VIEW ALL ORDERS <ChevronRight size={16}/></button></div>
        <div className="orders-table"><div className="table-row table-head"><span>ORDER</span><span>CUSTOMER</span><span>MEAL</span><span>TOTAL</span><span>PAYMENT</span><span>STATUS</span></div>{ORDERS.map(o=><div className="table-row" key={o.id}><span className="order-id">{o.id}</span><span>{o.name}</span><span>{o.meal}</span><span className="amount">{o.total}</span><span><b className={'pill '+o.payment.toLowerCase()}>{o.payment}</b></span><span><b className={'pill '+o.status.toLowerCase()}>{o.status}</b></span></div>)}</div>
      </section>
    </main>
  </div>;
}

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const [loggedIn, setLoggedIn] = useState(false);
  if (!isAdmin) return <CustomerLanding />;
  return loggedIn ? <AdminDashboard onLogout={()=>setLoggedIn(false)}/> : <AdminLogin onLogin={()=>setLoggedIn(true)}/>;
}
createRoot(document.getElementById('root')).render(<App />);
