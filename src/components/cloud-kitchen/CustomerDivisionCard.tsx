import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Coffee, Sun, Sunset, Moon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActiveDivision } from '@/hooks/useCustomerCloudKitchen';
import { formatSlotTime } from '@/hooks/useCloudKitchenSlots';

interface CustomerDivisionCardProps {
  division: ActiveDivision;
  isSelected: boolean;
  onSelect: () => void;
}

const slotIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="h-5 w-5" />,
  lunch: <Sun className="h-5 w-5" />,
  evening_snacks: <Sunset className="h-5 w-5" />,
  dinner: <Moon className="h-5 w-5" />,
};

const slotColors: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700 border-amber-300',
  lunch: 'bg-orange-100 text-orange-700 border-orange-300',
  evening_snacks: 'bg-purple-100 text-purple-700 border-purple-300',
  dinner: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

const CustomerDivisionCard: React.FC<CustomerDivisionCardProps> = ({
  division,
  isSelected,
  onSelect,
}) => {
  const colorClass = slotColors[division.slot_type] || 'bg-muted text-muted-foreground';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        division.is_ordering_open
          ? 'hover:shadow-md'
          : 'opacity-60 cursor-not-allowed',
        isSelected && division.is_ordering_open
          ? 'ring-2 ring-primary border-primary'
          : ''
      )}
      onClick={() => division.is_ordering_open && onSelect()}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-full', colorClass)}>
            {slotIcons[division.slot_type] || <Clock className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{division.name}</h3>
            <p className="text-xs text-muted-foreground">
              {formatSlotTime(division.start_time)} - {formatSlotTime(division.end_time)}
            </p>
          </div>
        </div>

        <div className="mt-3">
          {division.is_ordering_open ? (
            division.status_label === 'closing_soon' ? (
              <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Clock className="h-3 w-3 mr-1" />
                Closing soon • {division.time_until_cutoff?.minutes}m left
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-green-300 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                <Clock className="h-3 w-3 mr-1" />
                Open • {division.time_until_cutoff?.hours}h {division.time_until_cutoff?.minutes}m left
              </Badge>
            )
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Closed for today
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDivisionCard;
