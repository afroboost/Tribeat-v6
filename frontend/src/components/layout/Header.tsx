import React from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";

export const Header: React.FC = () => {
  const { theme } = useTheme();
  const { name, colors, fonts, navigation, buttons } = theme;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 group">
              {/* Logo Icon */}
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: colors.gradient.primary,
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="currentColor"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              {/* Logo Text - Dynamic from theme */}
              <span 
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{
                  fontFamily: fonts.heading,
                  background: colors.gradient.primary,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {name}
              </span>
            </a>
          </div>

          {/* Navigation - Dynamic from theme */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.links.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-white/70 hover:text-white transition-colors duration-200 text-sm font-medium"
                style={{ fontFamily: fonts.body }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons - Dynamic from theme */}
          <div className="flex items-center gap-3">
            <PrimaryButton 
              variant="outline" 
              size="sm"
              className="hidden sm:inline-flex"
            >
              {buttons.login}
            </PrimaryButton>
            <PrimaryButton size="sm">
              {buttons.start}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
