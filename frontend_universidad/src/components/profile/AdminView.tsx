export default function AdminView({ user }: { user: UserProfile }) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Panel de Control</h1>
          <p className="text-secondary-500 text-sm">Administrador: {user.name}</p>
        </div>
        <button className="w-full md:w-auto bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-all">
          Editar Sistema
        </button>
      </div>

      {/* Stats Responsivos: 1 col móvil, 2 tablet, 4 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Usuarios Totales', value: '1,250', color: 'blue' },
          { label: 'Cursos Activos', value: '45', color: 'emerald' },
          { label: 'Alertas', value: '12', color: 'rose' },
          { label: 'Departamentos', value: '8', color: 'gold' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-secondary-100 shadow-sm">
            <p className="text-secondary-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-secondary-50">
          <h3 className="font-bold text-secondary-800">Logs de Actividad Reciente</h3>
        </div>
        <div className="overflow-x-auto"> {/* Scroll horizontal solo si la tabla es muy ancha */}
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary-50 text-secondary-500">
              <tr>
                <th className="p-4 font-medium">Acción</th>
                <th className="p-4 font-medium">Usuario</th>
                <th className="p-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              <tr>
                <td className="p-4 font-medium">Cambio de rol</td>
                <td className="p-4 text-secondary-600">Admin_Victor</td>
                <td className="p-4 text-secondary-400">Hace 2 mins</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}