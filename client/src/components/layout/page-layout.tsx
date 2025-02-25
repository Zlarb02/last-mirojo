import { SideMenu } from "./side-menu";
import { Header } from "./header";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideMenu />
      <div className="flex-1 bg-screen relative">
        <div className="video-background-container" />
        <div className="flex flex-col h-full relative z-1">
          <Header />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
