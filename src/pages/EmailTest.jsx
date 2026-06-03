import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import AccessDenied from '@/components/AccessDenied';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';

function StatusBadge({ ok, label }) {
  return (
    <Badge variant={ok ? 'default' : 'secondary'} className={ok ? 'bg-green-600 hover:bg-green-600' : ''}>
      {label}
    </Badge>
  );
}

function ErrorHints({ hints, detail }) {
  if (!hints?.length && !detail) return null;
  return (
    <div className="space-y-2 pt-1">
      {hints?.length > 0 && (
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      )}
      {detail && (
        <p className="text-xs opacity-70 break-all">Server: {detail}</p>
      )}
    </div>
  );
}

function EmailTestContent() {
  const { user } = useAuth();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const [recipient, setRecipient] = useState(user?.email || '');
  const [verifyResult, setVerifyResult] = useState(null);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    if (user?.email) setRecipient((prev) => prev || user.email);
  }, [user?.email]);

  const { data: status, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['email-status'],
    queryFn: () => api.email.status(),
    enabled: isAdmin,
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.email.verify(),
    onSuccess: (result) => setVerifyResult(result),
    onError: (err) => setVerifyResult({ ok: false, message: err.message }),
  });

  const sendMutation = useMutation({
    mutationFn: (to) => api.email.sendTest(to),
    onSuccess: (result) => setSendResult(result),
    onError: (err) => setSendResult({ sent: false, message: err.message }),
  });

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const isGmail = status?.host?.includes('gmail.com');

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Test</h1>
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
            Temporary
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Verify SMTP settings and send a test message. Remove this page from navigation when done.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5" /> SMTP configuration
          </CardTitle>
          <CardDescription>Values from server environment (password is never shown)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : isError ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error?.message || 'Could not load email status. Restart the server after updating .env.'}</span>
            </div>
          ) : status ? (
            <>
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={status.enabled} label={status.enabled ? 'MAIL_ENABLED' : 'MAIL_DISABLED'} />
                <StatusBadge ok={status.configured} label={status.configured ? 'Ready to send' : 'Not configured'} />
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Host</dt>
                  <dd className="font-medium">{status.host || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Port / Secure</dt>
                  <dd className="font-medium">
                    {status.port} / {status.secure ? 'SSL' : 'STARTTLS'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">User</dt>
                  <dd className="font-medium">{status.user || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">From</dt>
                  <dd className="font-medium break-all">{status.from || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reply-To</dt>
                  <dd className="font-medium break-all">{status.replyTo || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">App name</dt>
                  <dd className="font-medium">{status.appName}</dd>
                </div>
              </dl>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh status
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      {isGmail && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-amber-950">Gmail / Google Workspace</CardTitle>
            <CardDescription className="text-amber-900/80">
              Error 535 means Google rejected the password — normal account passwords do not work for SMTP.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-amber-950 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Sign in to the Google account for <strong>{status?.user || 'your SMTP user'}</strong>.</li>
              <li>Enable <strong>2-Step Verification</strong> on that account.</li>
              <li>Open <strong>App passwords</strong> (Google Account → Security → App passwords).</li>
              <li>Create a password for “Mail” / “Other (Stratelegy)”.</li>
              <li>Copy the 16-character password into <code className="bg-white/70 px-1 rounded">SMTP_PASS</code> in <code className="bg-white/70 px-1 rounded">.env</code>.</li>
              <li>Restart the server, then click Verify SMTP again.</li>
            </ol>
            <p className="text-xs text-amber-900/70 pt-1">
              Workspace admins: Apps → Google Workspace → Gmail → Routing may also need SMTP relay enabled for this mailbox.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verify connection</CardTitle>
          <CardDescription>Checks login to the SMTP server without sending mail</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Verify SMTP
          </Button>
          {verifyResult && (
            <div
              className={`rounded-lg border p-3 text-sm space-y-2 ${
                verifyResult.ok
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {verifyResult.ok ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span className="font-medium">{verifyResult.message}</span>
              </div>
              {!verifyResult.ok && (
                <ErrorHints hints={verifyResult.hints} detail={verifyResult.detail} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send test email</CardTitle>
          <CardDescription>Delivers a simple test message to the address below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-recipient">Recipient</Label>
            <Input
              id="test-recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button
            onClick={() => sendMutation.mutate(recipient)}
            disabled={sendMutation.isPending || !recipient.trim()}
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send test email
          </Button>
          {sendResult && (
            <div
              className={`rounded-lg border p-3 text-sm space-y-2 ${
                sendResult.sent
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : sendResult.skipped
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              <p className="font-medium">{sendResult.message || (sendResult.sent ? 'Sent' : 'Failed')}</p>
              {sendResult.subject && <p>Subject: {sendResult.subject}</p>}
              {sendResult.messageId && <p className="text-xs opacity-80">Message ID: {sendResult.messageId}</p>}
              {!sendResult.sent && !sendResult.skipped && (
                <ErrorHints hints={sendResult.hints} detail={sendResult.detail} />
              )}
              {sendResult.preview && (
                <pre className="text-xs whitespace-pre-wrap bg-white/60 p-2 rounded border">{sendResult.preview}</pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmailTest() {
  if (import.meta.env.PROD) {
    return (
      <AccessDenied
        title="Not available"
        message="This development tool is not available in production."
      />
    );
  }
  return <EmailTestContent />;
}
