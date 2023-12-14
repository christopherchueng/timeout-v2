import { GeistSans } from "geist/font/sans";
import { cookies } from "next/headers";
import { TRPCReactProvider } from "@/trpc/react";
import ProviderWrapper from "./_components/ProviderWrapper";

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
            <NavigationBar />
            {children}
          </TRPCReactProvider>
        </ProviderWrapper>
      </body>
    </html>
  );
}
