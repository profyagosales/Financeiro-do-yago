import type { SVGProps } from 'react';

export function LiveloLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="#EA1E79" />
      <text
        x="50"
        y="55"
        fontSize="50"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        L
      </text>
    </svg>
  );
}

export function LatamPassLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="#C8102E" />
      <text
        x="50"
        y="55"
        fontSize="40"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        LATAM
      </text>
    </svg>
  );
}

export function AzulLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="#0075C9" />
      <text
        x="50"
        y="55"
        fontSize="40"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        Azul
      </text>
    </svg>
  );
}
