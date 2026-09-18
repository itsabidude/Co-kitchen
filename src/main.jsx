import React, { useState, useEffect } from 'react';
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
  const [now,setNow]=useState(new Date());
  const [slots,setSlots]=useState([{id:'lunch',is_available:true},{id:'dinner',is_available:true}]);
  const [menus,setMenus]=useState([]);
  const [name,setName]=useState(sessionStorage.getItem('cocoCustomerName')||'');
  const [mobile,setMobile]=useState(sessionStorage.getItem('cocoCustomerMobile')||'');
  const [page,setPage]=useState('home');
  const [slot,setSlot]=useState(null);
  const [cart,setCart]=useState([]);
  const [order,setOrder]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[]);
  const today=new Date().toISOString().slice(0,10);
  const load=async()=>{if(!cokitbaseReady)return;try{const [s,m]=await Promise.all([getSlotAvailability(),getMenuForDate(today)]);setSlots(s||[]);setMenus(m||[])}catch(e){setError(e.message||'Could not load today’s menu.')}};
  useEffect(()=>{load();const unsub=subscribeToPortalChanges(load);return unsub},[]);
  const slotOpen=id=>slots.find(x=>x.id===id)?.is_available??true;
  const itemsFor=id=>menus.filter(x=>x.slot===id&&x.is_available&&x.remaining_quantity>0);
  const openSlot=id=>{setError('');setSlot(id);setPage('menu')};
  const proceed=()=>{if(!name.trim()){setError('Please enter your name to continue.');return}sessionStorage.setItem('cocoCustomerName',name.trim());setPage('home')};
  const add=(item)=>setCart(c=>{const found=c.find(x=>x.id===item.id);if(found)return c.map(x=>x.id===item.id?{...x,quantity:Math.min(x.quantity+1,item.remaining_quantity)}:x);return [...c,{...item,quantity:1}]});
  const changeQty=(id,delta)=>setCart(c=>c.flatMap(x=>{if(x.id!==id)return [x];const menuItem=menus.find(m=>m.id===id);const q=Math.min(menuItem?.remaining_quantity||x.quantity,x.quantity+delta);return q>0?[{...x,quantity:q}]:[]}));
  const total=cart.reduce((sum,x)=>sum+x.quantity*Number(x.price),0);
  const checkout=()=>{if(!name.trim()){setError('Please enter your name.');setPage('home');return}setPage('checkout')};
  const placeOrder=async()=>{
    if(!name.trim()||!/^[0-9]{10}$/.test(mobile)){setError('Enter your name and a valid 10-digit mobile number.');return}
    if(!cart.length)return;
    try{
      if(!cokitbaseReady){setOrder({order_code:'#CK-DEMO',customer_name:name,total_amount:total,payment_status:'PENDING'});setPage('payment');return}
      const payload=cart.map(x=>({menu_id:x.id,quantity:x.quantity}));
      const {data:o,error:e}=await cokitbase.rpc('create_customer_order',{
        p_customer_name:name.trim(),p_customer_mobile:mobile,p_order_date:today,p_items:payload
      });
      if(e)throw e;
      if(!o?.id)throw new Error('Order could not be created.');
      sessionStorage.setItem('cocoOrderToken',o.tracking_token);
      setOrder(o);setPage('payment');
    }catch(e){setError(e.message||'Could not place your order.')}
  };
  const markPaid=async()=>{
    if(!order)return;
    if(cokitbaseReady){
      const token=sessionStorage.getItem('cocoOrderToken');
      if(!token){setError('Order session expired.');return}
      const {error:e}=await cokitbase.rpc('mark_payment_completed',{p_tracking_token:token});
      if(e){setError(e.message);return}
      setOrder({...order,payment_status:'CUSTOMER_MARKED_PAID'});
    }
    setPage('verification');
  };
  useEffect(()=>{if(!order?.id||!cokitbaseReady)return;const refresh=async()=>{const {data}=await cokitbase.from('orders').select('*').eq('id',order.id).single();if(data)setOrder(o=>({...o,...data}))};const unsub=subscribeToPortalChanges(refresh);return unsub},[order?.id]);
  const home=<div className="landing-page"><div className="page-background" aria-hidden="true"/><div className="page-wash" aria-hidden="true"/><header className="site-header"><div className="brand-lockup"><span className="brand-name">CO-CO KITCHEN</span><span className="brand-subtitle">HOMELY KERALA FLAVOURS</span></div><span className="since">Since 2024</span></header><main className="content"><section className="welcome-card"><div className="welcome-inner"><h1>Made with love.</h1><p className="welcome-subtitle">Homely Kerala flavours</p><div className="heart-rule"><span/><Heart size={29} strokeWidth={1.7}/><span/></div></div></section><section className="date-block"><span className="today-label">TODAY</span><strong>{formatDate(now).replace(/, 2026$/,'')}</strong><span className="live-time">{new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit',hour12:true}).format(now)}</span></section><label className="customer-name-field">YOUR NAME<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name"/><button className="start-button" onClick={proceed}>LET’S PROCEED <ArrowRight size={18}/></button></label><div className="instruction-box">CHOOSE ONE TO PROCEED</div><section className="meal-list">{['lunch','dinner'].map(id=>{const m=MEALS.find(x=>x.id===id);const open=slotOpen(id);const live=itemsFor(id);return <article className="meal-card" key={id}><div className="meal-card-top"/><div className="meal-heading"><span className="meal-kicker">{open?'PRE-ORDER '+m.title.toUpperCase():'CURRENTLY UNAVAILABLE'}</span><h2>Pre-order {m.title}</h2><p>{m.delivery}</p></div><div className="meal-items">{(live.length?live:m.items.map(x=>({item_name:x}))).map((x,i)=><React.Fragment key={x.item_name}><span>{x.item_name}</span>{i<(live.length?live:m.items).length-1&&<i>·</i>}</React.Fragment>)}</div><button className="start-button" disabled={!open} onClick={()=>openSlot(id)}>{open?'START PRE-ORDER':'NOT AVAILABLE'} {open&&<ArrowRight size={18}/>}</button></article>})}</section>{error&&<div className="login-error">{error}</div>}</main></div>;
  if(page==='home')return home;
  if(page==='menu')return <CustomerMenu slot={slot} items={itemsFor(slot)} cart={cart} add={add} changeQty={changeQty} onBack={()=>setPage('home')} onCart={checkout}/>;
  if(page==='checkout')return <CustomerCheckout name={name} mobile={mobile} setMobile={setMobile} cart={cart} total={total} onBack={()=>setPage('menu')} onPlace={placeOrder} error={error}/>;
  if(page==='payment')return <CustomerPayment order={order} total={total} onPaid={markPaid}/>;
  return <CustomerVerification order={order} onHome={()=>{setPage('home');setCart([])}}/>;
}

