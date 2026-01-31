import React from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, MapPin, Phone, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlannerData } from '@/pages/IndoorEventsPlanner';

interface SubmitPlanningStepProps {
  plannerData: PlannerData;
  totals: {
    foodTotal: number;
    serviceTotal: number;
    grandTotal: number;
    perPersonCost: number;
  };
  onUpdateData: (updates: Partial<PlannerData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const SubmitPlanningStep: React.FC<SubmitPlanningStepProps> = ({
  plannerData,
  totals,
  onUpdateData,
  onSubmit,
  onBack,
  isSubmitting,
}) => {
  const { user } = useAuth();
  const { selectedPanchayat, selectedWardNumber } = useLocation();

  const minDate = addDays(startOfDay(new Date()), 1);

  const isValid = 
    plannerData.eventType &&
    plannerData.eventDate &&
    plannerData.deliveryAddress.trim() &&
    plannerData.contactNumber.trim() &&
    selectedPanchayat &&
    selectedWardNumber;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold">Submit Your Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete event details to submit your planning request
        </p>
      </div>

      {!user && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Login Required</p>
              <p className="text-muted-foreground">
                Please login to submit your planning request
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Summary */}
      <Card className="bg-indoor-events/5 border-indoor-events/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{plannerData.eventType?.icon || '🎉'}</span>
              <div>
                <p className="font-medium">{plannerData.eventType?.name || 'Event'}</p>
                <p className="text-sm text-muted-foreground">
                  {plannerData.guestCount} guests • {plannerData.selectedFoods.length} dishes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indoor-events">
                ₹{totals.grandTotal.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">estimated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label>Event Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !plannerData.eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {plannerData.eventDate
                    ? format(plannerData.eventDate, "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={plannerData.eventDate}
                  onSelect={(date) => onUpdateData({ eventDate: date })}
                  disabled={(date) => isBefore(date, minDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Event Time (Optional)</Label>
            <Input
              type="time"
              value={plannerData.eventTime}
              onChange={(e) => onUpdateData({ eventTime: e.target.value })}
            />
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Number *
            </Label>
            <Input
              type="tel"
              placeholder="Your phone number"
              value={plannerData.contactNumber}
              onChange={(e) => onUpdateData({ contactNumber: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Venue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Event Venue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Address *</Label>
            <Textarea
              placeholder="Enter complete venue address..."
              value={plannerData.deliveryAddress}
              onChange={(e) => onUpdateData({ deliveryAddress: e.target.value })}
            />
            {selectedPanchayat && selectedWardNumber ? (
              <p className="text-xs text-muted-foreground">
                📍 Ward {selectedWardNumber}, {selectedPanchayat.name}
              </p>
            ) : (
              <p className="text-xs text-destructive">
                ⚠️ Please select location from home page
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Special Instructions (Optional)</Label>
            <Textarea
              placeholder="Any special requirements, dietary restrictions, etc..."
              value={plannerData.eventDetails}
              onChange={(e) => onUpdateData({ eventDetails: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Reference Mobile (Optional)</Label>
            <Input
              type="tel"
              placeholder="Referrer's mobile number"
              value={plannerData.referralMobile}
              onChange={(e) => onUpdateData({ referralMobile: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Enter if someone referred you
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="space-y-3">
        <Button
          className="w-full bg-indoor-events hover:bg-indoor-events/90"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting || !isValid || !user}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Planning Request'
          )}
        </Button>

        <Button variant="outline" onClick={onBack} className="w-full">
          Back to Edit
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Status: planning_submitted • Admin will review and send final quotation
        </p>
      </div>
    </div>
  );
};

export default SubmitPlanningStep;
