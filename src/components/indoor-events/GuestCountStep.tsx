import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface GuestCountStepProps {
  guestCount: number;
  onChange: (count: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const presetCounts = [1, 10, 25, 50, 100, 150, 200, 300];

const GuestCountStep: React.FC<GuestCountStepProps> = ({
  guestCount,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold">How Many Guests?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us calculate portion sizes and pricing
        </p>
      </div>

      <Card className="border-indoor-events/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Users className="h-8 w-8 text-indoor-events" />
            <Input
              type="number"
              min={1}
              max={1000}
              value={guestCount}
              onChange={(e) => onChange(parseInt(e.target.value) || 1)}
              className="w-24 text-center text-2xl font-bold h-12"
            />
            <span className="text-muted-foreground">guests</span>
          </div>

          <Slider
            value={[guestCount]}
            onValueChange={([value]) => onChange(value)}
            min={1}
            max={500}
            step={1}
            className="my-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>500+</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">Quick select</p>
        <div className="flex flex-wrap justify-center gap-2">
          {presetCounts.map((count) => (
            <Button
              key={count}
              variant={guestCount === count ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(count)}
              className={guestCount === count ? "bg-indoor-events hover:bg-indoor-events/90" : ""}
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          className="flex-1 bg-indoor-events hover:bg-indoor-events/90"
          onClick={onNext}
          disabled={guestCount < 1}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default GuestCountStep;