function CustomerMenu({slot,items,cart,add,changeQty,onBack,onCart}) {
  const title=slot==='lunch'?'Lunch':'Dinner'; const meal=MEALS.find(x=>x.id===slot);
  return <div className="customer-flow"><header className="site-header"><div className="brand-lockup"><span className="brand-name">CO-CO KITCHEN</span><span className="brand-subtitle">HOMELY KERALA FLAVOURS</span></div><button className="cart-button" onClick={onCart}>YOUR ORDER ({cart.reduce((s,x)=>s+x.quantity,0)})</button></header><main className="customer-content"><button className="back-dashboard" onClick={onBack}>← BACK TO SLOTS</button><div className="customer-hero"><span>{title.toUpperCase()} MENU</span><h1>{title}</h1><p>{meal.delivery}</p></div><section className="customer-menu-list">{items.map(item=><article className="customer-item" key={item.id}><div><span>{item.item_name}</span><small>{item.remaining_quantity} available</small></div><strong>₹{Number(item.price).toFixed(0)}</strong><button onClick={()=>add(item)}>ADD</button></article>)}{!items.length&&<div className="empty-customer">This menu is currently unavailable or sold out.</div>}</section><button className="floating-slot" onClick={()=>onBack()}>{slot==='lunch'?'CLICK FOR DINNER MENU →':'CLICK FOR LUNCH MENU →'}</button></main></div>;
}

