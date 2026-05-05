import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import { useActiveServiceTypes } from '@/hooks/useServiceModules';
import { useCustomerDivisions } from '@/hooks/useCustomerCloudKitchen';
import { cn } from '@/lib/utils';

const slotIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="h-5 w-5" />,
  lunch: <Sun className="h-5 w-5" />,
  evening_snacks: <Sunset className="h-5 w-5" />,
  dinner: <Moon className="h-5 w-5" />,
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
    <div className="sticky top-16 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2 scrollbar-hide">
        {showEvents && (
          <button
            onClick={() => navigate('/indoor-events')}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-indoor-events/10 px-3 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="h-5 w-5 text-indoor-events" />
            <span className="text-sm font-medium text-indoor-events">Events</span>
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
                'flex flex-shrink-0 items-center gap-2 rounded-xl bg-cloud-kitchen/10 px-3 py-2.5 transition-all',
                div.is_ordering_open
                  ? 'hover:scale-[1.02] active:scale-[0.98]'
                  : 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-cloud-kitchen">
                {slotIcons[div.slot_type] || <Clock className="h-5 w-5" />}
              </span>
              <span className="text-sm font-medium text-cloud-kitchen">{div.name}</span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default OperationalModules;
