import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Package,
    MapPin,
    MessageCircle,
    TrendingUp,
    Users,
    Star,
    Shield,
    Zap,
    Globe,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import SEO from '../components/SEO';

/* ── Scroll-reveal hook ───────────────────────────────── */
function useReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

/* ── Animated counter ─────────────────────────────────── */
function Counter({ end, suffix = '' }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let start = 0;
        const duration = 1800;
        const startTime = performance.now();
        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            const current = Math.round(eased * end);
            if (current !== start) {
                el.textContent = current.toLocaleString() + suffix;
                start = current;
            }
            if (progress < 1) requestAnimationFrame(step);
        };
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(step);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [end, suffix]);
    return <span ref={ref}>0{suffix}</span>;
}

/* ── Data ─────────────────────────────────────────────── */
const STEPS = [
    {
        step: '01',
        title: 'Post or Browse',
        description: 'Senders post packages, travelers share their routes. One click to connect.',
        icon: Globe,
        color: 'from-cyan-500/20 to-blue-500/20',
        iconColor: 'text-cyan-600',
    },
    {
        step: '02',
        title: 'Bid & Chat',
        description: 'Travelers bid competitively. Chat in real-time to finalize details.',
        icon: MessageCircle,
        color: 'from-violet-500/20 to-purple-500/20',
        iconColor: 'text-violet-600',
    },
    {
        step: '03',
        title: 'Deliver & Review',
        description: 'Package delivered. Both parties rate each other to build community trust.',
        icon: Shield,
        color: 'from-emerald-500/20 to-green-500/20',
        iconColor: 'text-emerald-600',
    },
];

const FEATURES = [
    {
        title: 'Lightning Fast Matching',
        description: 'AI-powered route matching connects you with the perfect traveler in seconds.',
        icon: Zap,
        gradient: 'from-amber-500 to-orange-500',
    },
    {
        title: 'Real-time Messaging',
        description: 'Instant chat with end-to-end communication. No phone numbers shared.',
        icon: MessageCircle,
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        title: 'Verified Reviews',
        description: '4.9★ average from 10,000+ deliveries. Trust backed by real experiences.',
        icon: Star,
        gradient: 'from-violet-500 to-purple-500',
    },
    {
        title: 'Global Coverage',
        description: 'Active across 50+ countries. Send locally or internationally.',
        icon: Globe,
        gradient: 'from-emerald-500 to-teal-500',
    },
];

const STATS = [
    { value: 10000, suffix: '+', label: 'Items Delivered' },
    { value: 5000, suffix: '+', label: 'Active Travelers' },
    { value: 50, suffix: '+', label: 'Countries' },
];

