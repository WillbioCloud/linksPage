import React from "react";

/**
 * Logo oficial Home Paraíso (Casinha com coração estilizado)
 * Baseado no vetor oficial SVG.
 */
export default function Logo({
  className = "w-7 h-7 shrink-0",
  stroke = "currentColor",
  strokeWidth = 104,
  ...props
}) {
  return (
    <svg
      width="1822"
      height="1616"
      viewBox="0 0 1822 1616"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M907.194 1260.89C964.563 1301.17 1027.64 1332.92 1083 1354.5C1251.38 1420.13 1396.64 1385.98 1456.63 1365.83C1474.92 1359.68 1486 1342.21 1486 1322.92V657.208C1486 641.073 1478.21 625.93 1465.09 616.542L923.847 229.337C914.386 222.568 901.652 222.621 892.247 229.468L360.572 616.523C347.646 625.934 340 640.958 340 656.946V1312.09C340 1336.56 357.704 1357.43 381.842 1361.42L468.5 1375.75L551.5 1382H596L640.25 1375.75L687 1366L723 1354.5C796.81 1323.91 857.625 1292.56 907.194 1260.89ZM907.194 1260.89C740.828 1144.08 622.478 955.576 879.667 735.654C896.128 721.578 920.259 720.498 937.447 733.678C1082.54 844.937 1222.71 1059.31 907.194 1260.89Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
