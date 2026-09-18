import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, Heart, LockKeyhole, Utensils, ClipboardList,
  CreditCard, Clock3, PackageCheck, TrendingUp, ChevronRight,
  LogOut, AlertCircle, Search, Filter, ArrowLeft, Phone, MapPin, CalendarDays, CheckCircle2, CircleDollarSign
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

function AdminOrderDetails({ order, onBack, onLogout }) {
  const [payment, setPayment] = useState(order.payment);
  const [status, setStatus] = useState(order.status);
  const verified = payment === 'VERIFIED';
  return <div className="admin-shell dashboard-shell">
    <header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="dashboard-content order-detail-page">
      <button className="back-dashboard" onClick={onBack}><ArrowLeft size={16}/> ALL ORDERS</button>
      <section className="detail-hero"><div><span className="admin-eyebrow">ORDER DETAILS</span><h1>{order.id}</h1><p>Placed today · {order.meal}</p></div><b className={'pill '+status.toLowerCase()}>{status}</b></section>
      <section className="detail-grid">
        <div className="dashboard-panel detail-panel">
          <div className="panel-heading"><div><span className="panel-kicker">CUSTOMER</span><h2>{order.name}</h2></div></div>
          <div className="customer-details"><div><Phone size={16}/><span>+91 98XXXXXX42</span></div><div><MapPin size={16}/><span>College Campus · Main Gate</span></div><div><CalendarDays size={16}/><span>18 September 2026</span></div></div>
        </div>
        <div className="dashboard-panel payment-detail-panel">
          <div className="panel-heading"><div><span className="panel-kicker">PAYMENT</span><h2>{order.total}</h2></div><b className={'pill '+payment.toLowerCase()}>{payment}</b></div>
          <div className="payment-detail-body"><div className="payment-method"><CircleDollarSign size={18}/><div><strong>UPI PAYMENT</strong><span>Customer marked payment as completed</span></div></div>{!verified&&<button className="verify-payment-button" onClick={()=>setPayment('VERIFIED')}><CheckCircle2 size={17}/> VERIFY PAYMENT</button>}{verified&&<div className="verified-note"><CheckCircle2 size={17}/> PAYMENT VERIFIED</div>}</div>
        </div>
      </section>
      <section className="dashboard-panel items-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">ORDER SUMMARY</span><h2>Items Ordered</h2></div><span className="meal-label">{order.meal}</span></div><div className="detail-items"><div><span>Pothichoru — Chicken</span><strong>2 × ₹90</strong></div><div><span>Egg Pothichoru</span><strong>1 × ₹70</strong></div><div><span>Chicken Curry</span><strong>1 × ₹90</strong></div></div><div className="detail-total"><span>ORDER TOTAL</span><strong>{order.total}</strong></div></section>
      <section className="dashboard-panel status-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">KITCHEN WORKFLOW</span><h2>Order Status</h2></div></div><div className="workflow"><button className={status==='PLACED'?'current':''} onClick={()=>setStatus('PLACED')}>PLACED</button><ChevronRight size={15}/><button className={status==='PREPARING'?'current':''} onClick={()=>setStatus('PREPARING')}>PREPARING</button><ChevronRight size={15}/><button className={status==='READY'?'current':''} onClick={()=>setStatus('READY')}>READY</button><ChevronRight size={15}/><button className={status==='OUT_FOR_DELIVERY'?'current':''} onClick={()=>setStatus('OUT_FOR_DELIVERY')}>OUT FOR DELIVERY</button><ChevronRight size={15}/><button className={status==='DELIVERED'?'current':''} onClick={()=>setStatus('DELIVERED')}>DELIVERED</button></div></section>
      <div className="admin-detail-actions"><button className="secondary-detail-button" onClick={onBack}>BACK TO ORDERS</button><button className="admin-primary detail-save-button" onClick={()=>alert('Order updated in prototype.')}>SAVE ORDER UPDATE <ArrowRight size={17}/></button></div>
    </main>
  </div>;
}

