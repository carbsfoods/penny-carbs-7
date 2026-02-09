import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChefHat, Star } from 'lucide-react';

export interface CookOption {
  cook_id: string;
  kitchen_name: string;
  rating: number | null;
  total_orders: number | null;
}

interface CookSelectorProps {
  cooks: CookOption[];
  selectedCookId: string | null;
  onSelectCook: (cookId: string) => void;
}

const CookSelector: React.FC<CookSelectorProps> = ({ cooks, selectedCookId, onSelectCook }) => {
  if (cooks.length === 0) return null;

  // If only one cook, don't show selector (auto-select it)
  if (cooks.length === 1) return null;

  return (
    <div className="mt-4 rounded-lg border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <ChefHat className="h-4 w-4 text-primary" />
        <span>Choose your cook</span>
      </div>
      <RadioGroup value={selectedCookId || ''} onValueChange={onSelectCook}>
        <div className="space-y-2">
          {cooks.map((cook) => (
            <div
              key={cook.cook_id}
              className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                selectedCookId === cook.cook_id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSelectCook(cook.cook_id)}
            >
              <RadioGroupItem value={cook.cook_id} id={cook.cook_id} />
              <Label htmlFor={cook.cook_id} className="flex-1 cursor-pointer">
                <div className="font-medium">{cook.kitchen_name}</div>
                {(cook.rating || cook.total_orders) && (
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {cook.rating && cook.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {cook.rating.toFixed(1)}
                      </span>
                    )}
                    {cook.total_orders && cook.total_orders > 0 && (
                      <span>{cook.total_orders} orders</span>
                    )}
                  </div>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default CookSelector;
