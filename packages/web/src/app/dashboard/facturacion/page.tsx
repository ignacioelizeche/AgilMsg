'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardTitle, StatCard } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { apiGet } from '@/lib/api';
import { Receipt, TrendingUp, BarChart3 } from 'lucide-react';

interface UsageRecord {
  id: string;
  category: string;
  count: number;
  cost: number;
  periodStart: string;
  periodEnd: string;
  phoneNumber: { displayPhoneNumber: string };
}

export default function FacturacionPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await apiGet('/api/billing/usage');
      const usage = res.usage || [];
      setRecords(usage);
      setTotalCost(usage.reduce((sum: number, r: UsageRecord) => sum + (r.cost || 0), 0));
      setTotalMessages(usage.reduce((sum: number, r: UsageRecord) => sum + (r.count || 0), 0));
    } catch {
      toast('error', 'Error al cargar facturacion');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const categoryLabels: Record<string, string> = {
    marketing: 'Marketing',
    utility: 'Utility',
    authentication: 'Authentication',
    service: 'Servicio',
  };

  const categoryColors: Record<string, string> = {
    marketing: 'bg-blue-100 text-blue-700',
    utility: 'bg-green-100 text-green-700',
    authentication: 'bg-purple-100 text-purple-700',
    service: 'bg-gray-100 text-gray-700',
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Facturacion</h1>
          <p className="text-sm text-muted mt-1">
            Uso y costos de mensajes de WhatsApp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Costo total"
          value={`$${totalCost.toFixed(2)}`}
          icon={<Receipt size={28} />}
        />
        <StatCard
          label="Mensajes enviados"
          value={totalMessages}
          icon={<TrendingUp size={28} />}
          color="text-accent"
        />
        <StatCard
          label="Categorias activas"
          value={new Set(records.map((r) => r.category)).size}
          icon={<BarChart3 size={28} />}
          color="text-secondary"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Cargando...</div>
      ) : records.length === 0 ? (
        <Card className="text-center py-12">
          <Receipt size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Sin uso registrado</h3>
          <p className="text-sm text-muted">
            Los costos apareceran cuando comiences a enviar mensajes
          </p>
        </Card>
      ) : (
        <Card>
          <CardTitle>Detalle de uso</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Numero
                  </th>
                  <th className="text-left py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Categoria
                  </th>
                  <th className="text-right py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Cantidad
                  </th>
                  <th className="text-right py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Costo
                  </th>
                  <th className="text-right py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Periodo
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 text-primary font-medium">
                      {r.phoneNumber?.displayPhoneNumber}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${categoryColors[r.category] || ''}`}>
                        {categoryLabels[r.category] || r.category}
                      </span>
                    </td>
                    <td className="py-3 text-right">{r.count}</td>
                    <td className="py-3 text-right font-medium">${r.cost?.toFixed(4)}</td>
                    <td className="py-3 text-right text-muted">
                      {new Date(r.periodStart).toLocaleDateString('es-AR')} - {new Date(r.periodEnd).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