function AdminMenu({ onBack, onLogout }) {
  const tomorrow = new Date(Date.now()+86400000);
  const dateLabel = new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'long',year:'numeric'}).format(tomorrow).toUpperCase();
  const [slot,setSlot] = useState('LUNCH');
  const [items,setItems] = useState([
    {name:'Pothichoru — Veg',price:'90',qty:'30'},
    {name:'Pothichoru — Egg',price:'100',qty:'30'},
    {name:'Pothichoru — Chicken',price:'130',qty:'30'}
  ]);
  const update=(i,key,val)=>setItems(items.map((x,n)=>n===i?{...x,[key]:val}:x));
  const add=()=>setItems([...items,{name:'',price:'',qty:'30'}]);
  return <div className="admin-shell dashboard-shell">
    <header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="dashboard-content menu-page">
      <button className="back-dashboard" onClick={onBack}><ArrowLeft size={16}/> DASHBOARD</button>
      <section className="orders-page-intro"><div><span className="admin-eyebrow">MENU MANAGEMENT</span><h1>Next Day's Menu.</h1><p>Set the meals, prices and availability before opening pre-orders.</p></div><div className="menu-date-card"><span>NEXT DAY</span><strong>{dateLabel}</strong></div></section>
      <section className="dashboard-panel menu-editor">
        <div className="menu-slot-tabs"><button className={slot==='LUNCH'?'active':''} onClick={()=>setSlot('LUNCH')}>LUNCH</button><button className={slot==='DINNER'?'active':''} onClick={()=>setSlot('DINNER')}>DINNER</button></div>
        <div className="panel-heading"><div><span className="panel-kicker">MENU FOR {dateLabel}</span><h2>{slot} Menu</h2></div><span className="menu-state">DRAFT</span></div>
        <div className="menu-fields menu-head"><span>FOOD ITEM</span><span>PRICE</span><span>AVAILABLE</span><span></span></div>
        <div className="menu-item-list">{items.map((item,i)=><div className="menu-edit-row" key={i}><input value={item.name} onChange={e=>update(i,'name',e.target.value)} placeholder="Food item name"/><div className="price-input"><span>₹</span><input value={item.price} onChange={e=>update(i,'price',e.target.value)} inputMode="decimal"/></div><input value={item.qty} onChange={e=>update(i,'qty',e.target.value)} inputMode="numeric" placeholder="Qty"/><button className="remove-item" onClick={()=>setItems(items.filter((_,n)=>n!==i))}>REMOVE</button></div>)}</div>
        <button className="add-item-button" onClick={add}>+ ADD FOOD ITEM</button>
        <div className="menu-editor-footer"><span>Prices and availability will be shown to customers when this menu is published.</span><button className="admin-primary publish-button" onClick={()=>alert(slot+' menu saved for '+dateLabel+'.')}>SAVE {slot} MENU <ArrowRight size={17}/></button></div>
      </section>
    </main>
  </div>;
}

