/*  eslint-disable  */
import React, { useState, useCallback } from "react";
//Componentes compartidos entre las apps. Diseñado por Claude design. Se ignora los errores de tipado any.
/**
 * Renderiza un icono SVG del set interno.
 */
const Icon = ({ name, size = 20, stroke = 1.5, className = "" }: any) => {
  const props: any = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `inline-block shrink-0 ${className}`,
  };
  const paths: any = {
    home: (
      <>
        <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    heart: (
      <path d="M12 20s-7-4.5-9-9.5C1.5 6 5 3 8 4.5c1.7.8 3 2 4 3.5 1-1.5 2.3-2.7 4-3.5 3-1.5 6.5 1.5 5 6-2 5-9 9.5-9 9.5z" />
    ),
    cart: (
      <>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.5 11.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 8H6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </>
    ),
    menu: (
      <>
        <path d="M3 6h18M3 12h18M3 18h18" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),
    chevronLeft: <path d="m15 6-6 6 6 6" />,
    chevronRight: <path d="m9 6 6 6-6 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronUp: <path d="m6 15 6-6 6 6" />,
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 5 5 9-12" />,
    star: (
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8l-5.8 3.1 1.1-6.5L2.6 9.8l6.5-.9z" />
    ),
    starFill: (
      <path
        d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8l-5.8 3.1 1.1-6.5L2.6 9.8l6.5-.9z"
        fill="currentColor"
      />
    ),
    filter: <path d="M3 5h18M6 12h12M10 19h4" />,
    truck: (
      <>
        <path d="M3 7h11v10H3zM14 11h4l3 3v3h-7" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    box: (
      <>
        <path d="M3 7l9-4 9 4-9 4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    pkg: (
      <>
        <path d="M3 7l9-4 9 4-9 4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    map: (
      <>
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    bell: (
      <>
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" />
        <path d="M10 21a2 2 0 0 0 4 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" fill="white" />
        <circle cx="15" cy="12" r="2" fill="white" />
        <circle cx="7" cy="18" r="2" fill="white" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    arrowLeft: (
      <>
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M12 19V5M6 11l6-6 6 6" />
      </>
    ),
    arrowDown: (
      <>
        <path d="M12 5v14M6 13l6 6 6-6" />
      </>
    ),
    qr: (
      <>
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
        <path d="M14 14h2v2h-2zM18 14h3v3M14 18h2v3h5v-2" />
      </>
    ),
    creditCard: (
      <>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <path d="M2 11h20M6 15h3" />
      </>
    ),
    bank: (
      <>
        <path d="M3 10h18L12 4z" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 18h18M4 21h16" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h13v4H5a2 2 0 0 0-2 2zM3 11v6a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z" />
        <circle cx="17" cy="14" r="1" />
      </>
    ),
    cash: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 9v6M18 9v6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v5h1" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16h.01" />
      </>
    ),
    chat: (
      <>
        <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 3 3 5-6" />
      </>
    ),
    chartBar: (
      <>
        <path d="M3 3v18h18M7 14v4M11 10v8M15 7v11M19 12v6" />
      </>
    ),
    pkgOut: (
      <>
        <path d="M3 7l9-4 9 4-9 4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10M15 14l-3 3-3-3" />
      </>
    ),
    refresh: (
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </>
    ),
    print: (
      <>
        <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" />
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </>
    ),
    upload: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
      </>
    ),
    camera: (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    tag: (
      <>
        <path d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0L3 13.8V3h10.8l7 7a2 2 0 0 1 0 2.8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
    sparkle: (
      <path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2zM18 14l1 2.5 2.5 1-2.5 1L18 21l-1-2.5L14.5 17.5 17 16.5z" />
    ),
    leaf: (
      <>
        <path d="M21 3c-9 0-15 6-15 14 0 1 0 2 .3 3 5-1 9-3 12-7 2-3 3-7 3-10z" />
        <path d="M3 21c2-6 5-9 9-12" />
      </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
      </>
    ),
    bath: (
      <>
        <path d="M3 12V6a2 2 0 0 1 4 0M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM5 19l-1 2M19 19l1 2" />
      </>
    ),
    sofa: (
      <>
        <path d="M3 12v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M3 12a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3M21 12a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v3M7 12a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2" />
      </>
    ),
    bed: (
      <>
        <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M7 11V9a1 1 0 0 1 1-1h3v3" />
      </>
    ),
    chef: (
      <>
        <path d="M6 18h12v3H6zM6 18a4 4 0 0 1 0-8 5 5 0 0 1 9-2 5 5 0 0 1 3 10z" />
      </>
    ),
    leafDeco: (
      <>
        <path d="M12 2c-4 4-7 8-7 12a7 7 0 0 0 14 0c0-4-3-8-7-12z" />
      </>
    ),
    flower: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2a4 4 0 0 1 0 8M12 14a4 4 0 0 1 0 8M2 12a4 4 0 0 1 8 0M14 12a4 4 0 0 1 8 0" />
      </>
    ),
    moreH: (
      <>
        <circle cx="6" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="18" cy="12" r="1" />
      </>
    ),
    moreV: (
      <>
        <circle cx="12" cy="6" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="18" r="1" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    flame: (
      <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4-1 4 3 4 3 0 0-2-1-3-1-4zM6 14a6 6 0 0 0 12 0c0 5-3 8-6 8s-6-3-6-8z" />
    ),
    helmet: (
      <>
        <path d="M4 16a8 8 0 0 1 16 0v3H4z" />
        <path d="M9 8c1-3 3-4 3-4s2 1 3 4" />
      </>
    ),
    scan: (
      <>
        <path d="M3 7V5a2 2 0 0 1 2-2h2M21 7V5a2 2 0 0 0-2-2h-2M3 17v2a2 2 0 0 0 2 2h2M21 17v2a2 2 0 0 1-2 2h-2M7 12h10" />
      </>
    ),
  };
  return <svg {...props}>{paths[name] || paths.box}</svg>;
};
export { Icon };

/**
 * Boton con variantes y tamanios predefinidos.
 */
const Button = ({ children, variant = "primary", size = "md", icon, iconRight, full, onClick, disabled, type = "button", className = "" }: any) => {
  const sizeMap: any = {
    sm: "h-[34px] px-3.5 text-[13px] gap-1.5",
    md: "h-[42px] px-[18px] text-sm gap-2",
    lg: "h-[52px] px-6 text-[15px] gap-2.5",
  };
  const iconSizes: any = { sm: 16, md: 18, lg: 20 };
  const variantMap: any = {
    primary: "bg-forest text-paper border border-forest",
    secondary: "bg-paper text-ink border border-line-2",
    ghost: "bg-transparent text-ink border border-transparent",
    danger: "bg-danger text-paper border border-danger",
    accent: "bg-clay text-paper border border-clay",
    soft: "bg-bone text-olive border border-transparent",
  };
  const widthCls = full ? "w-full" : "w-auto";
  const stateCls = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer active:scale-[0.98]";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] max-w-full min-w-0 whitespace-nowrap transition-[transform,opacity] duration-100 ${sizeMap[size]} ${variantMap[variant]} ${widthCls} ${stateCls} ${className}`}
    >
      {icon && <Icon name={icon} size={iconSizes[size]} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSizes[size]} />}
    </button>
  );
};
export { Button };

/**
 * Etiqueta visual configurable (pill).
 */
const Pill = ({ children, tone = "neutral", size = "md", icon, onClick, active }: any) => {
  const toneMap: any = {
    neutral: "bg-bone text-olive",
    sand: "bg-[#ede4cc] text-cocoa",
    sage: "bg-[#dde2c9] text-forest",
    forest: "bg-forest text-paper",
    success: "bg-[#d8e3c8] text-success",
    warn: "bg-[#f3e4c4] text-warn",
    danger: "bg-[#f0d9d1] text-danger",
    outline: "bg-transparent text-ink-2 border border-line-2",
  };
  const sizeMap: any = {
    sm: "px-[9px] py-[3px] text-[11px] gap-1",
    md: "px-3 py-[5px] text-xs gap-1.5",
    lg: "px-3.5 py-[7px] text-[13px] gap-1.5",
  };
  const iconSize = size === "sm" ? 13 : size === "md" ? 14 : 15;
  const activeCls = active ? "bg-forest text-paper" : toneMap[tone];
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap tracking-[-0.005em] ${sizeMap[size]} ${activeCls} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  );
};
export { Pill };

