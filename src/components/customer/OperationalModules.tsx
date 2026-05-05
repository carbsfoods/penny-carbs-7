import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import { useActiveServiceTypes } from '@/hooks/useServiceModules';
import { useCustomerDivisions } from '@/hooks/useCustomerCloudKitchen';
import { cn } from '@/lib/utils';

const slotIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="h-6 w-6" />,
  lunch: <Sun className="h-6 w-6" />,
  evening_snacks: <Sunset className="h-6 w-6" />,
  dinner: <Moon className="h-6 w-6" />,
};

const OperationalModules: React.FC = () => {
  const navigate = useNavigate();
  const { data: activeTypes, isLoading } = useActiveServiceTypes();
  const { data: divisions } = useCustomerDivisions();

  const isActive = (type: string) => activeTypes?.includes(type) ?? false;
  const showEvents = isActive('indoor_events');
  const showCloudKitchen = isActive('cloud_kitchen');

  if (isLoading) return null;
  if (!showEvents && !showCloudKitchen) return null;

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto px-3 py-3 scrollbar-hide">
        {showEvents && (
          <button
            onClick={() => navigate('/indoor-events')}
            className="flex flex-shrink-0 items-center gap-2.5 rounded-2xl bg-indoor-events px-5 py-3 shadow-md transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]"
          >
            <Calendar className="h-6 w-6 text-white" />
            <span className="text-base font-semibold text-white">Events</span>
          </button>
        )}

        {showCloudKitchen &&
          divisions?.map((div) => (
            <button
              key={div.id}
              onClick={() =>
                div.is_ordering_open &&
                navigate('/cloud-kitchen', { state: { preselectedSlotId: div.id } })
              }
              disabled={!div.is_ordering_open}
              className={cn(
                'flex flex-shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 shadow-md transition-all',
                div.is_ordering_open
                  ? 'bg-cloud-kitchen hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]'
                  : 'bg-muted opacity-60 cursor-not-allowed'
              )}
            >
              <span className={div.is_ordering_open ? 'text-white' : 'text-muted-foreground'}>
                {slotIcons[div.slot_type] || <Clock className="h-6 w-6" />}
              </span>
              <span
                className={cn(
                  'text-base font-semibold',
                  div.is_ordering_open ? 'text-white' : 'text-muted-foreground'
                )}
              >
                {div.name}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default OperationalModules;
