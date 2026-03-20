import { requireServerAuth } from "./lib/serverApi";

export default async function HomePage() {
    await requireServerAuth();
    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-headline">
                            Autonomous Commerce Growth
                            <br />
                            <span className="gradient-text">For Amazon &amp; Omnichannel Brands</span>
                        </h1>
                        <p className="hero-subheadline">
                            Signal-driven systems built for Amazon-first and omnichannel brands.
                            <br />
                            We optimize products, traffic, and data — autonomously, with human
                            control.
                        </p>
                        <p className="hero-supporting">
                            We turn product data, paid traffic, and marketplace signals into predictable
                            revenue.
                            <br />
                            Built for Amazon. Extended to Shopify. Governed by humans.
                        </p>
                        <div className="hero-cta-group">
                            <a href="#contact" className="btn btn-primary">
                                Scale My Store
                            </a>
                            <a href="#offer" className="btn btn-secondary">
                                See Commerce System
                            </a>
                        </div>
                        <div className="hero-trust-indicators">
                            <div className="trust-item">
                                <span className="trust-number">6-8</span>
                                <span className="trust-label">Figure Ecommerce</span>
                            </div>
                            <div className="trust-item">
                                <span className="trust-icon">📦</span>
                                <span className="trust-label">Amazon + Shopify</span>
                            </div>
                            <div className="trust-item">
                                <span className="trust-number">24/7</span>
                                <span className="trust-label">Revenue Monitoring</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="problem" id="problem">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Why Growth Stalls</span>
                        <h2 className="section-title">Fragmented ownership kills momentum</h2>
                        <p className="section-description">
                            Most 6-8 figure brands run with siloed teams, disconnected tools, and unclear
                            attribution.
                        </p>
                    </div>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <h3 className="problem-title">Disconnected Operators</h3>
                            <p className="problem-text">
                                Agencies, freelancers, and internal teams work in parallel with no shared
                                intelligence.
                            </p>
                        </div>
                        <div className="problem-card">
                            <h3 className="problem-title">Blind Attribution</h3>
                            <p className="problem-text">
                                Signals are scattered across platforms, making decisions slow and
                                unreliable.
                            </p>
                        </div>
                        <div className="problem-card">
                            <h3 className="problem-title">Slow Execution Cycles</h3>
                            <p className="problem-text">
                                Manual coordination introduces delays and prevents rapid iteration.
                            </p>
                        </div>
                        <div className="problem-card">
                            <h3 className="problem-title">Platform Volatility</h3>
                            <p className="problem-text">
                                Marketplaces shift daily, but most teams can’t respond fast enough.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="solution" id="solution">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">The Fix</span>
                        <h2 className="section-title">C6 Atlas unifies growth into one system</h2>
                    </div>
                    <div className="solution-grid">
                        <div className="solution-content">
                            <h3 className="solution-title">Autonomous growth, with human control</h3>
                            <p className="solution-text">
                                We centralize signals, automate execution, and give you full visibility
                                across Amazon and omnichannel operations.
                            </p>
                            <div className="solution-bullets">
                                <div className="solution-bullet">
                                    Unified signal layer across Amazon, Shopify, ads, and analytics
                                </div>
                                <div className="solution-bullet">
                                    Automated optimization for listings, bids, and creative
                                </div>
                                <div className="solution-bullet">
                                    Always-on monitoring with exception-based oversight
                                </div>
                                <div className="solution-bullet">Clean attribution and fast decision cycles</div>
                            </div>
                        </div>
                        <div className="solution-panel">
                            <div className="panel-label">System Output</div>
                            <div className="panel-metric">
                                <span className="panel-metric-value">24/7</span>
                                <span className="panel-metric-label">Autonomous Monitoring</span>
                            </div>
                            <div className="panel-metric">
                                <span className="panel-metric-value">90%</span>
                                <span className="panel-metric-label">Faster Decisions</span>
                            </div>
                            <div className="panel-metric">
                                <span className="panel-metric-value">8+</span>
                                <span className="panel-metric-label">Tools Consolidated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="process" id="process">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">How It Works</span>
                        <h2 className="section-title">A system built for scale</h2>
                        <p className="section-description">
                            We integrate, automate, and optimize across your entire commerce stack.
                        </p>
                    </div>
                    <div className="process-steps">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <h3 className="step-title">Signal Audit</h3>
                            <p className="step-text">
                                Map every data source, marketplace signal, and growth lever.
                            </p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <h3 className="step-title">System Build</h3>
                            <p className="step-text">
                                Integrate tracking, automation, and optimization workflows.
                            </p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <h3 className="step-title">Autonomous Run</h3>
                            <p className="step-text">
                                Execute improvements continuously with observability.
                            </p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">04</div>
                            <h3 className="step-title">Control &amp; Scale</h3>
                            <p className="step-text">
                                Human governance plus scalable execution across channels.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The System Consolidation - NEW DESIGN */}
            <section className="consolidation-section" id="offer">
                <div className="container-wide">
                    <div className="section-header">
                        <span className="section-pill">System Consolidation</span>
                        <h2 className="section-title">
                            Most teams manage channels.
                            <br />
                            <span className="highlight-text">We replace them.</span>
                        </h2>
                        <p className="section-desc">From fragmented chaos to unified control</p>
                    </div>

                    {/* Split Comparison */}
                    <div className="comparison-container">
                        {/* Left: Before */}
                        <div className="comparison-side before-side">
                            <div className="side-label">
                                <span className="label-icon">❌</span>
                                <span className="label-text">Traditional Setup</span>
                            </div>
                            <div className="fragmentation-grid">
                                <div className="frag-item">
                                    <span className="frag-icon">👥</span>
                                    <span className="frag-text">Multiple Agencies</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">🏢</span>
                                    <span className="frag-text">In-House Team</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">💼</span>
                                    <span className="frag-text">Freelancers</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">📦</span>
                                    <span className="frag-text">Amazon Specialists</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">🛍️</span>
                                    <span className="frag-text">Shopify Devs</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">💰</span>
                                    <span className="frag-text">PPC Managers</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">📊</span>
                                    <span className="frag-text">Data Analysts</span>
                                </div>
                                <div className="frag-item">
                                    <span className="frag-icon">🔧</span>
                                    <span className="frag-text">Tracking Contractors</span>
                                </div>
                            </div>
                            <div className="pain-points">
                                <div className="pain-point">Manual coordination</div>
                                <div className="pain-point">Vendor juggling</div>
                                <div className="pain-point">Data silos</div>
                                <div className="pain-point">Slow execution</div>
                            </div>
                        </div>

                        {/* Center: Arrow */}
                        <div className="comparison-arrow">
                            <div className="arrow-content">
                                <div className="arrow-line"></div>
                                <div className="arrow-head">→</div>
                                <div className="arrow-label">Consolidates Into</div>
                            </div>
                        </div>

                        {/* Right: After */}
                        <div className="comparison-side after-side">
                            <div className="side-label">
                                <span className="label-icon">✓</span>
                                <span className="label-text">C6 Growth OS</span>
                            </div>
                            <div className="unified-system">
                                <div className="system-hub">
                                    <div className="hub-glow"></div>
                                    <div className="hub-content">
                                        <div className="hub-title">C6 Atlas</div>
                                        <div className="hub-subtitle">Operating System</div>
                                    </div>
                                    <div className="hub-ring"></div>
                                </div>
                                <div className="capabilities-grid">
                                    <div className="capability-item">
                                        <span className="cap-icon">⚡</span>
                                        <span className="cap-text">Autonomous Execution</span>
                                    </div>
                                    <div className="capability-item">
                                        <span className="cap-icon">👁️</span>
                                        <span className="cap-text">Full Observability</span>
                                    </div>
                                    <div className="capability-item">
                                        <span className="cap-icon">🎯</span>
                                        <span className="cap-text">Signal-Based Optimization</span>
                                    </div>
                                    <div className="capability-item">
                                        <span className="cap-icon">🔗</span>
                                        <span className="cap-text">Unified Attribution</span>
                                    </div>
                                </div>
                            </div>
                            <div className="benefits">
                                <div className="benefit-point">One system</div>
                                <div className="benefit-point">One dashboard</div>
                                <div className="benefit-point">One source of truth</div>
                                <div className="benefit-point">Zero coordination</div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="impact-grid">
                        <div className="impact-card">
                            <div className="impact-number">8+</div>
                            <div className="impact-label">Tools Replaced</div>
                            <div className="impact-desc">Consolidated into one platform</div>
                        </div>
                        <div className="impact-card highlight">
                            <div className="impact-number">40hrs</div>
                            <div className="impact-label">Saved Per Week</div>
                            <div className="impact-desc">No more vendor coordination</div>
                        </div>
                        <div className="impact-card">
                            <div className="impact-number">90%</div>
                            <div className="impact-label">Faster Decisions</div>
                            <div className="impact-desc">Real-time data, instant action</div>
                        </div>
                    </div>

                    {/* CTA Statement */}
                    <div className="consolidation-cta">
                        <h3 className="cta-headline">This isn&apos;t an agency. This is infrastructure.</h3>
                        <p className="cta-subtext">You either plug into this — or you&apos;re behind.</p>
                        <a href="#contact" className="cta-button">
                            See It In Action
                        </a>
                    </div>
                </div>
            </section>

            {/* Proprietary Systems */}
            <section className="systems" id="systems">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Proprietary Assets</span>
                        <h2 className="section-title">Systems That Scale</h2>
                        <p className="section-description">These aren&apos;t features. They&apos;re assets built in-house.</p>
                    </div>
                    <div className="systems-grid">
                        <div className="system-card">
                            <div className="system-icon">🔍</div>
                            <h3 className="system-card-title">Research Engine</h3>
                            <p className="system-card-description">
                                Product, keyword, and market research included. Automated discovery.
                                Competitive intelligence. Search behavior analysis.
                            </p>
                        </div>
                        <div className="system-card">
                            <div className="system-icon">✍️</div>
                            <h3 className="system-card-title">Content &amp; Blogging Automation</h3>
                            <p className="system-card-description">
                                AI-driven content generation with brand controls. SEO-optimized.
                                Platform-specific formatting. Human QA before publish.
                            </p>
                        </div>
                        <div className="system-card">
                            <div className="system-icon">🧠</div>
                            <h3 className="system-card-title">Audience &amp; Competitor Scraping</h3>
                            <p className="system-card-description">
                                Behavioral intelligence. Search pattern analysis. Ad intelligence.
                                Competitor positioning. Automated updates.
                            </p>
                        </div>
                        <div className="system-card">
                            <div className="system-icon">🧬</div>
                            <h3 className="system-card-title">AI Product Data Optimization</h3>
                            <p className="system-card-description">
                                Amazon listings. Shopify product pages. Shopping feeds. Algorithmic
                                optimization with human QA. A/B testing built-in.
                            </p>
                        </div>
                        <div className="system-card">
                            <div className="system-icon">🌍</div>
                            <h3 className="system-card-title">AEO + GEO + SEO Systems</h3>
                            <p className="system-card-description">
                                Custom-built workflows. Property-level automations. Curated prompt
                                libraries. Advanced capabilities beyond standard tools.
                            </p>
                        </div>
                        <div className="system-card">
                            <div className="system-icon">📊</div>
                            <h3 className="system-card-title">Tracking Infrastructure</h3>
                            <p className="system-card-description">
                                GTM setup. GA4 configuration. Server-side tracking. Custom events.
                                Conversion integrity. Attribution clarity. Included.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="proof">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Built by C6</span>
                        <h2 className="section-title">Trusted Infrastructure</h2>
                    </div>
                    <div className="proof-stats">
                        <div className="stat-item">
                            <div className="stat-number">$50M+</div>
                            <div className="stat-label">Revenue Under Management</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">6-8</div>
                            <div className="stat-label">Figure Brands</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">System Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="contact" id="contact">
                <div className="container">
                    <div className="contact-content">
                        <h2 className="contact-title">Ready for Autonomous Growth Systems?</h2>
                        <p className="contact-subtitle">
                            Serious brands only. 6-8 figure revenue. Amazon-first or omnichannel.
                            <br />
                            Systems that operate reliably. You retain control. We handle execution.
                        </p>
                        <form className="contact-form" id="contactForm">
                            <div className="form-row">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    required
                                    className="form-input"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Company Name"
                                    required
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    name="revenue"
                                    placeholder="Annual Revenue (e.g., $5M)"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <select name="platform" required className="form-input">
                                <option value="">Primary Platform</option>
                                <option value="amazon">Amazon</option>
                                <option value="shopify">Shopify</option>
                                <option value="both">Both</option>
                                <option value="other">Other</option>
                            </select>
                            <textarea
                                name="challenge"
                                placeholder="What&apos;s your biggest growth challenge?"
                                rows="4"
                                className="form-input"
                            ></textarea>
                            <button type="submit" className="btn btn-primary btn-large">
                                Get Started
                            </button>
                        </form>
                        <p className="contact-note">No spam. No fluff. Qualified leads only.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-text">C6</span>
                            <span className="logo-divider">/</span>
                            <span className="logo-sub">Atlas</span>
                        </div>
                        <div className="footer-links">
                            <a href="#offer">System</a>
                            <a href="#systems">Assets</a>
                            <a href="#contact">Contact</a>
                        </div>
                    </div>
                    <div className="footer-bottom">© 2024 C6 Atlas. All rights reserved.</div>
                </div>
            </footer>

            {/* Notification */}
            <div id="notification" className="notification"></div>

            <script src="/script.js"></script>
        </>
    );
}
