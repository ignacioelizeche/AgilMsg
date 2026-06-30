'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardTitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost, getOrg } from '@/lib/api';
import {
  MessageCircle, Phone, Wifi, WifiOff, Plus, ExternalLink, RefreshCw, Trash2
} from 'lucide-react';

interface PhoneNumber {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  qualityRating: string;
  verifiedName: string;
  status: string;
}

interface WABA {
  id: string;
  wabaId: string;
  name: string;
  status: string;
  phoneNumbers: PhoneNumber[];
}

export default function CuentasPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<WABA[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiGet('/api/accounts');
      setAccounts(res.accounts || []);
    } catch {
      toast('error', 'Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const totalPhones = accounts.reduce((sum, a) => sum + a.phoneNumbers.length, 0);
  const connected = accounts.reduce(
    (sum, a) => sum + a.phoneNumbers.filter((p) => p.status === 'CONNECTED').length,
    0
  );

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cuentas de WhatsApp</h1>
          <p className="text-sm text-muted mt-1">
            Gestiona tus cuentas de WhatsApp Business y numeros de telefono
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Conectar WABA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Cuentas conectadas"
          value={accounts.length}
          icon={<MessageCircle size={28} />}
        />
        <StatCard
          label="Numeros activos"
          value={connected}
          icon={<Phone size={28} />}
          color="text-accent"
        />
        <StatCard
          label="Total numeros"
          value={totalPhones}
          icon={<Wifi size={28} />}
          color="text-secondary"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Cargando...</div>
      ) : accounts.length === 0 ? (
        <Card className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            No hay cuentas conectadas
          </h3>
          <p className="text-sm text-muted mb-4">
            Conecta tu primera cuenta de WhatsApp Business para comenzar
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Conectar ahora
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts.map((acc) => (
            <Card key={acc.id}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Cuenta de WhatsApp Business</CardTitle>
                  <h3 className="text-lg font-semibold text-primary">{acc.name}</h3>
                  <p className="text-xs text-muted mt-1">WABA: {acc.wabaId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      acc.status === 'CONNECTED' ? 'bg-success' : 'bg-danger'
                    }`} />
                    <span className="text-xs text-muted">{acc.status}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw size={14} /> Sync
                </Button>
              </div>

              {acc.phoneNumbers.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
                    Numeros de telefono
                  </p>
                  <div className="space-y-2">
                    {acc.phoneNumbers.map((pn) => (
                      <div
                        key={pn.id}
                        className="flex items-center justify-between bg-surface-bg rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            pn.qualityRating === 'GREEN' ? 'bg-success'
                              : pn.qualityRating === 'YELLOW' ? 'bg-warning'
                              : pn.qualityRating === 'RED' ? 'bg-danger'
                              : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {pn.displayPhoneNumber}
                            </p>
                            <p className="text-xs text-muted">{pn.verifiedName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            pn.status === 'CONNECTED' ? 'bg-green-100 text-success' : 'bg-red-100 text-danger'
                          }`}>
                            {pn.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Conectar WhatsApp Business">
        <EmbeddedSignup onComplete={() => { setShowAdd(false); load(); }} />
      </Modal>
    </DashboardShell>
  );
}

function EmbeddedSignup({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const org = getOrg();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const FB = (window as any).FB;
      if (!FB) {
        toast('error', 'Meta SDK no cargado. Recarga la pagina.');
        return;
      }

      FB.login(
        async (response: any) => {
          if (!response.authResponse?.code) {
            setLoading(false);
            return;
          }

          try {
            const res = await apiPost('/api/onboarding/exchange-code', {
              code: response.authResponse.code,
              organizationId: org?.id,
            });

            if (res.success) {
              toast('success', 'Cuenta conectada exitosamente');
              onComplete();
            } else {
              toast('error', res.error || 'Error al conectar cuenta');
            }
          } catch {
            toast('error', 'Error al procesar conexion');
          } finally {
            setLoading(false);
          }
        },
        { config_id: process.env.NEXT_PUBLIC_EMBEDDED_SIGNUP_CONFIG_ID, response_type: 'code', override_default_response_type: true }
      );
    } catch {
      setLoading(false);
      toast('error', 'Error al iniciar Meta SDK');
    }
  };

  return (
    <div className="text-center py-4">
      <p className="text-sm text-muted mb-6">
        Seras redirigido a Meta para autorizar el acceso a tus cuentas de WhatsApp Business.
      </p>
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? 'Conectando...' : 'Conectar con Meta'}
      </Button>
    </div>
  );
}
