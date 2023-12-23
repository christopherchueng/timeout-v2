import { GeistSans } from "geist/font/sans";
import { cookies } from "next/headers";
import { TRPCReactProvider } from "@/trpc/react";
import ProviderWrapper from "./_components/ProviderWrapper";
import NavigationBar from "./_components/NavigationBar";
import { NextUIProvider } from "@nextui-org/system";
import { Toaster } from "react-hot-toast";

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
            <NextUIProvider>
              <NavigationBar />
              {children}
              <Toaster position="bottom-left" />
            </NextUIProvider>
          </TRPCReactProvider>
        </ProviderWrapper>
      </body>
    </html>
  );
}
