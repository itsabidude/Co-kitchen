import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, Heart, LockKeyhole, Utensils, ClipboardList,
  CreditCard, PackageCheck, TrendingUp, ChevronRight,
  LogOut, AlertCircle, Search, Filter, ArrowLeft, Phone, MapPin, CalendarDays, CheckCircle2, CircleDollarSign
} from 'lucide-react';
import './styles.css';
import {
  cokitbaseReady, cokitbase, getSlotAvailability, getMenuForDate,
  subscribeToPortalChanges
} from './lib/cokitbase';

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
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your administrator credentials.');
      return;
    }
    try {
      if (cokitbaseReady) {
        const { error } = await cokitbase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      onLogin();
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    }
  };
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
        <div className="dashboard-panel detail-panel"><div className="panel-heading"><div><span className="panel-kicker">CUSTOMER</span><h2>{order.name}</h2></div></div><div className="customer-details"><div><Phone size={16}/><span>+91 98XXXXXX42</span></div><div><MapPin size={16}/><span>College Campus · Main Gate</span></div><div><CalendarDays size={16}/><span>18 September 2026</span></div></div></div>
        <div className="dashboard-panel payment-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">PAYMENT</span><h2>{order.total}</h2></div><b className={'pill '+payment.toLowerCase()}>{payment}</b></div><div className="payment-detail-body"><div className="payment-method"><CircleDollarSign size={18}/><div><strong>UPI PAYMENT</strong><span>Customer marked payment as completed</span></div></div>{!verified&&<button className="verify-payment-button" onClick={()=>setPayment('VERIFIED')}><CheckCircle2 size={17}/> VERIFY PAYMENT</button>}{verified&&<div className="verified-note"><CheckCircle2 size={17}/> PAYMENT VERIFIED</div>}</div></div>
      </section>
      <section className="dashboard-panel items-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">ORDER SUMMARY</span><h2>Items Ordered</h2></div><span className="meal-label">{order.meal}</span></div><div className="detail-items"><div><span>Pothichoru — Chicken</span><strong>2 × ₹90</strong></div><div><span>Egg Pothichoru</span><strong>1 × ₹70</strong></div><div><span>Chicken Curry</span><strong>1 × ₹90</strong></div></div><div className="detail-total"><span>ORDER TOTAL</span><strong>{order.total}</strong></div></section>
      <section className="dashboard-panel status-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">KITCHEN WORKFLOW</span><h2>Order Status</h2></div></div><div className="workflow"><button className={status==='PLACED'?'current':''} onClick={()=>setStatus('PLACED')}>PLACED</button><ChevronRight size={15}/><button className={status==='PREPARING'?'current':''} onClick={()=>setStatus('PREPARING')}>PREPARING</button><ChevronRight size={15}/><button className={status==='READY'?'current':''} onClick={()=>setStatus('READY')}>READY</button><ChevronRight size={15}/><button className={status==='OUT_FOR_DELIVERY'?'current':''} onClick={()=>setStatus('OUT_FOR_DELIVERY')}>OUT FOR DELIVERY</button><ChevronRight size={15}/><button className={status==='DELIVERED'?'current':''} onClick={()=>setStatus('DELIVERED')}>DELIVERED</button></div></section>
      <div className="admin-detail-actions"><button className="secondary-detail-button" onClick={onBack}>BACK TO ORDERS</button><button className="admin-primary detail-save-button" onClick={()=>alert('Order updated in prototype.')}>SAVE ORDER UPDATE <ArrowRight size={17}/></button></div>
    </main>
  </div>;
}

