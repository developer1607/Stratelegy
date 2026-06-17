import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, RotateCcw, Save, Code, Type, Paintbrush, Send } from 'lucide-react';
import { showError, showSuccess } from '@/lib/toast';
import { useAuth } from '@/lib/AuthContext';

const EMPTY_CONTENT = {
  subject: '',
  use_layout: true,
  layout_title: '',
  layout_preheader: '',
  layout_cta_url: '',
  layout_cta_label: '',
  html_body: '',
  text: '',
};

export default function EmailTemplateEditor({ templateId, templateMeta, mailEnabled, onSaved }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const visualRef = useRef(null);
  const [editorTab, setEditorTab] = useState('visual');
  const [draft, setDraft] = useState(EMPTY_CONTENT);
  const [previewDraft, setPreviewDraft] = useState(EMPTY_CONTENT);
  const [dirty, setDirty] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['emailTemplateEdit', templateId],
    queryFn: () => api.email.getTemplate(templateId),
    enabled: Boolean(templateId),
  });

  useEffect(() => {
    if (!data?.content) return;
    const { variables, is_customized, updated_date, ...content } = data.content;
    setDraft({
      subject: content.subject || '',
      use_layout: content.use_layout !== false,
      layout_title: content.layout_title || '',
      layout_preheader: content.layout_preheader || '',
      layout_cta_url: content.layout_cta_url || '',
      layout_cta_label: content.layout_cta_label || '',
      html_body: content.html_body || '',
      text: content.text || '',
    });
    setDirty(false);
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setPreviewDraft(draft), 400);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (editorTab === 'visual' && visualRef.current) {
      visualRef.current.innerHTML = draft.html_body || '';
    }
  }, [editorTab, templateId, data]);

  useEffect(() => {
    if (user?.email && !testEmail) {
      setTestEmail(user.email);
    }
  }, [user?.email, testEmail]);

  const previewQuery = useQuery({
    queryKey: ['emailTemplatePreviewDraft', templateId, previewDraft],
    queryFn: () => api.email.previewTemplate(templateId, previewDraft),
    enabled: Boolean(templateId) && Boolean(previewDraft.subject),
  });

  const saveMutation = useMutation({
    mutationFn: () => api.email.saveTemplate(templateId, draft),
    onSuccess: () => {
      showSuccess('Template saved');
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['emailTemplateEdit', templateId] });
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      onSaved?.();
    },
    onError: (err) => showError(err, 'Failed to save template'),
  });

  const resetMutation = useMutation({
    mutationFn: () => api.email.resetTemplate(templateId),
    onSuccess: (result) => {
      showSuccess('Template reset to default');
      const { variables, is_customized, updated_date, ...content } = result.content;
      setDraft({
        subject: content.subject || '',
        use_layout: content.use_layout !== false,
        layout_title: content.layout_title || '',
        layout_preheader: content.layout_preheader || '',
        layout_cta_url: content.layout_cta_url || '',
        layout_cta_label: content.layout_cta_label || '',
        html_body: content.html_body || '',
        text: content.text || '',
      });
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['emailTemplateEdit', templateId] });
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      onSaved?.();
    },
    onError: (err) => showError(err, 'Failed to reset template'),
  });

  const patchDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const syncVisualToDraft = () => {
    if (visualRef.current) {
      patchDraft({ html_body: visualRef.current.innerHTML });
    }
  };

  const handleTabChange = (tab) => {
    if (editorTab === 'visual' && tab !== 'visual') {
      syncVisualToDraft();
    }
    setEditorTab(tab);
  };

  const handleSave = () => {
    if (editorTab === 'visual') syncVisualToDraft();
    saveMutation.mutate();
  };

  const getDraftSnapshot = () => {
    if (editorTab === 'visual' && visualRef.current) {
      return { ...draft, html_body: visualRef.current.innerHTML };
    }
    return draft;
  };

  const testMutation = useMutation({
    mutationFn: (content) =>
      api.email.sendTestTemplate(templateId, {
        to: testEmail.trim(),
        content,
      }),
    onSuccess: (result) => {
      showSuccess(`Test email sent to ${result.to}`);
    },
    onError: (err) => showError(err, 'Failed to send test email'),
  });

  const handleSendTest = () => {
    testMutation.mutate(getDraftSnapshot());
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-8">Loading template…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 py-8">Failed to load template for editing.</p>;
  }

  const variables = data?.content?.variables || [];
  const isCustomized = data?.content?.is_customized;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{templateMeta?.name || templateId}</h3>
          <p className="text-sm text-gray-600 mt-1">{templateMeta?.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {isCustomized ? (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Customized</Badge>
            ) : (
              <Badge variant="outline">Using default</Badge>
            )}
            {dirty && <Badge variant="secondary">Unsaved changes</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resetMutation.isPending || !isCustomized}
            onClick={() => resetMutation.mutate()}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset to default
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saveMutation.isPending || !dirty}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saveMutation.isPending ? 'Saving…' : 'Save template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit template</CardTitle>
            <CardDescription>
              Use placeholders like <code className="text-xs">{`{{appName}}`}</code> or{' '}
              <code className="text-xs">{`{{ticket.title}}`}</code>. They are replaced when the
              email is sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject line</Label>
              <Input
                id="template-subject"
                value={draft.subject}
                onChange={(e) => patchDraft({ subject: e.target.value })}
              />
            </div>

            {draft.use_layout && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border bg-gray-50">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email heading</Label>
                  <Input
                    value={draft.layout_title}
                    onChange={(e) => patchDraft({ layout_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Preview text (inbox snippet)</Label>
                  <Input
                    value={draft.layout_preheader}
                    onChange={(e) => patchDraft({ layout_preheader: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button URL</Label>
                  <Input
                    value={draft.layout_cta_url}
                    onChange={(e) => patchDraft({ layout_cta_url: e.target.value })}
                    placeholder="{{inviteUrl}}"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button label</Label>
                  <Input
                    value={draft.layout_cta_label}
                    onChange={(e) => patchDraft({ layout_cta_label: e.target.value })}
                  />
                </div>
              </div>
            )}

            <Tabs value={editorTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual" className="gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="html" className="gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  Plain text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="mt-4">
                <div
                  ref={visualRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[220px] rounded-md border bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onInput={(e) => patchDraft({ html_body: e.currentTarget.innerHTML })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Visual editor for the email body. Brand header/footer are added automatically.
                </p>
              </TabsContent>

              <TabsContent value="html" className="mt-4">
                <Textarea
                  value={draft.html_body}
                  onChange={(e) => patchDraft({ html_body: e.target.value })}
                  rows={12}
                  className="font-mono text-xs"
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  value={draft.text}
                  onChange={(e) => patchDraft({ text: e.target.value })}
                  rows={12}
                  className="font-mono text-xs"
                  spellCheck={false}
                />
              </TabsContent>
            </Tabs>

            {variables.length > 0 && (
              <div className="rounded-lg border bg-slate-50 p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Available placeholders</p>
                <div className="flex flex-wrap gap-2">
                  {variables.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50"
                      title={v.label}
                      onClick={() => {
                        const token = `{{${v.key}}}`;
                        if (editorTab === 'text') {
                          patchDraft({ text: `${draft.text}${token}` });
                        } else if (editorTab === 'html') {
                          patchDraft({ html_body: `${draft.html_body}${token}` });
                        } else if (visualRef.current) {
                          visualRef.current.focus();
                          document.execCommand('insertText', false, token);
                          setDirty(true);
                        }
                      }}
                    >
                      {`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="w-4 h-4" />
              Live preview
            </CardTitle>
            <CardDescription>Rendered with sample data — updates as you edit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="test-email-to">Send test email</Label>
                <Input
                  id="test-email-to"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={!mailEnabled}
                />
                <p className="text-xs text-gray-500">
                  Uses sample placeholder data. Subject is prefixed with [TEST]. Sends your current
                  editor content — save first if you want the saved version only.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!mailEnabled || !testEmail.trim() || testMutation.isPending}
                onClick={handleSendTest}
              >
                <Send className="w-4 h-4 mr-1.5" />
                {testMutation.isPending ? 'Sending…' : 'Send test email'}
              </Button>
              {!mailEnabled && (
                <p className="text-xs text-amber-700">
                  Configure SMTP on the server before sending test emails.
                </p>
              )}
            </div>

            {previewQuery.isLoading && <p className="text-sm text-gray-500">Rendering preview…</p>}
            {previewQuery.error && (
              <p className="text-sm text-red-600">Could not render preview.</p>
            )}
            {previewQuery.data && (
              <>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Subject
                  </p>
                  <p className="text-sm font-medium text-gray-900">{previewQuery.data.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    HTML
                  </p>
                  <div
                    className="border rounded-md bg-white p-4 max-h-[480px] overflow-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: previewQuery.data.html }}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Plain text
                  </p>
                  <pre className="text-xs bg-gray-50 border rounded-md p-3 whitespace-pre-wrap max-h-40 overflow-auto">
                    {previewQuery.data.text}
                  </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