function CustomerCheckout({name,mobile,setMobile,cart,total,onBack,onPlace,error}) {
  return <div className="customer-flow"><header className="site-header"><div className="brand-lockup"><span className="brand-name">CO-CO KITCHEN</span><span className="brand-subtitle">HOMELY KERALA FLAVOURS</span></div></header><main className="customer-content"><button className="back-dashboard" onClick={onBack}>← BACK TO MENU</button><div className="customer-hero"><span>YOUR ORDER</span><h1>Order Overview</h1></div><section className="customer-order-box">{['lunch','dinner'].map(slot=>{const rows=cart.filter(x=>x.slot===slot);if(!rows.length)return null;return <div className="order-slot-box" key={slot}><h3>{slot.toUpperCase()}</h3>{rows.map(x=><div className="order-line" key={x.id}><span>{x.item_name} × {x.quantity}</span><strong>₹{x.quantity*Number(x.price)}</strong></div>)}</div>})}<div className="customer-total"><span>TOTAL</span><strong>₹{total}</strong></div></section><section className="customer-form"><label>YOUR NAME<input value={name} readOnly/></label><label>MOBILE NUMBER<input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,10))} inputMode="numeric" placeholder="10-digit mobile number"/></label>{error&&<div className="login-error">{error}</div>}<button className="start-button" onClick={onPlace}>PLACE ORDER <ArrowRight size={18}/></button></section></main></div>;
}

function CustomerPayment({order,total,onPaid}) {
  return <div className="customer-flow"><header className="site-header"><div className="brand-lockup"><span className="brand-name">CO-CO KITCHEN</span><span className="brand-subtitle">HOMELY KERALA FLAVOURS</span></div></header><main className="customer-content centered"><div className="customer-hero"><span>PAYMENT</span><h1>UPI PAYMENT</h1><p>Complete payment using the QR / UPI details below.</p></div><div className="qr-placeholder">UPI QR</div><div className="upi-id">coco-kitchen@upi</div><p className="payment-note">Demo UPI ID — replace with the kitchen's registered UPI ID.</p><button className="start-button" onClick={onPaid}>PAYMENT COMPLETED</button><p className="payment-note">Payment will be verified by CO-CO Kitchen after submission.</p></main></div>;
}

