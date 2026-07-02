import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { CHECKOUT_TIMER_SECONDS } from "@/lib/constants";

interface CountdownTimerProps {
  /** Segundos iniciais. Default: CHECKOUT_TIMER_SECONDS (300s / 5min). */
  seconds?: number;
}

/**
 * Contador regressivo do checkout PIX. Renderiza min:seg + mensagem de urgência.
 * Puramente visual — não dispara callback ao zerar.
 */
const CountdownTimer = ({ seconds: initial = CHECKOUT_TIMER_SECONDS }: CountdownTimerProps) => {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 bg-secondary text-foreground px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="text-center">
          <span className="text-lg font-bold font-mono">{min}</span>
          <span className="block text-[10px] uppercase text-muted-foreground">min</span>
        </div>
        <span className="text-lg font-bold">:</span>
        <div className="text-center">
          <span className="text-lg font-bold font-mono">{sec}</span>
          <span className="block text-[10px] uppercase text-muted-foreground">seg</span>
        </div>
      </div>
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">Seu tempo está acabando!</span>
    </div>
  );
};

export default CountdownTimer;
