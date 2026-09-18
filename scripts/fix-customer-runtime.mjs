import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

if (!source.includes('function safeSessionGet(')) {
  source = source.replace(
    "function formatDate(date) {\n  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(date).toUpperCase();\n}\n",
    "function formatDate(date) {\n  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(date).toUpperCase();\n}\n\nfunction safeSessionGet(key, fallback = '') {\n  try { return sessionStorage.getItem(key) || fallback; } catch { return fallback; }\n}\n\nfunction safeSessionSet(key, value) {\n  try { sessionStorage.setItem(key, value); } catch {}\n}\n"
  );
}

source = source
  .replace("sessionStorage.getItem('cocoCustomerName')||''", "safeSessionGet('cocoCustomerName')")
  .replace("sessionStorage.getItem('cocoCustomerMobile')||''", "safeSessionGet('cocoCustomerMobile')")
  .replace("sessionStorage.setItem('cocoCustomerName',name.trim());sessionStorage.setItem('cocoCustomerMobile',mobile);", "safeSessionSet('cocoCustomerName',name.trim());safeSessionSet('cocoCustomerMobile',mobile);")
  .replace("sessionStorage.setItem('cocoOrderToken',o.tracking_token);", "safeSessionSet('cocoOrderToken',o.tracking_token);")
  .replace("sessionStorage.getItem('cocoOrderToken')", "safeSessionGet('cocoOrderToken')");

const oldTestimonials = "const loadTestimonials=async()=>{const {data}=await cokitbase.from('testimonials').select('*').eq('is_approved',true).eq('is_featured',true).order('created_at',{ascending:false}).limit(8);setTestimonials(data||[])};loadTestimonials();";
const newTestimonials = "const loadTestimonials=async()=>{try{const {data}=await cokitbase.from('testimonials').select('*').eq('is_approved',true).eq('is_featured',true).order('created_at',{ascending:false}).limit(8);setTestimonials(data||[])}catch(_e){setTestimonials([])}};loadTestimonials();";
source = source.replace(oldTestimonials, newTestimonials);

source = source.replace(
  "function TestimonialBubbles({testimonials=[]}){\n  if(!testimonials.length)return null;\n  return <section",
  "function TestimonialBubbles({testimonials=[]}){\n  if(!testimonials.length)return null;\n  return <section"
);

if (!source.includes('class CustomerErrorBoundary')) {
  const boundary = `
class CustomerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Customer portal render error', error, info);
  }
  render() {
    if (this.state.error) {
      return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px',background:'#f7f0e4',color:'#24352a',fontFamily:'Georgia,serif',textAlign:'center'}}>
        <div style={{maxWidth:'420px'}}>
          <div style={{fontSize:'12px',letterSpacing:'3px',fontWeight:700,marginBottom:'14px'}}>CO-CO KITCHEN</div>
          <h1 style={{fontSize:'34px',margin:'0 0 12px'}}>We’re refreshing the kitchen.</h1>
          <p style={{lineHeight:1.7,margin:'0 0 24px'}}>The customer portal hit a temporary loading issue. Please refresh this page to continue.</p>
          <button onClick={()=>window.location.reload()} style={{border:0,padding:'14px 20px',borderRadius:'999px',fontWeight:700,cursor:'pointer'}}>REFRESH PORTAL</button>
        </div>
      </main>;
    }
    return this.props.children;
  }
}

`;
  source = source.replace("\nfunction App() {", "\n" + boundary + "function App() {");
}

source = source.replace(
  "return isAdmin ? <AdminApp/> : <CustomerLanding/>;",
  "return isAdmin ? <AdminApp/> : <CustomerErrorBoundary><CustomerLanding/></CustomerErrorBoundary>;"
);

fs.writeFileSync(path, source);
console.log('Customer runtime hardening applied.');
