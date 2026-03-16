import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-ticker',
  standalone: true,
  imports: [],
  template: `
    <div class="fixed top-0 left-0 w-full bg-black/80 border-b border-white/10 z-50 overflow-hidden">
      <div class="flex whitespace-nowrap stock-ticker py-2">
        <div class="flex gap-8 px-4">
          <span class="text-green-400 font-mono">AAPL +2.45% ▲</span>
          <span class="text-red-400 font-mono">GOOGL -1.23% ▼</span>
          <span class="text-green-400 font-mono">TSLA +5.67% ▲</span>
          <span class="text-green-400 font-mono">MSFT +1.89% ▲</span>
          <span class="text-red-400 font-mono">AMZN -0.45% ▼</span>
          <span class="text-green-400 font-mono">NVDA +8.12% ▲</span>
          <span class="text-red-400 font-mono">META -2.34% ▼</span>
          <span class="text-green-400 font-mono">NFLX +3.21% ▲</span>
          <span class="text-green-400 font-mono">AAPL +2.45% ▲</span>
          <span class="text-red-400 font-mono">GOOGL -1.23% ▼</span>
          <span class="text-green-400 font-mono">TSLA +5.67% ▲</span>
          <span class="text-green-400 font-mono">MSFT +1.89% ▲</span>
          <span class="text-red-400 font-mono">AMZN -0.45% ▼</span>
          <span class="text-green-400 font-mono">NVDA +8.12% ▲</span>
          <span class="text-red-400 font-mono">META -2.34% ▼</span>
          <span class="text-green-400 font-mono">NFLX +3.21% ▲</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-ticker {
      animation: scroll 30s linear infinite;
    }
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `]
})
export class StockTickerComponent {}
