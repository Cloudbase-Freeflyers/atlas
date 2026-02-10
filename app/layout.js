export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta
                    name="description"
                    content="The operating system behind scalable commerce growth. Systems-driven growth for Amazon-first and omnichannel brands."
                />
                <title>C6 Atlas | The Operating System Behind Scalable Commerce Growth</title>
                <link rel="stylesheet" href="/styles.css" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <nav className="nav">
                    <div className="container">
                        <div className="nav-content">
                        <a href="/" className="nav-logo">
                            <span className="logo-text">C6</span>
                            <span className="logo-divider">/</span>
                            <span className="logo-sub">Atlas</span>
                        </a>
                            <div className="nav-actions">
                                <a href="/reports" className="nav-cta nav-cta-secondary">
                                    Reports
                                </a>
                                <a href="#contact" className="nav-cta">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                {children}
            </body>
        </html>
    );
}
