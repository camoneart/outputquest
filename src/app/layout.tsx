import { DotGothic16 } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { baseMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header/Header";
import { Footer } from "@/components/layout/footer/Footer";
import { HeroProvider } from "@/contexts/HeroContext";
import CommonContainer from "@/components/common/container/CommonContainer";
import "../styles/globals.css";
import { ControlViewport } from "@/components/layout/control-viewport/ControlViewport";
import { AudioProvider } from "@/contexts/AudioContext";
import { SignOutHandler } from "@/contexts/SignOutHandler";

const dotGothic16 = DotGothic16({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-dot-gothic-16",
	display: "swap",
});

export const metadata: Metadata = {
	...baseMetadata,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const redirectUrl = process.env.NEXT_PUBLIC_CONNECTION_URL || "/connection";
	return (
		<html lang="ja" className={`${dotGothic16.variable}`}>
			<body suppressHydrationWarning>
				<Script id="adobe-fonts" strategy="afterInteractive">
					{`
            (function(d) {
              var config = {
                kitId: 'jqw4oeg',
                scriptTimeout: 3000,
                async: true
              },
              h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
            })(document);
          `}
				</Script>
				<ClerkProvider
					signInFallbackRedirectUrl={redirectUrl}
					signInForceRedirectUrl={redirectUrl}
					signUpFallbackRedirectUrl={redirectUrl}
					signUpForceRedirectUrl={redirectUrl}
					afterSignOutUrl={redirectUrl}
				>
					<SignOutHandler>
						<AudioProvider>
							<HeroProvider>
								<CommonContainer>
									<ControlViewport />
									<Header />
									{children}
									<Footer />
								</CommonContainer>
							</HeroProvider>
						</AudioProvider>
					</SignOutHandler>
				</ClerkProvider>
			</body>
		</html>
	);
}
