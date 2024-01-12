import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";

import TimeProvider from "@/context/Time";
import { TRPCReactProvider } from "@/trpc/react";

import ProviderWrapper from "./_components/ProviderWrapper";
import NavigationBar from "./_components/NavigationBar";
import PreferencesProvider from "@/context/Preferences";

export const metadata = {
  title: "Timeout",
  description: "Toggle alarms individually or collectively",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable}`}>
        <ProviderWrapper>
          <TRPCReactProvider cookies={cookies().toString()}>
            <PreferencesProvider>
              <TimeProvider>
                <NavigationBar />
                {children}
                <Toaster position="bottom-left" />
              </TimeProvider>
            </PreferencesProvider>
          </TRPCReactProvider>
        </ProviderWrapper>
      </body>
    </html>
  );
}
