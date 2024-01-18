import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";

import TimeProvider from "@/context/Time";
import { TRPCReactProvider } from "@/trpc/react";

import ProviderWrapper from "./_components/ProviderWrapper";
import NavigationBar from "./_components/NavigationBar";
import ThemeProvider from "@/context/Theme";

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
            <ThemeProvider>
              <TimeProvider>
                <NavigationBar />
                {children}
                <Toaster position="bottom-left" />
              </TimeProvider>
            </ThemeProvider>
          </TRPCReactProvider>
        </ProviderWrapper>
      </body>
    </html>
  );
}
