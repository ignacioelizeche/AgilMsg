export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-surface-bg py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[10px] shadow-card p-8 md:p-12">
        <h1 className="text-2xl font-bold text-primary mb-2">Eliminacion de Datos</h1>
        <p className="text-sm text-muted mb-8">Ultima actualizacion: 30 de junio de 2026</p>

        <div className="space-y-6 text-sm text-primary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">Que datos recopilamos</h2>
            <p>
              AgilMsg recopila y almacena los siguientes tipos de datos cuando utiliza
              nuestra plataforma:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted">
              <li>Informacion de cuenta (email, nombre)</li>
              <li>IDs de cuentas de WhatsApp Business conectadas</li>
              <li>Numeros de telefono registrados</li>
              <li>Historial de mensajes enviados y recibidos</li>
              <li>Plantillas de mensajes creadas</li>
              <li>Datos de uso y facturacion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Como eliminar sus datos</h2>
            <p>
              Usted puede eliminar sus datos de las siguientes maneras:
            </p>

            <div className="mt-4 p-4 bg-surface-bg rounded-lg">
              <h3 className="font-semibold mb-2">Opcion 1: Desde la plataforma</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted">
                <li>Inicie sesion en AgilMsg</li>
                <li>Vaya a Configuracion de su cuenta</li>
                <li>Seleccione &quot;Eliminar mi cuenta y datos&quot;</li>
                <li>Confirme la eliminacion</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-surface-bg rounded-lg">
              <h3 className="font-semibold mb-2">Opcion 2: Solicitar por email</h3>
              <p className="text-muted">
                Envie un email a <strong>soporte@agilapps.com</strong> con el asunto
                &quot;Solicitud de eliminacion de datos&quot; incluyendo:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted">
                <li>Su email registrado en la plataforma</li>
                <li>Solicitud explicita de eliminacion de todos sus datos</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Que datos se eliminan</h2>
            <p>
              Al procesar su solicitud, eliminaremos permanentemente:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted">
              <li>Su cuenta de usuario y credenciales de acceso</li>
              <li>Todas las cuentas de WhatsApp Business conectadas</li>
              <li>Todos los numeros de telefono registrados</li>
              <li>Todo el historial de mensajes</li>
              <li>Todas las plantillas creadas</li>
              <li>Todos los registros de uso y facturacion</li>
              <li>Cualquier otro dato personal asociado a su cuenta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Plazo de eliminacion</h2>
            <p>
              Procesaremos su solicitud de eliminacion dentro de los 30 dias calendario
              siguientes a la recepcion de la solicitud confirmada. Recibira una notificacion
              por email una vez que la eliminacion se haya completado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Datos que podriamos retener</h2>
            <p>
              Podemos retener ciertos datos cuando sea legalmente requerido o necesario para
              cumplir con obligaciones regulatorias, resolver disputas, o hacer cumplir
              nuestros acuerdos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contacto</h2>
            <p>
              Para solicitudes de eliminacion de datos o preguntas sobre esta politica,
              contacte a: <strong>soporte@agilapps.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
