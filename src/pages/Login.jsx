import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordRequirements from '@/components/PasswordRequirements';
import { formatPasswordErrors, validatePassword } from '@/lib/passwordValidation';
import { resolveAppPath } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const inviteToken = searchParams.get('invite_token');
  const inviteEmail = searchParams.get('email');
  const isInviteFlow = Boolean(inviteToken && inviteEmail);
  const fromUrl = resolveAppPath(searchParams.get('from_url'), '/');

  useEffect(() => {
    if (inviteEmail) setEmail(inviteEmail);
  }, [inviteEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isInviteFlow) {
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
          setError(formatPasswordErrors(passwordCheck.errors));
          setLoading(false);
          return;
        }
        await api.auth.registerInvite({
          token: inviteToken,
          email,
          password,
          full_name: fullName,
        });
      } else {
        await api.auth.login(email, password);
      }
      await refreshAuth();
      navigate(fromUrl, { replace: true });
    } catch (err) {
      setError(err.message || (isInviteFlow ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Stratelegy Insight</CardTitle>
          <CardDescription>
            {isInviteFlow ? 'Complete your portal account setup' : 'Sign in to your dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isInviteFlow && (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                readOnly={isInviteFlow}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{isInviteFlow ? 'Choose password' : 'Password'}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isInviteFlow ? 'new-password' : 'current-password'}
              />
              {isInviteFlow && <PasswordRequirements password={password} className="mt-2" />}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isInviteFlow
                  ? 'Creating account...'
                  : 'Signing in...'
                : isInviteFlow
                  ? 'Create account'
                  : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