function CustomerVerification({order,onHome}) {
  const verified=order?.payment_status==='VERIFIED';
  return <div className="customer-flow"><header className="site-header"><div className="brand-lockup"><span className="brand-name">CO-CO KITCHEN</span><span className="brand-subtitle">HOMELY KERALA FLAVOURS</span></div></header><main className="customer-content centered"><div className="verification-logo">CO-CO KITCHEN</div><span className="admin-eyebrow">{verified?'PAYMENT VERIFIED':'PAYMENT BEING VERIFIED'}</span><h1>{verified?'PAYMENT VERIFIED':'PAYMENT BEING VERIFIED'}</h1><p>Thank you, {order?.customer_name||'there'}.</p><div className="payment-status-badge">{verified?'VERIFIED':'BEING VERIFIED'}</div><p>Your payment is {verified?'verified.':'being verified, in the meantime tell us your fav dish of Co-co'}</p>{!verified&&<div className="food-fact">Try our homely Kerala flavours — fresh, simple and made with care.</div>}<button className="start-button" onClick={onHome}>BACK TO HOME</button></main></div>;
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
  const [saving,setSaving]=useState(false);
  const verified = payment === 'VERIFIED';
  const items=order.raw?.order_items||[];
  const verifyPayment=async()=>{
    if(!cokitbaseReady||!order.raw?.id){setPayment('VERIFIED');return;}
    setSaving(true);
    try{
      const now=new Date().toISOString();
      const {error:e1}=await cokitbase.from('orders').update({payment_status:'VERIFIED',updated_at:now}).eq('id',order.raw.id);
      if(e1) throw e1;
      const {error:e2}=await cokitbase.from('payments').update({status:'VERIFIED',verified_at:now,updated_at:now}).eq('order_id',order.raw.id);
      if(e2) throw e2;
      setPayment('VERIFIED');
    }catch(err){alert(err.message||'Could not verify payment.');}
    finally{setSaving(false);}
  };
  const saveStatus=async()=>{
    if(!cokitbaseReady||!order.raw?.id){alert('Order updated in prototype.');return;}
    setSaving(true);
    try{
      const {error}=await cokitbase.from('orders').update({order_status:status,updated_at:new Date().toISOString()}).eq('id',order.raw.id);
      if(error) throw error;
      alert('Order update saved.');
    }catch(err){alert(err.message||'Could not update order.');}
    finally{setSaving(false);}
  };
  return <div className="admin-shell dashboard-shell">
    <header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="dashboard-content order-detail-page">
      <button className="back-dashboard" onClick={onBack}><ArrowLeft size={16}/> ALL ORDERS</button>
      <section className="detail-hero"><div><span className="admin-eyebrow">ORDER DETAILS</span><h1>{order.id}</h1><p>{order.meal}</p></div><b className={'pill '+status.toLowerCase()}>{status}</b></section>
      <section className="detail-grid">
        <div className="dashboard-panel detail-panel"><div className="panel-heading"><div><span className="panel-kicker">CUSTOMER</span><h2>{order.name}</h2></div></div><div className="customer-details"><div><Phone size={16}/><span>{order.mobile||'Mobile not provided'}</span></div><div><MapPin size={16}/><span>{order.raw?.delivery_location||'Location not provided'}</span></div><div><CalendarDays size={16}/><span>{order.raw?.order_date||formatDate(new Date())}</span></div></div></div>
        <div className="dashboard-panel payment-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">PAYMENT</span><h2>{order.total}</h2></div><b className={'pill '+payment.toLowerCase()}>{payment}</b></div><div className="payment-detail-body"><div className="payment-method"><CircleDollarSign size={18}/><div><strong>UPI PAYMENT</strong><span>{payment==='CUSTOMER_MARKED_PAID'?'Customer marked payment as completed':'Payment status from Cokitbase'}</span></div></div>{!verified&&<button className="verify-payment-button" disabled={saving} onClick={verifyPayment}><CheckCircle2 size={17}/> {saving?'VERIFYING…':'VERIFY PAYMENT'}</button>}{verified&&<div className="verified-note"><CheckCircle2 size={17}/> PAYMENT VERIFIED — CUSTOMER WILL SEE THIS UPDATE</div>}</div></div>
      </section>
      <section className="dashboard-panel items-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">ORDER SUMMARY</span><h2>Items Ordered</h2></div><span className="meal-label">{order.meal}</span></div><div className="detail-items">{items.length?items.map(i=><div key={i.id}><span>{i.item_name}</span><strong>{i.quantity} × ₹{Number(i.unit_price).toFixed(0)}</strong></div>):<div><span>Order items will appear here</span><strong>{order.total}</strong></div>}</div><div className="detail-total"><span>ORDER TOTAL</span><strong>{order.total}</strong></div></section>
      <section className="dashboard-panel status-detail-panel"><div className="panel-heading"><div><span className="panel-kicker">KITCHEN WORKFLOW</span><h2>Order Status</h2></div></div><div className="workflow">{['PLACED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED'].map((x,i)=><React.Fragment key={x}>{i>0&&<ChevronRight size={15}/>}<button className={status===x?'current':''} onClick={()=>setStatus(x)}>{x.replaceAll('_',' ')}</button></React.Fragment>)}</div></section>
      <div className="admin-detail-actions"><button className="secondary-detail-button" onClick={onBack}>BACK TO ORDERS</button><button className="admin-primary detail-save-button" disabled={saving} onClick={saveStatus}>{saving?'SAVING…':'SAVE ORDER UPDATE'} <ArrowRight size={17}/></button></div>
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
}function AdminDashboard({onOrders,onMenu,onLogout}){
  const [orders,setOrders]=useState(ORDERS);
  const [slots,setSlots]=useState([]);
  const [menu,setMenu]=useState([]);
  const [loading,setLoading]=useState(true);
  const today=new Date().toISOString().slice(0,10);
  const load=async()=>{
    if(!cokitbaseReady){setLoading(false);return;}
    try{
      const [{data:o},{data:m},sl]=await Promise.all([
        cokitbase.from('orders').select('*, order_items(*)').eq('order_date',today),
        cokitbase.from('menus').select('*').eq('service_date',today),
        getSlotAvailability()
      ]);
      setOrders((o||[]).map(x=>({id:x.order_code,name:x.customer_name,meal:[...new Set((x.order_items||[]).map(i=>i.slot))].join(' + '),total:Number(x.total_amount||0),payment:x.payment_status,status:x.order_status,raw:x})));
      setMenu(m||[]); setSlots(sl||[]);
    }catch(err){console.error(err);}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();const unsub=subscribeToPortalChanges(()=>load());return unsub;},[]);
  const pending=orders.filter(o=>o.payment==='PENDING'||o.payment==='CUSTOMER_MARKED_PAID');
  const verified=orders.filter(o=>o.payment==='VERIFIED');
  const ready=orders.filter(o=>o.status==='READY'||o.status==='OUT_FOR_DELIVERY');
  const meals=menu.reduce((sum,x)=>sum+Math.max(0,(x.total_quantity||0)-(x.remaining_quantity||0)),0);
  const revenue=verified.reduce((sum,o)=>sum+Number(o.total||0),0);
  const lunchOpen=slots.find(x=>x.id==='lunch')?.is_available??true;
  const dinnerOpen=slots.find(x=>x.id==='dinner')?.is_available??true;
  return <div className="admin-shell dashboard-shell"><header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><Utensils size={19}/></div><div><strong>CO-CO KITCHEN</strong><span>ADMINISTRATION</span></div></div><div className="admin-header-right"><span className="admin-date">{formatDate(new Date())}</span><button className="logout-button" onClick={onLogout}><LogOut size={16}/> LOG OUT</button></div></header><main className="dashboard-content"><section className="dashboard-intro"><div><span className="admin-eyebrow">KITCHEN CONTROL CENTRE</span><h1>Good morning.</h1><p>{loading?'Connecting to Cokitbase…':'Live order and kitchen overview.'}</p></div><div className="service-status"><span className="status-dot"/>{lunchOpen||dinnerOpen?'SERVICE OPEN':'SERVICE CLOSED'}</div></section><section className="stats-grid"><StatCard icon={ClipboardList} label="TOTAL ORDERS" value={orders.length} detail="Today's orders"/><StatCard icon={CreditCard} label="PAYMENTS PENDING" value={String(pending.length).padStart(2,'0')} detail="Awaiting verification" alert/><StatCard icon={Utensils} label="TO PREPARE" value={meals} detail="Meals already ordered"/><StatCard icon={PackageCheck} label="READY FOR DELIVERY" value={ready.length} detail="Orders completed"/><StatCard icon={TrendingUp} label="TODAY'S REVENUE" value={'₹'+revenue.toLocaleString('en-IN')} detail="Verified payments"/></section><section className="dashboard-grid"><div className="dashboard-panel kitchen-panel"><div className="panel-heading"><div><span className="panel-kicker">KITCHEN</span><h2>Preparation Summary</h2></div><button className="panel-link" onClick={onMenu}>VIEW MENU <ChevronRight size={16}/></button></div><div className="slot-tabs"><button className={lunchOpen?'active':''}>LUNCH <span>{orders.filter(o=>String(o.meal).toLowerCase().includes('lunch')).length} orders</span></button><button className={dinnerOpen?'active':''}>DINNER <span>{orders.filter(o=>String(o.meal).toLowerCase().includes('dinner')).length} orders</span></button></div><div className="prep-list">{menu.length?menu.map(x=><div className="prep-row" key={x.id}><span>{x.item_name}</span><strong>{Math.max(0,(x.total_quantity||0)-(x.remaining_quantity||0))}</strong></div>):<p className="panel-description">No menu published for today.</p>}</div></div><div className="dashboard-panel payment-panel"><div className="panel-heading"><div><span className="panel-kicker">ACTION REQUIRED</span><h2>Payment Verification</h2></div><span className="count-badge">{String(pending.length).padStart(2,'0')} PENDING</span></div><p className="panel-description">Payments marked as completed by customers are waiting for manual verification.</p><div className="pending-list">{pending.slice(0,5).map(o=><div className="pending-row" key={o.id}><div><strong>{o.id}</strong><span>{o.name} · {o.meal}</span></div><button onClick={onOrders}>VERIFY <ChevronRight size={14}/></button></div>)}</div><button className="full-panel-button" onClick={onOrders}>VIEW ALL PAYMENTS <ArrowRight size={16}/></button></div></section><section className="dashboard-panel orders-panel"><div className="panel-heading"><div><span className="panel-kicker">TODAY</span><h2>Recent Orders</h2></div><button className="panel-link" onClick={onOrders}>VIEW ALL ORDERS <ChevronRight size={16}/></button></div><div className="orders-table"><div className="table-row table-head"><span>ORDER</span><span>CUSTOMER</span><span>MEAL</span><span>TOTAL</span><span>PAYMENT</span><span>STATUS</span></div>{orders.slice(0,8).map(o=><div className="table-row" key={o.id}><span className="order-id">{o.id}</span><span>{o.name}</span><span>{o.meal}</span><span className="amount">₹{Number(o.total||0).toFixed(0)}</span><span><b className={'pill '+o.payment.toLowerCase()}>{o.payment}</b></span><span><b className={'pill '+o.status.toLowerCase()}>{o.status}</b></span></div>)}</div></section></main></div>;}



