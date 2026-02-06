import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, Users, Check, X } from 'lucide-react';

interface FoodQuantitySuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    price: number;
    serves_persons: number | null;
  } | null;
  guestCount: number;
  currentQuantity: number;
  onAccept: (quantity: number) => void;
  onCancel: () => void;
}

const FoodQuantitySuggestionDialog: React.FC<FoodQuantitySuggestionDialogProps> = ({
  open,
  onOpenChange,
  item,
  guestCount,
  currentQuantity,
  onAccept,
  onCancel,
}) => {
  const servesPersons = item?.serves_persons || 1;
  const suggestedQuantity = Math.ceil(guestCount / servesPersons);
  const [quantity, setQuantity] = React.useState(suggestedQuantity);

  // Update quantity when suggestion changes
  React.useEffect(() => {
    setQuantity(suggestedQuantity);
  }, [suggestedQuantity, item]);

  if (!item) return null;

  const totalCost = item.price * quantity;
  const actualServings = quantity * servesPersons;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Quantity Suggestion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Item Name */}
          <div className="text-center">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-muted-foreground">₹{item.price}/plate</p>
          </div>

          {/* Calculation Card */}
          <div className="bg-indoor-events/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-indoor-events">
              <Calculator className="h-5 w-5" />
              <span className="font-medium">Smart Calculation</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your guests</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {guestCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Serves per unit</span>
                <Badge variant="outline">{servesPersons} persons</Badge>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="flex items-center justify-between font-semibold">
                <span>Recommended quantity</span>
                <span className="text-indoor-events text-lg">{suggestedQuantity} units</span>
              </div>
            </div>
          </div>

          {/* Quantity Adjuster */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Adjust quantity if needed:</label>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-lg font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
            
            {/* Serving capacity info */}
            <p className="text-xs text-center text-muted-foreground">
              {quantity} units × {servesPersons} persons = {actualServings} servings
              {actualServings < guestCount && (
                <span className="text-destructive ml-1">(not enough for {guestCount} guests)</span>
              )}
              {actualServings >= guestCount && (
                <span className="text-green-600 ml-1">✓ Covers all guests</span>
              )}
            </p>
          </div>

          {/* Total Cost Preview */}
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Estimated cost for this item</p>
            <p className="text-xl font-bold text-indoor-events">
              ₹{totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {quantity} units × ₹{item.price}/unit
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Edit Manually
            </Button>
            <Button
              className="flex-1 bg-indoor-events hover:bg-indoor-events/90"
              onClick={() => onAccept(quantity)}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept ({quantity})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodQuantitySuggestionDialog;
