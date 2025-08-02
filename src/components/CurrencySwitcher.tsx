import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DollarSign } from 'lucide-react';

export function CurrencySwitcher() {
  const { baseCurrency, getSupportedCurrencies, updateBaseCurrency } = useCurrency();
  const currencies = getSupportedCurrencies();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden md:inline">{baseCurrency.symbol} {baseCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => updateBaseCurrency(currency.code)}
            className={baseCurrency.code === currency.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{currency.symbol}</span>
            {currency.code} - {currency.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}