import React, { ReactNode } from "react";
import Image from "next/image";

export interface AuthBrandingProps {
  imageSrc: string;
  imageAlt: string;
  icon: ReactNode;
  slogan: string;
  description: string;
  features?: string[];
  isDarkOverlay?: boolean;
  imageSizes?: string;
  className?: string;
}

export function AuthBranding({
  imageSrc,
  imageAlt,
  icon,
  slogan,
  description,
  features,
  isDarkOverlay = false,
  imageSizes = "50vw",
  className = "",
}: AuthBrandingProps) {
  return (
    <div className={`rms-branding ${className}`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="rms-branding__image"
        priority
        sizes={imageSizes}
      />
      <div
        className={`rms-branding__overlay ${
          isDarkOverlay ? "rms-branding__overlay--dark" : ""
        }`}
        aria-hidden="true"
      />
      <div className="rms-branding__content">
        <div className="rms-branding__logo">
          {icon}
        </div>
        <div className="rms-branding__brand">
          <span className="rms-branding__brand-label">RESTAURANT</span>
          <span className="rms-branding__brand-name">Management</span>
          <div className="rms-branding__divider" />
          <p className="rms-branding__slogan">{slogan}</p>
          <p className="rms-branding__desc">{description}</p>
        </div>

        {features && features.length > 0 && (
          <div className="rms-branding__features">
            {features.map((feature) => (
              <span key={feature} className="rms-branding__feature-pill">
                <span className="rms-branding__feature-dot" />
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

