import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Search, User, ChevronDown, LogOut, ShoppingBag, Settings, Truck, Phone, Loader2, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import logo from '@/assets/logo.png';
import carbsLogo from '@/assets/carbs_logo.jpg';

const mobileSchema = z.object({
  mobileNumber: z.string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
});

type MobileFormData = z.infer<typeof mobileSchema>;

interface AppHeaderProps {
  onSearch?: (query: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { user, profile, signOut, role, customerSignIn } = useAuth();
  const { selectedPanchayat, selectedWardNumber, isLocationSet } = useLocation();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [customerLoginOpen, setCustomerLoginOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotRegistered, setShowNotRegistered] = useState(false);
  const [attemptedMobile, setAttemptedMobile] = useState('');

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['customer-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('customer_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const mobileForm = useForm<MobileFormData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: {
      mobileNumber: '',
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleCustomerLogin = async (data: MobileFormData) => {
    setIsSubmitting(true);
    setShowNotRegistered(false);
    try {
      const { error } = await customerSignIn(data.mobileNumber);
      if (error) {
        if (error.message.includes('not found') || error.message.includes('Invalid login')) {
          setAttemptedMobile(data.mobileNumber);
          setShowNotRegistered(true);
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully",
        });
        setCustomerLoginOpen(false);
        mobileForm.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToRegister = () => {
    setCustomerLoginOpen(false);
    navigate('/customer-auth', { state: { mobileNumber: attemptedMobile, tab: 'signup' } });
  };

  // Location display - derived from user profile
  const locationDisplay = isLocationSet
    ? `Ward ${selectedWardNumber}, ${selectedPanchayat?.name}`
    : user
      ? 'Update location in profile'
      : 'Login to set location';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center gap-4 px-4">
          {/* Logo - mobile: carbs logo, desktop: original logo */}
          {isMobile ? (
            <img 
              src={carbsLogo} 
              alt="Penny Carbs" 
              className="h-9 w-9 rounded-lg cursor-pointer flex-shrink-0" 
              onClick={() => navigate('/')}
            />
          ) : (
            <img 
              src={logo} 
              alt="Penny Carbs" 
              className="h-10 w-auto cursor-pointer flex-shrink-0" 
              onClick={() => navigate('/')}
            />
          )}

          {/* Mobile: show Customer/Name instead of location */}
          {isMobile ? (
            <div className="flex items-center">
              {user ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm font-semibold text-foreground truncate max-w-[100px]"
                >
                  {profile?.name || 'User'}
                </button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowNotRegistered(false);
                    mobileForm.reset();
                    setCustomerLoginOpen(true);
                  }}
                  className="text-sm font-medium px-2"
                >
                  Customer
                </Button>
              )}
            </div>
          ) : (
            /* Desktop: Location Display */
            <div className="flex items-center gap-2">
              <button
                onClick={() => user ? navigate('/profile') : setCustomerLoginOpen(true)}
                className="flex items-center gap-1 text-left"
              >
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Deliver to</p>
                  <p className="flex items-center text-sm font-medium">
                    {locationDisplay}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </p>
                </div>
              </button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowNotRegistered(false);
                    mobileForm.reset();
                    setCustomerLoginOpen(true);
                  }}
                >
                  Customer
                </Button>
              )}
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search dishes or kitchens..."
                className="h-10 w-full pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Wallet Display */}
          {user && (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                ₹{wallet?.balance?.toFixed(0) || '0'}
              </span>
            </button>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuLabel>
                  <p className="font-medium">{profile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.mobile_number}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/orders')}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                {(role === 'super_admin' || role === 'admin') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} size="sm" variant="ghost" className="gap-1">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Delivery/Food Partner</span>
            </Button>
          )}
        </div>
      </header>

      {/* Customer Login Dialog */}
      <Dialog open={customerLoginOpen} onOpenChange={setCustomerLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Customer Login
            </DialogTitle>
            <DialogDescription>
              Enter your registered mobile number to login
            </DialogDescription>
          </DialogHeader>
          
          {!showNotRegistered ? (
            <Form {...mobileForm}>
              <form onSubmit={mobileForm.handleSubmit(handleCustomerLogin)} className="space-y-4 py-4">
                <FormField
                  control={mobileForm.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your 10-digit mobile number"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </Form>
          ) : (
            <div className="py-4 space-y-4">
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive font-medium">
                  You are not registered
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mobile number {attemptedMobile} is not found in our system
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleGoToRegister} className="w-full">
                  Register New Account
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNotRegistered(false)} 
                  className="w-full"
                >
                  Try Another Number
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppHeader;
