import { Providers } from "./Providers"
import { AuthGuard, Navigation } from "./auth-components"
import { getServerUser } from "./lib/serverApi"
import "./tailwind.css"

export default async function RootLayout({ children }) {
    const initialUser = await getServerUser();

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
            <body className={"dark"}>
                <Providers initialUser={initialUser}>
                    <AuthGuard>
                        <Navigation />
                        <div className="tw:mt-[92px]">
                            {children}
                        </div>
                    </AuthGuard>
                </Providers>
            </body>
        </html>
    );
}