/**
 * Wrapper de campo con label, hint y error.
 */
const Field = ({ label, hint, error, children, optional }: any) => (
  <label className="block">
    {label && (
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[13px] text-ink-2 font-medium">{label}</span>
        {optional && <span className="text-[11px] text-ink-3">opcional</span>}
      </div>
    )}
    {children}
    {hint && !error && <div className="text-xs text-ink-3 mt-1.5">{hint}</div>}
    {error && <div className="text-xs text-danger mt-1.5">{error}</div>}
  </label>
);
export { Field };

/**
 * Input con icono y sufijo opcional.
 */
const Input = ({ icon, suffix, className = "", ...rest }: any) => (
  <div className="flex items-center gap-2 w-full bg-paper border border-line-2 rounded-r2 px-3.5 h-[46px] transition-[border-color,box-shadow] duration-150 focus-within:border-olive">
    {icon && <Icon name={icon} size={18} className="text-ink-3" />}
    <input
      {...rest}
      className={`flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-ink h-full ${className}`}
    />
    {suffix && <span className="text-[13px] text-ink-3">{suffix}</span>}
  </div>
);
export { Input };

/**
 * Contenedor visual con borde y padding configurable.
 */
const Card = ({ children, padding = 20, style = {}, hover, onClick, className = "" }: any) => {
  const interactive = hover || onClick;
  return (
    <div
      onClick={onClick}
      className={`bg-paper border border-line rounded-r3 max-w-full transition-[box-shadow,transform,border-color] duration-200 ${interactive ? "hover:shadow-sh-2 hover:border-line-2" : ""} ${onClick ? "cursor-pointer" : "cursor-default"} ${className}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
};
export { Card };

/**
 * Hook para mostrar toasts temporales.
 */
const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([]);
  const push = useCallback((msg: any, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  const ToastHost = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const toneCls =
          t.tone === "success"
            ? "bg-forest"
            : t.tone === "danger"
              ? "bg-danger"
              : "bg-ink";
        return (
          <div
            key={t.id}
            className={`text-paper px-[18px] py-2.5 rounded-full text-[13px] shadow-sh-3 font-medium animate-toast-in ${toneCls}`}
          >
            {t.msg}
          </div>
        );
      })}
    </div>
  );
  return { push, ToastHost };
};
export { useToast };

/**
 * Icono ilustrado de producto segun categoria.
 */
const ProductGlyph = ({ kind, palette = ["#a4ac86", "#656d4a"], size = 80 }: any) => {
  const glyphs: any = {
    bath: (
      <>
        <circle cx="40" cy="40" r="22" fill={palette[0]} />
        <path
          d="M28 42c4-2 20-2 24 0"
          stroke={palette[1]}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
    cocina: (
      <>
        <rect x="20" y="22" width="40" height="38" rx="4" fill={palette[0]} />
        <path
          d="M30 32h20M30 42h20M30 52h12"
          stroke={palette[1]}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
    comedor: (
      <>
        <circle cx="40" cy="34" r="14" fill={palette[0]} />
        <rect x="36" y="48" width="8" height="14" fill={palette[1]} />
      </>
    ),
    dormitorio: (
      <>
        <rect x="14" y="34" width="52" height="22" rx="3" fill={palette[0]} />
        <rect x="20" y="28" width="16" height="10" rx="2" fill={palette[1]} />
      </>
    ),
    decoracion: (
      <>
        <circle cx="40" cy="40" r="18" fill={palette[0]} />
        <path
          d="M32 40c4-8 12-8 16 0"
          stroke={palette[1]}
          strokeWidth="2"
          fill="none"
        />
      </>
    ),
    living: (
      <>
        <rect x="14" y="36" width="52" height="20" rx="6" fill={palette[0]} />
        <rect x="20" y="30" width="12" height="8" rx="2" fill={palette[1]} />
        <rect x="48" y="30" width="12" height="8" rx="2" fill={palette[1]} />
      </>
    ),
    terraza: (
      <>
        <path d="M40 18 22 50h36z" fill={palette[0]} />
        <rect x="36" y="50" width="8" height="14" fill={palette[1]} />
      </>
    ),
    box: (
      <>
        <path d="M20 28 40 18l20 10v22L40 60 20 50z" fill={palette[0]} />
        <path
          d="M20 28 40 38l20-10M40 38v22"
          stroke={palette[1]}
          strokeWidth="2"
        />
      </>
    ),
  };
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 80 64" className="block">
      {glyphs[kind] || glyphs.box}
    </svg>
  );
};
export { ProductGlyph };

/**
 * Avatar basado en iniciales con color deterministicamente asignado.
 */
const Avatar = ({ name = "", size = 40, src }: any) => {
  const initials = name.split(" ").map((s: any) => s[0]).slice(0, 2).join("").toUpperCase() || "?";
  const palette = ["#a4ac86", "#7f4f24", "#656d4a", "#936639", "#414833"];
  const c = palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      className="rounded-full text-paper flex items-center justify-center font-semibold tracking-[0.02em] shrink-0"
      style={{
        width: size,
        height: size,
        background: c,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
};
export { Avatar };

/**
 * Titulo de seccion con eyebrow y accion opcional.
 */
const SectionTitle = ({ eyebrow, children, action }: any) => (
  <div className="flex justify-between items-end mb-4">
    <div>
      {eyebrow && (
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 mb-1.5">
          {eyebrow}
        </div>
      )}
      <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-ink">
        {children}
      </h2>
    </div>
    {action}
  </div>
);
export { SectionTitle };

/**
 * Vista de estado vacio reutilizable.
 */
const EmptyState = ({ icon = "box", title, body, action }: any) => (
  <div className="text-center px-6 py-12 max-w-[360px] mx-auto">
    <div className="w-[72px] h-[72px] rounded-full bg-bone text-olive flex items-center justify-center mx-auto mb-5">
      <Icon name={icon} size={32} />
    </div>
    <h3 className="m-0 mb-2 text-lg font-semibold">{title}</h3>
    <p className="m-0 mb-5 text-sm text-ink-3 leading-[1.5]">{body}</p>
    {action}
  </div>
);
export { EmptyState };

/**
 * Placeholder de carga con shimmer.
 */
const Skeleton = ({ w = "100%", h = 16, r = 8 }: any) => (
  <div
    className="animate-shimmer bg-gradient-to-r from-bone via-cream to-bone bg-[length:200%_100%]"
    style={{ width: w, height: h, borderRadius: r }}
  />
);
export { Skeleton };

/**
 * Logo de UniHousing con tamano configurable.
 */
const Logo = ({ size = 28, label = true, color = "currentColor" }: any) => (
  <div className="inline-flex items-center gap-2.5">
    <svg width={size} height={size} viewBox="0 0 32 32" className="shrink-0">
      <path
        d="M6 26 V14 C6 9, 10 5, 16 5 C22 5, 26 9, 26 14 V26"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M11 26 V18 C11 15, 13 13, 16 13 C19 13, 21 15, 21 18 V26"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="14" r="1.5" fill={color} />
    </svg>
    {label && (
      <span
        className="font-semibold tracking-[-0.02em]"
        style={{ fontSize: size * 0.6, color }}
      >
        UniHousing
      </span>
    )}
  </div>
);
export { Logo };

/**
 * Tabs horizontales con estado activo.
 */
const Tabs = ({ tabs, active, onChange }: any) => (
  <div className="flex gap-1 border-b border-line overflow-x-auto max-w-full no-scrollbar [-webkit-overflow-scrolling:touch] flex-wrap-mobile">
    {tabs.map((t: any) => {
      const id = typeof t === "string" ? t : t.id;
      const label = typeof t === "string" ? t : t.label;
      const count = typeof t === "string" ? null : t.count;
      const isActive = active === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`px-4 py-3 text-sm font-medium -mb-px flex items-center gap-2 whitespace-nowrap shrink-0 max-[520px]:px-2.5 max-[520px]:text-[13px] max-[520px]:gap-1.5 ${isActive ? "text-ink border-b-2 border-forest" : "text-ink-3 border-b-2 border-transparent"}`}
        >
          {label}
          {count != null && (
            <span
              className={`text-[11px] px-[7px] py-0.5 rounded-full font-semibold ${isActive ? "bg-forest text-paper" : "bg-bone text-ink-3"}`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
export { Tabs };

/**
 * Header superior reutilizable para apps.
 */
const AppShellHeader = ({ appName, appColor, onBack }: any) => (
  <div className="sticky top-0 z-50 bg-paper/85 backdrop-blur-[12px] border-b border-line px-5 py-2.5 flex items-center justify-between">
    <a
      href="../index.html"
      className="inline-flex items-center gap-2.5 text-ink-3 text-[13px]"
    >
      <Icon name="arrowLeft" size={16} /> Hub
    </a>
    <div className="flex items-center gap-2 text-[13px] font-mono text-ink-3">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: appColor }}
      ></span>
      {appName}
    </div>
  </div>
);
export { AppShellHeader };

/**
 * Formatea un numero como moneda ARS.
 */
export const fmtARS = (n: any) => "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
