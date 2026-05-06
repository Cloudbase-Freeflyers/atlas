import { Providers } from "./Providers"
import { AuthGuard } from "./auth-components"
import AppSidebar from "./components/shell/AppSidebar"
import AppBody from "./components/shell/AppBody"
import CommandPalette from "./components/shell/CommandPalette"
import ChatPanel from "./components/chat/ChatPanel"
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
                        <AppSidebar />
                        <CommandPalette />
                        <ChatPanel />
                        <AppBody>{children}</AppBody>
                    </AuthGuard>
                </Providers>
            </body>
        </html>
    );
}