/* ── Component ────────────────────────────────────────── */
export default function Home() {
    const howRef = useReveal();
    const featRef = useReveal();
    const ctaRef = useReveal();

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <SEO
                title=""
                description="DropLoop connects senders with travelers for fast, affordable peer-to-peer delivery across India and 50+ countries. Post a package, browse travel routes, bid, chat, and deliver."
                path="/"
            />

            {/* ═══════════════════════════════════════════ HERO ═══════════════════════════════════════════ */}
            <section className="relative hero-mesh overflow-hidden">
                {/* Decorative floating orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                    <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-primary/15 to-cyan-400/10 blur-3xl animate-float" />
                    <div className="absolute top-40 right-[5%] w-96 h-96 rounded-full bg-gradient-to-br from-accent/10 to-pink-400/5 blur-3xl animate-float-reverse" />
                    <div className="absolute bottom-10 left-[40%] w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-emerald-400/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                    {/* Subtle dot grid */}
                    <div className="absolute inset-0 dot-grid opacity-[0.35]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
                    <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
                        {/* Left – Copy */}
                        <div className="space-y-8 max-w-xl">
                            {/* Badge */}
                            <div className="animate-fade-in">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Trusted by 10,000+ users
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] font-extrabold leading-[1.08] tracking-tight animate-fade-in delay-100">
                                Send Anything,{' '}
                                <span className="gradient-text">
                                    Anywhere
                                </span>
                            </h1>

                            {/* Sub-headline */}
                            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg animate-fade-in delay-200">
                                Connect with travelers heading your way. Deliver packages{' '}
                                <span className="text-gray-900 font-medium">faster</span> and{' '}
                                <span className="text-gray-900 font-medium">cheaper</span>{' '}
                                than traditional couriers.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-in delay-300">
                                <Link to="/posts">
                                    <button className="group w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full text-white overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1 active:translate-y-0">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-[length:200%_100%] animate-gradient" />
                                        <span className="relative">Browse Requests</span>
                                        <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>
                                </Link>
                                <Link to="/create">
                                    <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full border-2 border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5 text-gray-700 hover:text-primary transition-all duration-300">
                                        Post a Request
                                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                    </button>
                                </Link>
                            </div>

                            {/* Stats strip */}
                            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in delay-500">
                                {STATS.map((stat, i) => (
                                    <div key={i} className="text-center sm:text-left">
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                            <Counter end={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right – Interactive card */}
                        <div className="hidden lg:flex items-center justify-center animate-scale-in delay-400">
                            <div className="relative w-full max-w-md">
                                {/* Glow behind the card */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-pink-400/10 rounded-3xl blur-2xl scale-105 animate-pulse-glow" />

                                {/* Main card */}
                                <div className="relative glass-strong rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
                                    {/* Floating mini cards */}
                                    <div className="space-y-4">
                                        {/* Card 1 */}
                                        <div className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-cyan-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">Electronics Package</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Mumbai → Delhi • 2.5 kg</p>
                                            </div>
                                            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">₹450</div>
                                        </div>

                                        {/* Card 2 */}
                                        <div className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center">
                                                <MapPin className="h-6 w-6 text-violet-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">Travel Route</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Bangalore → Chennai • Feb 20</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-amber-600">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                4.9
                                            </div>
                                        </div>

                                        {/* Card 3 */}
                                        <div className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">5 Active Bids</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Starting from ₹200</p>
                                            </div>
                                            <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Live</div>
                                        </div>
                                    </div>

                                    {/* Orbiting dot (subtle) */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="animate-orbit opacity-40">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section divider wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 56V28C240 0 480 0 720 28C960 56 1200 56 1440 28V56H0Z" fill="white" fillOpacity="0.5" />
                        <path d="M0 56V36C240 8 480 8 720 36C960 64 1200 56 1440 36V56H0Z" fill="#f9fafb" />
                    </svg>
                </div>
            </section>

            {/* ══════════════════════════════════════ HOW IT WORKS ══════════════════════════════════════ */}
            <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-gray-50" id="how-it-works">
                <div ref={howRef} className="reveal mx-auto max-w-6xl">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 border border-primary/20">
                            Simple Process
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                            How It Works
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Three simple steps to send or earn — no middlemen, no hassles.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {STEPS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="card-hover group relative bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    {/* Top gradient accent */}
                                    <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />

                                    <div className="p-8 space-y-5">
                                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color}`}>
                                            <Icon className={`h-7 w-7 ${item.iconColor}`} />
                                        </div>

                                        <div>
                                            <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Step {item.step}</span>
                                            <h3 className="text-xl font-bold text-gray-900 mt-1">{item.title}</h3>
                                        </div>

                                        <p className="text-gray-500 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════ FEATURES ══════════════════════════════════════════ */}
            <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-white" id="features">
                {/* Subtle background accent */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div ref={featRef} className="reveal relative mx-auto max-w-6xl">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-accent bg-accent/10 border border-accent/20">
                            Why DropLoop
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                            Built for Trust & Speed
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Every feature is designed to make peer-to-peer delivery safe, simple, and rewarding.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {FEATURES.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="card-hover group relative p-8 rounded-2xl bg-white border border-gray-100 overflow-hidden"
                                >
                                    {/* Hover gradient glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                                    <div className="relative space-y-4">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                                        <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════ CTA ═══════════════════════════════════════════ */}
            <section className="relative px-4 py-28 sm:px-6 lg:px-8 overflow-hidden" id="cta">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
                {/* Accent orbs */}
                <div className="absolute top-0 right-[20%] w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-[10%] w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
                {/* Dot grid overlay */}
                <div className="absolute inset-0 dot-grid opacity-[0.06]" />

                <div ref={ctaRef} className="reveal relative mx-auto max-w-3xl text-center space-y-8">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                        Ready to{' '}
                        <span className="gradient-text">get started</span>?
                    </h2>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto">
                        Join thousands of senders and travelers who trust DropLoop for peer-to-peer delivery.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/signup">
                            <button className="group w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold rounded-full text-white overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-[length:200%_100%] animate-gradient" />
                                <Sparkles className="relative h-4 w-4" />
                                <span className="relative">Create Free Account</span>
                                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                        </Link>
                        <Link to="/posts">
                            <button className="w-full sm:w-auto px-10 py-4 text-base font-semibold rounded-full border-2 border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300 hover:bg-white/5">
                                Browse Listings
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
