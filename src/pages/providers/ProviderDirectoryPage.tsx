import { useState } from 'react'
import { Building2, Phone, Plus } from 'lucide-react'
import { PageHeader } from '../../components/shared/PageHeader'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { EmptyState } from '../../components/shared/EmptyState'
import { toast } from '../../components/shared/Toast'
import { providers } from '../../data/providers'

export function ProviderDirectoryPage() {
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [networkFilter, setNetworkFilter] = useState('')

  const specialties = [...new Set(providers.map((p) => p.specialty))].sort()

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase()
    if (q && !p.name.toLowerCase().includes(q) && !p.npi.includes(q) && !p.specialty.toLowerCase().includes(q)) return false
    if (specialtyFilter && p.specialty !== specialtyFilter) return false
    if (networkFilter && p.networkStatus !== networkFilter) return false
    return true
  })

  return (
    <div>
      <PageHeader
        title="Provider Directory"
        description={`${providers.length} providers`}
        actions={
          <button
            onClick={() => toast('info', 'Add Provider', 'This feature is coming soon')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Provider
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, NPI, specialty..."
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Specialties</option>
          {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Network Status</option>
          <option value="in-network">In-Network</option>
          <option value="out-of-network">Out-of-Network</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No providers found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {provider.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-xs text-gray-500">{provider.specialty}</p>
                      <p className="text-xs text-gray-400">NPI: {provider.npi}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <StatusBadge status={provider.networkStatus} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${provider.acceptingPatients ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {provider.acceptingPatients ? 'Accepting patients' : 'Not accepting'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{provider.location}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{provider.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