function AdminOrders({ onBack, onOpenOrder, onLogout }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const filtered = ORDERS.filter(o => (filter==='ALL' || o.status===filter || o.payment===filter) && (o.id+o.name+o.meal).toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-shell dashboard-shell">
    <header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="dashboard-content orders-page">
      <button className="back-dashboard" onClick={onBack}><ArrowLeft size={16}/> DASHBOARD</button>
      <section className="orders-page-intro"><div><span className="admin-eyebrow">ORDER MANAGEMENT</span><h1>Today's Orders.</h1><p>Review and manage every customer order for today.</p></div><div className="orders-count"><strong>{filtered.length}</strong><span>ORDERS SHOWN</span></div></section>
      <section className="orders-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order ID, customer or meal"/></div><div className="filter-wrap"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">ALL ORDERS</option><option value="PENDING">PAYMENT PENDING</option><option value="VERIFIED">PAYMENT VERIFIED</option><option value="PREPARING">PREPARING</option><option value="READY">READY</option><option value="PLACED">PLACED</option></select></div></section>
      <section className="dashboard-panel orders-page-panel"><div className="orders-table"><div className="table-row table-head"><span>ORDER</span><span>CUSTOMER</span><span>MEAL</span><span>TOTAL</span><span>PAYMENT</span><span>STATUS</span></div>{filtered.map(o=><div className="table-row order-click" key={o.id} onClick={()=>onOpenOrder(o)}><span className="order-id">{o.id}</span><span><strong className="customer-name">{o.name}</strong><small className="customer-phone">+91 98XXXXXX42</small></span><span>{o.meal}</span><span className="amount">{o.total}</span><span><b className={'pill '+o.payment.toLowerCase()}>{o.payment}</b></span><span><b className={'pill '+o.status.toLowerCase()}>{o.status}</b></span></div>)}{filtered.length===0&&<div className="empty-orders">No orders match your search or filter.</div>}</div></section>
    </main>
  </div>;
}

function AdminDashboard({ onOrders, onMenu, onLogout }) {
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
          <div className="panel-heading"><div><span className="panel-kicker">KITCHEN</span><h2>Preparation Summary</h2></div><button className="panel-link" onClick={onMenu}>VIEW KITCHEN <ChevronRight size={16}/></button></div>
          <div className="slot-tabs"><button className="active">LUNCH <span>24 orders</span></button><button>DINNER <span>18 orders</span></button></div>
          <div className="prep-list">{PREP.map(([name,count])=><div className="prep-row" key={name}><span>{name}</span><strong>{count}</strong></div>)}</div>
        </div>
        <div className="dashboard-panel payment-panel">
          <div className="panel-heading"><div><span className="panel-kicker">ACTION REQUIRED</span><h2>Payment Verification</h2></div><span className="count-badge">05 PENDING</span></div>
          <p className="panel-description">Payments marked as completed by customers are waiting for manual verification.</p>
          <div className="pending-list">{ORDERS.filter(o=>o.payment==='PENDING').map(o=><div className="pending-row" key={o.id}><div><strong>{o.id}</strong><span>{o.name} · {o.meal}</span></div><button>VERIFY <ChevronRight size={14}/></button></div>)}</div>
          <button className="full-panel-button" onClick={onOrders}>VIEW ALL PAYMENTS <ArrowRight size={16}/></button>
        </div>
      </section>

      <section className="dashboard-panel orders-panel">
        <div className="panel-heading"><div><span className="panel-kicker">TODAY</span><h2>Recent Orders</h2></div><button className="panel-link" onClick={onOrders}>VIEW ALL ORDERS <ChevronRight size={16}/></button></div>
        <div className="orders-table"><div className="table-row table-head"><span>ORDER</span><span>CUSTOMER</span><span>MEAL</span><span>TOTAL</span><span>PAYMENT</span><span>STATUS</span></div>{ORDERS.map(o=><div className="table-row" key={o.id}><span className="order-id">{o.id}</span><span>{o.name}</span><span>{o.meal}</span><span className="amount">{o.total}</span><span><b className={'pill '+o.payment.toLowerCase()}>{o.payment}</b></span><span><b className={'pill '+o.status.toLowerCase()}>{o.status}</b></span></div>)}</div>
      </section>
    </main>
  </div>;
}

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState('dashboard');
  if (!isAdmin) return <CustomerLanding />;
  if (!loggedIn) return <AdminLogin onLogin={()=>setLoggedIn(true)}/>;
  if (page==='menu') return <AdminMenu onBack={()=>setPage('dashboard')} onLogout={()=>{setLoggedIn(false);setPage('dashboard')}}/>;
  if (page==='order-details' && selectedOrder) return <AdminOrderDetails order={selectedOrder} onBack={()=>setPage('orders')} onLogout={()=>{setLoggedIn(false);setPage('dashboard')}}/>;
  return page==='orders' ? <AdminOrders onBack={()=>setPage('dashboard')} onOpenOrder={(o)=>{setSelectedOrder(o);setPage('order-details')}} onLogout={()=>{setLoggedIn(false);setPage('dashboard')}}/> : <AdminDashboard onOrders={()=>setPage('orders')} onMenu={()=>setPage('menu')} onLogout={()=>setLoggedIn(false)}/>;
}
createRoot(document.getElementById('root')).render(<App />);
