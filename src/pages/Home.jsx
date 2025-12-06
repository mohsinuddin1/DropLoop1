import { Link } from 'react-router-dom';
import { ArrowRight, Package, MapPin, MessageCircle, TrendingUp, Users, Star } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-3xl" />
                    <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-accent/20 via-transparent to-transparent blur-3xl" />
                </div>

                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-balance">
                                    Send Anything,{" "}
                                    <span className="bg-gradient-to-r from-cyan-800 to-cyan-400 bg-clip-text text-transparent">
                                        Anywhere
                                    </span>
                                </h1>
                                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                                    Connect with travelers heading your way. Get packages delivered faster and cheaper than traditional couriers.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/posts">
                                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium rounded-full text-white bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        Browse Requests
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </Link>
                                <Link to="/create">
                                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full border-2 border-border bg-transparent hover:border-primary/50 hover:bg-card transition-all duration-300">
                                        Post a Request
                                    </button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                                <div>
                                    <div className="text-2xl font-bold text-primary">10k+</div>
                                    <p className="text-sm text-muted-foreground">Items Delivered</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-accent">5k+</div>
                                    <p className="text-sm text-muted-foreground">Active Travelers</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">4.9/5</div>
                                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Illustration */}
                        <div className="hidden lg:flex items-center justify-center">
                            <div className="relative w-full aspect-square max-w-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl" />
                                <div className="absolute inset-4 bg-card rounded-xl border border-border flex items-center justify-center">
                                    <div className="space-y-8 w-full p-8">
                                        <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                                            <Package className="h-8 w-8 text-primary flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">Electronics Package</p>
                                                <p className="text-xs text-muted-foreground">NYC → Boston</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                                            <Users className="h-8 w-8 text-accent flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">3 Offers</p>
                                                <p className="text-xs text-muted-foreground">From $45</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card/30 border-y border-border">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Three simple steps to connect senders with travelers
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Post or Browse",
                                description: "Senders post items to send, travelers post their routes",
                                icon: MapPin,
                            },
                            {
                                step: "02",
                                title: "Place Bids",
                                description: "Travelers bid on items, senders choose the best option",
                                icon: TrendingUp,
                            },
                            {
                                step: "03",
                                title: "Complete & Review",
                                description: "Delivery happens, both parties review each other",
                                icon: Star,
                            },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl group-hover:from-primary/10 group-hover:to-accent/10 transition-colors" />
                                    <div className="relative p-8 space-y-4">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 text-primary font-bold">
                                            {item.step}
                                        </div>
                                        <h3 className="text-xl font-semibold">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.description}</p>
                                        <Icon className="h-6 w-6 text-muted-foreground/30" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight">Why DropLoop</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Trusted by thousands of users for safe, affordable delivery
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Real-time Messaging",
                                description: "Chat instantly with travelers or senders",
                                icon: MessageCircle,
                            },
                            {
                                title: "Verified Reviews",
                                description: "4.9+ star average ratings from real deliveries",
                                icon: Star
                            },
                            {
                                title: "Wide Coverage",
                                description: "Connect across 50+ countries worldwide",
                                icon: MapPin
                            },
                            {
                                title: "Safe & Secure",
                                description: "Built-in rating system to build trust",
                                icon: Users
                            },
                        ].map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all"
                                >
                                    <Icon className="h-8 w-8 text-primary mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-border">
                <div className="mx-auto max-w-4xl text-center space-y-6">
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Ready to get started?</h2>
                    <p className="text-xl text-muted-foreground">Join thousands of travelers and senders on DropLoop</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/signup">
                            <button className="px-8 py-4 text-lg font-medium rounded-full text-white bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                Sign Up
                            </button>
                        </Link>
                        <Link to="/posts">
                            <button className="px-8 py-4 text-lg font-medium rounded-full border-2 border-border bg-transparent hover:border-primary/50 hover:bg-card transition-all duration-300">
                                Browse Listings
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
