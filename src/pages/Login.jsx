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
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [emailHint, setEmailHint] = useState('');
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

  const finishSignIn = async () => {
    await refreshAuth();
    navigate(fromUrl, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mfaStep) {
        await api.auth.verifyMfa(mfaToken, mfaCode.trim());
        await finishSignIn();
        return;
      }

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
        await finishSignIn();
        return;
      }

      const result = await api.auth.login(email, password);
      if (result.mfaRequired) {
        setMfaStep(true);
        setMfaToken(result.mfaToken);
        setEmailHint(result.emailHint || 'your email');
        setMfaCode('');
        return;
      }
      await finishSignIn();
    } catch (err) {
      setError(err.message || (isInviteFlow ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendMfa = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api.auth.resendMfa(mfaToken);
      setMfaToken(result.mfa_token);
      setEmailHint(result.email_hint || emailHint);
    } catch (err) {
      setError(err.message || 'Could not resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPassword = () => {
    setMfaStep(false);
    setMfaToken('');
    setMfaCode('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Stratelegy Insight</CardTitle>
          <CardDescription>
            {isInviteFlow
              ? 'Complete your portal account setup'
              : mfaStep
                ? 'Enter the verification code sent to your email'
                : 'Sign in to your dashboard'}
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

            {!mfaStep && (
              <>
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
              </>
            )}

            {mfaStep && (
              <>
                <p className="text-sm text-gray-600">
                  We sent a 6-digit code to <strong>{emailHint}</strong>. Email MFA uses your
                  account email only — not SMS or phone.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="mfa_code">Verification code</Label>
                  <Input
                    id="mfa_code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                    onClick={handleBackToPassword}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    disabled={loading}
                    onClick={handleResendMfa}
                  >
                    Resend code
                  </Button>
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mfaStep
                  ? 'Verifying...'
                  : isInviteFlow
                    ? 'Creating account...'
                    : 'Signing in...'
                : mfaStep
                  ? 'Verify and sign in'
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
