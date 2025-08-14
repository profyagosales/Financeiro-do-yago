import liveloLogo from "@/assets/logos/livelo.svg";
import latamPassLogo from "@/assets/logos/latampass.svg";
import azulLogo from "@/assets/logos/azul.svg";

export type LogoProps = {
  className?: string;
};

export function LiveloLogo({ className = "h-6 w-6" }: LogoProps) {
  return <img src={liveloLogo} alt="" className={className} aria-hidden />;
}

export function LatamPassLogo({ className = "h-6 w-6" }: LogoProps) {
  return <img src={latamPassLogo} alt="" className={className} aria-hidden />;
}

export function AzulLogo({ className = "h-6 w-6" }: LogoProps) {
  return <img src={azulLogo} alt="" className={className} aria-hidden />;
}
