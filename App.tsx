import { Business, SAMPLE_BUSINESSES, MIN_BID, BRAND, TAGLINE, Transaction, PlatformStats } from './data';

type Page = 'home' | 'submit' | 'profile' | 'admin';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('rankora_businesses');
    return saved ? JSON.parse(saved) : SAMPLE_BUSINESSES;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rankora_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [paymentMode, setPaymentMode] = useState<'demo' | 'live'>(() => {
    return (localStorage.getItem('rankora_mode') as 'demo' | 'live') || 'demo';
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    localStorage.setItem('rankora_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('rankora_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('rankora_mode', paymentMode);
  }, [paymentMode]);

  const ranked = useMemo(() => {
    return [...businesses].sort((a, b) => b.currentBid - a.currentBid);
  }, [businesses]);

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const getTimeLeft = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}d ${h}h`;
  };

  const stats: PlatformStats = useMemo(() => {
    const completedDemo = transactions.filter(t => t.status === 'completed' && t.mode === 'demo' && t.type === 'bid');
    const completedLive = transactions.filter(t => t.status === 'completed' && t.mode === 'live' && t.type === 'bid');
    const refunds = transactions.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0);
    const totalBids = transactions.filter(t => t.type === 'bid' && t.status === 'completed').length;
    return {
      totalPageViews: businesses.reduce((s, b) => s + b.visitCount, 0) + 1240,
      uniqueVisitors: businesses.reduce((s, b) => s + b.uniqueVisits, 0) + 480,
      onlineNow: Math.max(1, Math.floor(Math.random() * 8) + 3),
      totalBusinesses: businesses.length,
      totalBids,
      demoGross: completedDemo.reduce((s, t) => s + t.amount, 0),
      liveGross: completedLive.reduce((s, t) => s + t.amount, 0),
      refunds,
      fees: Math.round((completedLive.reduce((s, t) => s + t.amount, 0)) * 0.02),
    };
  }, [businesses, transactions]);

  const handleVisit = (biz: Business) => {
    const allowed = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(biz.website);
    if (!allowed) {
      alert('Invalid website URL');
      return;
    }
    setBusinesses(prev =>
      prev.map(b => b.id === biz.id ? { ...b, visitCount: b.visitCount + 1, uniqueVisits: b.uniqueVisits + 1 } : b)
    );
    window.open(biz.website, '_blank', 'noopener,noreferrer');
  };

  const recordTransaction = (biz: Business, amount: number, status: Transaction['status']) => {
    const tx: Transaction = {
      id: Date.now().toString(),
      businessId: biz.id,
      businessName: biz.name,
      amount,
      status,
      mode: paymentMode,
      createdAt: new Date().toISOString(),
      type: 'bid',
    };
    setTransactions(prev => [...prev, tx]);
    return tx;
  };

  const handleBid = (id: string, amount: number) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;
    if (amount <= biz.currentBid) {
      alert(`Must bid higher than ${formatINR(biz.currentBid)}`);
      return;
    }
    if (amount < MIN_BID) {
      alert(`Minimum bid is ${formatINR(MIN_BID)}`);
      return;
    }
    if (paymentMode === 'live') {
      alert('LIVE MODE is not configured. Real payments are disabled. Switch to DEMO MODE or configure Razorpay on the server.');
      return;
    }
    const ok = confirm(
      `Confirm bid of ${formatINR(amount)} for ${biz.name}?\n\n` +
      `Payment gateway is not connected yet.\n` +
      `This will update the ranking for launch testing only.\n` +
      `No real charge will be made.`
    );
    if (!ok) return;
    recordTransaction(biz, amount, 'completed');
    setBusinesses(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, currentBid: amount, bidEndTime: new Date(Date.now() + 30 * 86400000).toISOString() }
          : b
      )
    );
    alert('Bid confirmed. Ranking updated.');
  };

  const Nav = () => (
    <nav className="sticky top-0 z-50 bg-[#05070D]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
          <span className="text-xl">👑</span>
          <span className="font-semibold text-[15px] tracking-tight text-white group-hover:text-violet-300 transition-colors">{BRAND}</span>
        </button>
        <div className="flex items-center gap-3 sm:gap-5 text-sm">
          <button onClick={() => setPage('home')} className="text-slate-400 hover:text-white transition-colors text-[13px] font-medium">Rankings</button>
          <button onClick={() => setPage('submit')} className="text-slate-400 hover:text-white transition-colors text-[13px] font-medium">Submit</button>
          <button
            onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-white px-3.5 py-1.5 rounded-md text-[13px] font-semibold"
          >
            Start Bidding
          </button>
        </div>
      </div>
    </nav>
  );

  const StatsSection = () => (
    <section className="py-12 border-t border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-1">Overview</p>
            <h2 className="text-xl font-bold tracking-tight">Platform Activity</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Businesses', value: stats.totalBusinesses },
            { label: 'Total Bids', value: stats.totalBids },
            { label: 'Unique Visitors', value: stats.uniqueVisitors.toLocaleString() },
            { label: 'Platform Revenue', value: formatINR(stats.demoGross + stats.liveGross) },
          ].map(s => (
            <div key={s.label} className="card rounded-xl p-4">
              <div className="text-xl font-semibold text-white tabular-nums">{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );

  const RevenueTracker = () => (
    <section className="py-12 bg-white/5">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-bold tracking-tight mb-2">Platform Revenue</h2>
        <p className="text-sm text-slate-500 mb-6">
          Rankora platform revenue from bidding. Not the revenue of listed businesses.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card rounded-xl p-5">
            <div className="text-xs text-slate-400">Gross Revenue</div>
            <div className="text-2xl font-bold mt-1">{formatINR(stats.demoGross)}</div>
          </div>
          <div className="card rounded-xl p-5">
            <div className="text-xs text-slate-400">Live Gross (verified only)</div>
            <div className="text-2xl font-bold mt-1 text-green-400">{formatINR(stats.liveGross)}</div>
          </div>
          <div className="card rounded-xl p-5">
            <div className="text-xs text-slate-400">Net Live Revenue</div>
            <div className="text-2xl font-bold mt-1">{formatINR(Math.max(0, stats.liveGross - stats.fees - stats.refunds))}</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Failed payments are not counted. Figures update as bids are confirmed.</p>
      </div>
    </section>
  );

  const Home = () => (
    <div>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.12)_0%,_transparent_55%)]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live competitions open
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 text-white">
            The internet's next<br className="hidden sm:block" /> big thing starts here.
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Compete for the #1 spot. Outbid rivals. Put your brand on the map.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary text-white px-7 py-3 rounded-lg font-semibold text-sm tracking-wide">
              Explore Rankings
            </button>
            <button onClick={() => setPage('submit')} className="border border-slate-700 hover:border-slate-500 hover:bg-white/5 px-7 py-3 rounded-lg font-medium text-sm text-slate-300 transition-colors">
              Submit Your Business
            </button>
          </div>
        </div>
      </section>

      <StatsSection />
      <RevenueTracker />

      {/* Leaderboard */}
      <section id="leaderboard" className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-1">Competition</p>
              <h2 className="text-2xl font-bold tracking-tight text-white">Live Leaderboard</h2>
              <p className="text-slate-500 text-sm mt-1">Highest bid takes the top spot</p>
            </div>
            <div className="text-xs text-slate-500 font-medium">Min bid {formatINR(MIN_BID)}</div>
          </div>

          <div className="space-y-2.5">
            {ranked.map((b, i) => (
              <div
                key={b.id}
                className="card rounded-xl px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                onClick={() => { setSelectedId(b.id); setPage('profile'); }}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? 'rank-1 text-white' : 'rank-other text-slate-300'}`}>
                    #{i + 1}
                  </div>
                  <div className="text-2xl shrink-0">{b.logo}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[15px] text-white truncate">{b.name}</span>
                      {b.verified && <span className="text-[10px] font-medium bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded">Verified</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.category} · {b.city}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-6 text-sm sm:text-right items-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Bid</div>
                    <div className="font-semibold text-violet-400 tabular-nums">{formatINR(b.currentBid)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Visits</div>
                    <div className="font-medium text-slate-200 tabular-nums">{b.visitCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Ends</div>
                    <div className="font-medium text-slate-200 tabular-nums">{getTimeLeft(b.bidEndTime)}</div>
                  </div>
                  <div className="col-span-3 sm:col-span-1 flex sm:justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVisit(b); }}
                      className="text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-white/5 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Visit Website
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const Profile = () => {
    const biz = businesses.find(b => b.id === selectedId);
    if (!biz) return <div className="p-8 text-center">Not found</div>;
    const rank = ranked.findIndex(b => b.id === biz.id) + 1;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => setPage('home')} className="text-sm text-slate-400 mb-6">← Back</button>
        <div className="card rounded-3xl p-8 glow">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{biz.logo}</div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{biz.name}</h1>
                {biz.verified && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Verified</span>}
              </div>
              <p className="text-slate-400 mt-1">{biz.category} • {biz.city}</p>
              <p className="mt-4 text-slate-300">{biz.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">#{rank}</div>
              <div className="text-xs text-slate-400">Rank</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatINR(biz.currentBid)}</div>
              <div className="text-xs text-slate-400">Winning Bid</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{getTimeLeft(biz.bidEndTime)}</div>
              <div className="text-xs text-slate-400">Remaining</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button onClick={() => handleVisit(biz)} className="bg-secondary hover:bg-blue-600 px-6 py-3 rounded-xl font-medium">
              Visit Website
            </button>
            <button
              onClick={() => {
                const amt = prompt(`Enter bid > ${formatINR(biz.currentBid)} (min ${formatINR(MIN_BID)})`);
                if (amt) handleBid(biz.id, parseInt(amt));
              }}
              className="bg-primary hover:bg-violet-600 px-6 py-3 rounded-xl font-medium"
            >
              Outbid Now
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            Next minimum bid: {formatINR(biz.currentBid + 1)} • Visits tracked: {biz.visitCount.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  const Submit = () => {
    const [form, setForm] = useState({ name: '', website: '', category: 'AI Tools', description: '' });
    const [done, setDone] = useState(false);

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!/^https?:\/\//.test(form.website)) {
        alert('Website must start with http:// or https://');
        return;
      }
      const newBiz: Business = {
        id: Date.now().toString(),
        name: form.name,
        logo: '🚀',
        website: form.website,
        category: form.category,
        description: form.description,
        currentBid: 0,
        visitCount: 0,
        uniqueVisits: 0,
        bidEndTime: new Date(Date.now() + 30 * 86400000).toISOString(),
        verified: false,
        city: 'Global',
      };
      setBusinesses(prev => [...prev, newBiz]);
      setDone(true);
    };

    if (done) return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="text-6xl mb-4">👑</div>
        <h2 className="text-2xl font-bold mb-2">Submitted</h2>
        <p className="text-slate-400 mb-6">Your business is now on the board. Start bidding to climb.</p>
        <button onClick={() => setPage('home')} className="bg-primary px-6 py-3 rounded-xl">View Rankings</button>
      </div>
    );

    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Submit Your Business</h1>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Business Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3" />
          <input required placeholder="https://yourwebsite.com" value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3" />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3">
            <option>AI Tools</option><option>SaaS</option><option>Fashion</option><option>Fragrance</option><option>Consumer</option><option>Other</option>
          </select>
          <textarea required placeholder="Short description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3" rows={3} />
          <button type="submit" className="w-full bg-primary hover:bg-violet-600 py-3 rounded-xl font-semibold">Submit</button>
        </form>
      </div>
    );
  };

  const Admin = () => {
    if (!isAdmin) return <div className="p-8 text-center">Admin access required.</div>;
    const demoTx = transactions.filter(t => t.mode === 'demo');
    const liveTx = transactions.filter(t => t.mode === 'live');

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={() => setPage('home')} className="text-sm text-slate-400">← Back</button>
        </div>

        <div className="card rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-3">Payment Environment</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMode('demo')}
              className={`px-4 py-2 rounded-lg ${paymentMode === 'demo' ? 'bg-amber-500 text-black' : 'bg-white/5'}`}
            >
              DEMO MODE
            </button>
            <button
              onClick={() => {
                if (confirm('LIVE MODE requires server-side Razorpay keys and webhook verification. It is currently disabled. Continue in DEMO?')) {
                  setPaymentMode('demo');
                }
              }}
              className="px-4 py-2 rounded-lg bg-white/5 text-slate-500 cursor-not-allowed"
              disabled
            >
              LIVE MODE (Not Configured)
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Switching is local only. Real protection must be server-side environment variables + authorization. LIVE MODE stays disabled until Razorpay live keys and webhooks are verified.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card rounded-xl p-4">
            <div className="text-sm text-slate-400">Demo Transactions</div>
            <div className="text-2xl font-bold">{demoTx.length}</div>
          </div>
          <div className="card rounded-xl p-4">
            <div className="text-sm text-slate-400">Live Transactions</div>
            <div className="text-2xl font-bold">{liveTx.length}</div>
          </div>
        </div>

        <h3 className="font-semibold mb-3">Recent Demo Transactions</h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {demoTx.slice().reverse().map(t => (
            <div key={t.id} className="bg-white/5 rounded-lg p-3 text-sm flex justify-between">
              <span>{t.businessName} — {formatINR(t.amount)}</span>
              <span className={t.status === 'completed' ? 'text-green-400' : 'text-red-400'}>{t.status} • {t.mode}</span>
            </div>
          ))}
          {demoTx.length === 0 && <p className="text-slate-500 text-sm">No demo transactions yet.</p>}
        </div>

        <div className="mt-8 text-xs text-slate-500">
          All numbers above are derived from localStorage. They are not real production analytics or revenue. Configure Supabase + Razorpay for live data.
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Nav />
      {page === 'home' && <Home />}
      {page === 'profile' && <Profile />}
      {page === 'submit' && <Submit />}
      {page === 'admin' && <Admin />}
      <footer className="border-t border-slate-800/60 py-10 text-center text-xs text-slate-600">
        <p className="font-medium text-slate-500">© 2026 {BRAND} · {TAGLINE}</p>
        <p className="mt-2 max-w-lg mx-auto leading-relaxed">Rankings are paid placements, not quality certifications.</p>
      </footer>
    </div>
  );
}

export default App;