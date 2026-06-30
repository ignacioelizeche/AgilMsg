'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost } from '@/lib/api';
import { Send, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  waMessageId: string;
  direction: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
  phoneNumber: { displayPhoneNumber: string };
}

export default function MensajesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const [msgRes, accRes] = await Promise.all([
        apiGet('/api/messages'),
        apiGet('/api/accounts'),
      ]);
      setMessages(msgRes.messages || []);
      setAccounts(accRes.accounts || []);
    } catch {
      toast('error', 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mensajes</h1>
          <p className="text-sm text-muted mt-1">
            Historial de mensajes enviados y recibidos
          </p>
        </div>
        <Button onClick={() => setShowSend(true)}>
          <Send size={16} /> Enviar mensaje
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Cargando...</div>
      ) : messages.length === 0 ? (
        <Card className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Sin mensajes</h3>
          <p className="text-sm text-muted mb-4">
            Envia tu primer mensaje de WhatsApp para ver el historial
          </p>
          <Button onClick={() => setShowSend(true)}>
            <Send size={16} /> Enviar mensaje
          </Button>
        </Card>
      ) : (
        <Card>
          <CardTitle>Historial de mensajes</CardTitle>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-4 p-3 bg-surface-bg rounded-lg"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.direction === 'OUTBOUND' ? 'bg-accent/20 text-primary' : 'bg-blue-100 text-blue-600'
                }`}>
                  {msg.direction === 'OUTBOUND' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      {msg.phoneNumber?.displayPhoneNumber}
                    </span>
                    <span className="text-xs text-muted">{msg.type}</span>
                  </div>
                  <p className="text-sm text-muted truncate">{msg.content}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    msg.status === 'SENT' ? 'bg-green-100 text-success'
                      : msg.status === 'FAILED' ? 'bg-red-100 text-danger'
                      : 'bg-gray-100 text-muted'
                  }`}>
                    {msg.status}
                  </span>
                  <p className="text-xs text-muted mt-1">
                    {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={showSend} onClose={() => setShowSend(false)} title="Enviar mensaje">
        <SendMessageBox accounts={accounts} onSent={() => { setShowSend(false); load(); }} />
      </Modal>
    </DashboardShell>
  );
}

function SendMessageBox({ accounts, onSent }: { accounts: any[]; onSent: () => void }) {
  const { toast } = useToast();
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [loading, setLoading] = useState(false);

  const phones = accounts.flatMap((a: any) =>
    a.phoneNumbers?.map((p: any) => ({ ...p, accountName: a.name })) || []
  );

  const handleSend = async () => {
    if (!to || !message || !phoneNumberId) return;
    setLoading(true);
    try {
      const res = await apiPost('/api/messages/send', { to, message, phoneNumberId });
      if (res.success) {
        toast('success', 'Mensaje enviado');
        onSent();
      } else {
        toast('error', res.error || 'Error al enviar');
      }
    } catch {
      toast('error', 'Error al enviar mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Numero de salida
        </label>
        <select
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        >
          <option value="">Seleccionar numero...</option>
          {phones.map((p: any) => (
            <option key={p.phoneNumberId} value={p.phoneNumberId}>
              {p.displayPhoneNumber} ({p.accountName})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Numero destino (con codigo de pais)
        </label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="+5491155551234"
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Mensaje
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        />
      </div>

      <Button onClick={handleSend} disabled={loading || !to || !message || !phoneNumberId} className="w-full">
        {loading ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );
}
