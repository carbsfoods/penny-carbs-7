import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, User, Phone, MapPin, LogOut, ChevronRight,
  Edit2, Lock, ChefHat, Truck, Settings, Shield
} from 'lucide-react';
import BottomNav from '@/components/customer/BottomNav';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, role, signOut, refreshProfile } = useAuth();
  const { panchayats } = useLocation();

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPanchayatId, setEditPanchayatId] = useState('');
  const [editWardNumber, setEditWardNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // Change password state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Cook / delivery check
  const [isCook, setIsCook] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if user is a cook
    supabase.from('cooks').select('id').eq('user_id', user.id).eq('is_active', true).maybeSingle()
      .then(({ data }) => setIsCook(!!data));
    // Check if user is delivery staff
    supabase.from('delivery_staff').select('id').eq('user_id', user.id).eq('is_active', true).eq('is_approved', true).maybeSingle()
      .then(({ data }) => setIsDelivery(!!data));
  }, [user]);

  const panchayat = panchayats.find(p => p.id === profile?.panchayat_id);
  const selectedEditPanchayat = panchayats.find(p => p.id === editPanchayatId);
  const wardOptions = selectedEditPanchayat
    ? Array.from({ length: selectedEditPanchayat.ward_count }, (_, i) => i + 1)
    : [];

  const openEditDialog = () => {
    setEditName(profile?.name || '');
    setEditPanchayatId(profile?.panchayat_id || '');
    setEditWardNumber(profile?.ward_number?.toString() || '');
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editName.trim(),
          panchayat_id: editPanchayatId || null,
          ward_number: editWardNumber ? parseInt(editWardNumber) : null,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setPasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 pb-20">
        <User className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Login to view profile</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Sign in to access your account
        </p>
        <Button className="mt-6" onClick={() => navigate('/auth')}>
          Login / Sign Up
        </Button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-card px-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-lg font-semibold">Profile</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{profile?.name || 'User'}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{profile?.mobile_number}</span>
                </div>
                {(panchayat || profile?.ward_number) && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {profile?.ward_number && `Ward ${profile.ward_number}`}
                      {profile?.ward_number && panchayat && ', '}
                      {panchayat?.name}
                    </span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={openEditDialog}>
                <Edit2 className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role-based Dashboard Navigation */}
        {(role === 'super_admin' || role === 'admin' || isCook || isDelivery) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Dashboards</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              {(role === 'super_admin' || role === 'admin') && (
                <button
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
                  onClick={() => navigate('/admin')}
                >
                  <span className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Admin Dashboard</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              {(role === 'super_admin' || role === 'admin') && (isCook || isDelivery) && <Separator />}
              {isCook && (
                <button
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
                  onClick={() => navigate('/cook/dashboard')}
                >
                  <span className="flex items-center gap-3">
                    <ChefHat className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Cook Dashboard</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              {isCook && isDelivery && <Separator />}
              {isDelivery && (
                <button
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
                  onClick={() => navigate('/delivery/dashboard')}
                >
                  <span className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Delivery Dashboard</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-0">
            <button
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
              onClick={() => setPasswordOpen(true)}
            >
              <span className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span>Change Password</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator />
            <button
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
              onClick={() => navigate('/addresses')}
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>Saved Addresses</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card>
          <CardContent className="p-0">
            <button
              className="flex w-full items-center gap-3 p-4 text-left text-destructive transition-colors hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Penny Carbs v1.0.0
        </p>
      </main>

      <BottomNav />

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
              />
            </div>
            <div>
              <Label>Panchayat</Label>
              <Select value={editPanchayatId} onValueChange={(v) => { setEditPanchayatId(v); setEditWardNumber(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select panchayat" />
                </SelectTrigger>
                <SelectContent>
                  {panchayats.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {wardOptions.length > 0 && (
              <div>
                <Label>Ward Number</Label>
                <Select value={editWardNumber} onValueChange={setEditWardNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wardOptions.map(w => (
                      <SelectItem key={w} value={w.toString()}>Ward {w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Mobile Number</Label>
              <Input value={profile?.mobile_number || ''} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Mobile number cannot be changed</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                maxLength={72}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                maxLength={72}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