function AdminMenu({ onBack, onLogout }) {
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0,10));
  const [slot,setSlot] = useState('lunch');
  const [items,setItems] = useState([]);
  const [slots,setSlots] = useState([]);
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState('');
  const dateLabel = new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(serviceDate+'T00:00:00')).toUpperCase();

  const load = async () => {
    if (!cokitbaseReady) {
      setSlots([{id:'lunch',is_available:true},{id:'dinner',is_available:true}]);
      setItems(slot==='lunch'
        ? [{name:'Pothichoru — Veg',price:'90',qty:'30',remaining:'30',available:true},{name:'Pothichoru — Egg',price:'100',qty:'30',remaining:'30',available:true},{name:'Pothichoru — Chicken',price:'130',qty:'30',remaining:'30',available:true}]
        : [{name:'Appam',price:'80',qty:'30',remaining:'30',available:true},{name:'Veg stew',price:'70',qty:'30',remaining:'30',available:true},{name:'Chicken stew',price:'100',qty:'30',remaining:'30',available:true},{name:'Chiratta Puttu',price:'80',qty:'30',remaining:'30',available:true},{name:'Kadala curry',price:'70',qty:'30',remaining:'30',available:true},{name:'Chicken curry',price:'100',qty:'30',remaining:'30',available:true}]);
      return;
    }
    const [menuData, slotData] = await Promise.all([getMenuForDate(serviceDate), getSlotAvailability()]);
    setSlots(slotData || []);
    setItems((menuData || []).filter(x=>x.slot===slot).map(x=>({
      id:x.id,name:x.item_name,price:String(x.price),qty:String(x.total_quantity),
      remaining:String(x.remaining_quantity),available:x.is_available
    })));
  };

  useEffect(()=>{ load().catch(err=>setMessage(err.message||'Could not load menu.')); },[serviceDate,slot]);

  const update=(i,key,val)=>setItems(items.map((x,n)=>n===i?{...x,[key]:val}:x));
  const add=()=>setItems([...items,{name:'',price:'',qty:'30',remaining:'30',available:true}]);

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      if (!cokitbaseReady) { setMessage('Saved in prototype mode. Connect Cokitbase to publish to customers.'); return; }
      for (const item of items) {
        const total = Math.max(0, Number(item.qty)||0);
        const remaining = Math.min(total, Math.max(0, Number(item.remaining ?? total)||0));
        const payload = {
          service_date: serviceDate, slot, item_name:item.name.trim(),
          price:Math.max(0,Number(item.price)||0), total_quantity:total,
          remaining_quantity:remaining, is_available:Boolean(item.available), updated_at:new Date().toISOString()
        };
        if (!payload.item_name) continue;
        if (item.id) {
          const {error}=await cokitbase.from('menus').update(payload).eq('id',item.id);
          if(error) throw error;
        } else {
          const {error}=await cokitbase.from('menus').insert(payload);
          if(error) throw error;
        }
      }
      await load();
      setMessage('Menu published. Customer portal will receive the updated menu and availability.');
    } catch(err) {
      setMessage(err.message || 'Could not save menu.');
    } finally { setSaving(false); }
  };

  const toggleSlot = async (id) => {
    const current=slots.find(x=>x.id===id);
    if(!cokitbaseReady || !current) return;
    const {error}=await cokitbase.from('service_slots').update({is_available:!current.is_available,updated_at:new Date().toISOString()}).eq('id',id);
    if(error) setMessage(error.message); else load();
  };

  return <div className="admin-shell dashboard-shell">
    <header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="dashboard-content menu-page">
      <button className="back-dashboard" onClick={onBack}><ArrowLeft size={16}/> DASHBOARD</button>
      <section className="orders-page-intro"><div><span className="admin-eyebrow">MENU & SERVICE CONTROL</span><h1>Menu Management.</h1><p>Control which slots are open and publish the menu customers see.</p></div><div className="menu-date-card"><span>SERVICE DATE</span><input type="date" value={serviceDate} onChange={e=>setServiceDate(e.target.value)}/><strong>{dateLabel}</strong></div></section>

      <section className="dashboard-panel service-control-panel">
        <div className="panel-heading"><div><span className="panel-kicker">CUSTOMER PORTAL</span><h2>Service Availability</h2></div><span className="menu-state">LIVE</span></div>
        <div className="service-toggle-grid">{['lunch','dinner'].map(id=>{const x=slots.find(s=>s.id===id)||{is_available:true}; return <div className="service-toggle-card" key={id}><div><strong>{id.toUpperCase()}</strong><span>{x.is_available?'Customers can order this slot':'Hidden from customers'}</span></div><button className={'availability-toggle '+(x.is_available?'on':'')} onClick={()=>toggleSlot(id)}><span/></button></div>})}</div>
      </section>

      <section className="dashboard-panel menu-editor">
        <div className="menu-slot-tabs"><button className={slot==='lunch'?'active':''} onClick={()=>setSlot('lunch')}>LUNCH</button><button className={slot==='dinner'?'active':''} onClick={()=>setSlot('dinner')}>DINNER</button></div>
        <div className="panel-heading"><div><span className="panel-kicker">MENU FOR {dateLabel}</span><h2>{slot.toUpperCase()} Menu</h2></div><span className="menu-state">LIVE DATA</span></div>
        <div className="menu-fields menu-head"><span>FOOD ITEM</span><span>PRICE</span><span>CAPACITY</span><span>REMAINING</span><span>AVAILABLE</span><span></span></div>
        <div className="menu-item-list">{items.map((item,i)=><div className="menu-edit-row" key={item.id||i}>
          <input value={item.name} onChange={e=>update(i,'name',e.target.value)} placeholder="Food item name"/>
          <div className="price-input"><span>₹</span><input value={item.price} onChange={e=>update(i,'price',e.target.value)} inputMode="decimal"/></div>
          <input value={item.qty} onChange={e=>update(i,'qty',e.target.value)} inputMode="numeric" placeholder="Qty"/>
          <input value={item.remaining} onChange={e=>update(i,'remaining',e.target.value)} inputMode="numeric" placeholder="Remaining"/>
          <input type="checkbox" checked={item.available} onChange={e=>update(i,'available',e.target.checked)}/>
          <button className="remove-item" onClick={()=>setItems(items.filter((_,n)=>n!==i))}>REMOVE</button>
        </div>)}</div>
        <button className="add-item-button" onClick={add}>+ ADD FOOD ITEM</button>
        {message&&<div className="login-error"><CheckCircle2 size={16}/>{message}</div>}
        <div className="menu-editor-footer"><span>Capacity and remaining quantity flow directly to the customer portal after publishing.</span><button className="admin-primary publish-button" disabled={saving} onClick={save}>{saving?'SAVING…':'PUBLISH '+slot.toUpperCase()+' MENU'} <ArrowRight size={17}/></button></div>
      </section>
    </main>
  </div>;
}function AdminOrders({ onBack, onOpenOrder, onLogout }) {
  const [query,setQuery]=useState(''); const [filter,setFilter]=useState('ALL');
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const load=async()=>{
    if(!cokitbaseReady){setOrders(ORDERS.map(o=>({...o,mobile:'+91 98XXXXXX42'})));setLoading(false);return;}
    const {data,error}=await cokitbase.from('orders').select('*, order_items(*)').order('created_at',{ascending:false});
    if(error) throw error;
    setOrders((data||[]).map(o=>({
      id:o.order_code,name:o.customer_name,mobile:o.customer_mobile,
      meal:[...new Set((o.order_items||[]).map(i=>i.slot))].map(x=>x[0].toUpperCase()+x.slice(1)).join(' + ')||'Order',
      total:'₹'+Number(o.total_amount||0).toFixed(0),payment:o.payment_status,status:o.order_status,
      raw:o
    })));
    setLoading(false);
  };
  useEffect(()=>{load().catch(()=>setLoading(false)); const unsub=subscribeToPortalChanges(()=>load().catch(()=>{})); return unsub;},[]);
  const filtered=orders.filter(o=>(filter==='ALL'||o.status===filter||o.payment===filter)&&(o.id+o.name+o.meal+o.mobile).toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-shell dashboard-shell"><header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="dashboard-content orders-page"><button className="back-dashboard" onClick={onBack}><ArrowLeft size={16}/> DASHBOARD</button><section className="orders-page-intro"><div><span className="admin-eyebrow">ORDER MANAGEMENT</span><h1>Today's Orders.</h1><p>Review and manage every customer order for today.</p></div><div className="orders-count"><strong>{filtered.length}</strong><span>ORDERS SHOWN</span></div></section><section className="orders-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order ID, customer or mobile"/></div><div className="filter-wrap"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">ALL ORDERS</option><option value="PENDING">PAYMENT PENDING</option><option value="VERIFIED">PAYMENT VERIFIED</option><option value="PREPARING">PREPARING</option><option value="READY">READY</option><option value="PLACED">PLACED</option></select></div></section><section className="dashboard-panel orders-page-panel">{loading?<p className="panel-description">Loading live orders…</p>:<div className="orders-table"><div className="table-row table-head"><span>ORDER</span><span>CUSTOMER</span><span>MEAL</span><span>TOTAL</span><span>PAYMENT</span><span>STATUS</span></div>{filtered.map(o=><div className="table-row order-click" key={o.id} onClick={()=>onOpenOrder(o)}><span className="order-id">{o.id}</span><span><strong className="customer-name">{o.name}</strong><small className="customer-phone">{o.mobile}</small></span><span>{o.meal}</span><span className="amount">{o.total}</span><span><b className={'pill '+o.payment.toLowerCase()}>{o.payment}</b></span><span><b className={'pill '+o.status.toLowerCase()}>{o.status}</b></span></div>)}</div>}</section></main></div>;
}
