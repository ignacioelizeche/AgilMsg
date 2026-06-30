'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';

interface Template {
  id: string;
  metaTemplateId: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any;
  createdAt: string;
}

export default function PlantillasPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiGet('/api/templates');
      setTemplates(res.templates || []);
    } catch {
      toast('error', 'Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSync = async () => {
    try {
      await apiPost('/api/templates/sync', {});
      toast('success', 'Plantillas sincronizadas');
      load();
    } catch {
      toast('error', 'Error al sincronizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta plantilla?')) return;
    try {
      await apiDelete(`/api/templates/${id}`);
      toast('success', 'Plantilla eliminada');
      load();
    } catch {
      toast('error', 'Error al eliminar');
    }
  };

  const categoryColors: Record<string, string> = {
    MARKETING: 'bg-blue-100 text-blue-700',
    UTILITY: 'bg-green-100 text-green-700',
    AUTHENTICATION: 'bg-purple-100 text-purple-700',
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Plantillas</h1>
          <p className="text-sm text-muted mt-1">
            Administra tus plantillas de mensajes de WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync}>
            <RefreshCw size={16} /> Sincronizar
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Crear plantilla
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Cargando...</div>
      ) : templates.length === 0 ? (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Sin plantillas</h3>
          <p className="text-sm text-muted mb-4">
            Crea tu primera plantilla o sincroniza desde Meta
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleSync}>
              <RefreshCw size={16} /> Sincronizar desde Meta
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Crear plantilla
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <CardTitle>{tpl.name}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${categoryColors[tpl.category] || 'bg-gray-100 text-gray-700'}`}>
                      {tpl.category}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-muted">
                      {tpl.language}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  tpl.status === 'APPROVED' ? 'bg-green-100 text-success'
                    : tpl.status === 'PENDING' ? 'bg-yellow-100 text-warning'
                    : 'bg-red-100 text-danger'
                }`}>
                  {tpl.status}
                </span>
                <span className="text-xs text-muted">
                  {new Date(tpl.createdAt).toLocaleDateString('es-AR')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear plantilla" maxWidth="max-w-xl">
        <CreateTemplateForm onCreated={() => { setShowCreate(false); load(); }} />
      </Modal>
    </DashboardShell>
  );
}

function CreateTemplateForm({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('UTILITY');
  const [language, setLanguage] = useState('es');
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !body) return;
    setLoading(true);
    try {
      const res = await apiPost('/api/templates', {
        name,
        category,
        language,
        components: {
          header: header ? { type: 'TEXT', text: header } : undefined,
          body: { type: 'TEXT', text: body },
          footer: footer ? { text: footer } : undefined,
        },
      });
      if (res.success) {
        toast('success', 'Plantilla creada y enviada a Meta');
        onCreated();
      } else {
        toast('error', res.error || 'Error al crear');
      }
    } catch {
      toast('error', 'Error al crear plantilla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mi_plantilla"
            className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
          >
            <option value="UTILITY">Utility</option>
            <option value="MARKETING">Marketing</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Idioma
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt_BR">Portugues (BR)</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Header (opcional)
        </label>
        <input
          type="text"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          placeholder="Titulo de la plantilla"
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Usa {{1}} para variables dinamicas"
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Footer (opcional)
        </label>
        <input
          type="text"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="Texto de pie"
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg"
        />
      </div>

      <Button onClick={handleCreate} disabled={loading || !name || !body} className="w-full">
        {loading ? 'Creando...' : 'Crear y enviar a Meta'}
      </Button>
    </div>
  );
}