function AdminApp() {
  const [loggedIn,setLoggedIn]=useState(false);
  const [view,setView]=useState('dashboard');
  const [selectedOrder,setSelectedOrder]=useState(null);
  const logout=()=>{setLoggedIn(false);setView('dashboard');setSelectedOrder(null);};
  if(!loggedIn) return <AdminLogin onLogin={()=>setLoggedIn(true)}/>;
  if(view==='orders') return <AdminOrders onBack={()=>setView('dashboard')} onOpenOrder={o=>{setSelectedOrder(o);setView('detail')}} onLogout={logout}/>;
  if(view==='detail'&&selectedOrder) return <AdminOrderDetails order={selectedOrder} onBack={()=>setView('orders')} onLogout={logout}/>;
  if(view==='menu') return <AdminMenu onBack={()=>setView('dashboard')} onLogout={logout}/>;
  return <AdminDashboard onOrders={()=>setView('orders')} onMenu={()=>setView('menu')} onLogout={logout}/>;
}

function App() {
  const isAdmin=window.location.hash.toLowerCase().replace('#','')==='admin' || new URLSearchParams(window.location.search).has('admin');
  return isAdmin ? <AdminApp/> : <CustomerLanding/>;
}

createRoot(document.getElementById('root')).render(<App/>);
