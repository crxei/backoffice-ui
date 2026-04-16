import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInYears, parseISO } from 'date-fns'
import { Plus, Users, Activity, Heart, Baby, AlertTriangle, Brain, Stethoscope } from 'lucide-react'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type Patient } from '../../data/patients'
import { providers } from '../../data/providers'

type TabId = 'all' | 'diabetes' | 'hypertension' | 'elderly' | 'pregnant' | 'high-risk' | 'mental-health'

interface Tab {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  filter: (p: Patient) => boolean
}

const hasCondition = (p: Patient, ...keywords: string[]) =>
  p.conditions.some((c) => keywords.some((k) => c.toLowerCase().includes(k.toLowerCase())))

const tabs: Tab[] = [
  {
    id: 'all',
    label: 'All Patients',
    icon: Users,
    color: 'blue',
    filter: () => true,
  },
  {
    id: 'diabetes',
    label: 'Diabetes',
    icon: Activity,
    color: 'amber',
    filter: (p) => hasCondition(p, 'diabetes'),
  },
  {
    id: 'hypertension',
    label: 'Hypertension',
    icon: Heart,
    color: 'red',
    filter: (p) => hasCondition(p, 'hypertension'),
  },
  {
    id: 'elderly',
    label: 'Elderly (65+)',
    icon: Stethoscope,
    color: 'teal',
    filter: (p) => differenceInYears(new Date(), parseISO(p.dob)) >= 65,
  },
  {
    id: 'pregnant',
    label: 'Pregnant Women',
    icon: Baby,
    color: 'pink',
    filter: (p) => hasCondition(p, 'pregnan', 'gestational'),
  },
  {
    id: 'high-risk',
    label: 'High-Risk Chronic',
    icon: AlertTriangle,
    color: 'orange',
    filter: (p) => p.riskLevel === 'high',
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    icon: Brain,
    color: 'purple',
    filter: (p) => hasCondition(p, 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'ptsd', 'mental health'),
  },
]

const tabActiveStyles: Record<string, string> = {
  blue: 'border-blue-600 text-blue-700 bg-blue-50',
  amber: 'border-amber-500 text-amber-700 bg-amber-50',
  red: 'border-red-500 text-red-700 bg-red-50',
  teal: 'border-teal-500 text-teal-700 bg-teal-50',
  pink: 'border-pink-500 text-pink-700 bg-pink-50',
  orange: 'border-orange-500 text-orange-700 bg-orange-50',
  purple: 'border-purple-500 text-purple-700 bg-purple-50',
}

const tabBadgeStyles: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  teal: 'bg-teal-100 text-teal-700',
  pink: 'bg-pink-100 text-pink-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
}

export function PatientListPage() {
  const navigate = useNavigate()
  const { data: patients, isLoading } = usePatients()
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [riskFilter, setRiskFilter] = useState('')
  const [payerFilter, setPayerFilter] = useState('')
  const [consentFilter, setConsentFilter] = useState('')

  if (isLoading) return <PageLoader />

  const allPatients = patients ?? []
  const payers = [...new Set(allPatients.map((p) => p.insurance.payer))].sort()

  const currentTab = tabs.find((t) => t.id === activeTab)!

  const tabFiltered = allPatients.filter(currentTab.filter)

  const filtered = tabFiltered.filter((p) => {
    if (riskFilter && p.riskLevel !== riskFilter) return false
    if (payerFilter && p.insurance.payer !== payerFilter) return false
    if (consentFilter && p.consentStatus !== consentFilter) return false
    return true
  })

  const getProviderName = (id: string) => providers.find((pr) => pr.id === id)?.name ?? id

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'mrn', header: 'MRN', sortable: true },
    {
      key: 'name',
      header: 'Patient',
      render: (row) => {
        const p = row as unknown as Patient
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {p.firstName[0]}{p.lastName[0]}
            </div>
            <span className="font-medium text-gray-900">{p.firstName} {p.lastName}</span>
          </div>
        )
      },
    },
    {
      key: 'dob',
      header: 'Age / DOB',
      sortable: true,
      render: (row) => {
        const p = row as unknown as Patient
        return <span>{differenceInYears(new Date(), parseISO(p.dob))}y · {p.dob}</span>
      },
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'conditions',
      header: 'Conditions',
      render: (row) => {
        const p = row as unknown as Patient
        return (
          <div className="flex flex-wrap gap-1">
            {p.conditions.slice(0, 2).map((c) => (
              <span key={c} className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {c}
              </span>
            ))}
            {p.conditions.length > 2 && (
              <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                +{p.conditions.length - 2}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'insurance',
      header: 'Insurance',
      render: (row) => {
        const p = row as unknown as Patient
        return <span className="text-sm">{p.insurance.payer}</span>
      },
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      sortable: true,
      render: (row) => <StatusBadge status={(row as unknown as Patient).riskLevel} />,
    },
    {
      key: 'consentStatus',
      header: 'Consent',
      render: (row) => <StatusBadge status={(row as unknown as Patient).consentStatus} />,
    },
    {
      key: 'primaryProvider',
      header: 'Provider',
      render: (row) => <span className="text-sm text-gray-600">{getProviderName((row as unknown as Patient).primaryProvider)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/patients/${(row as unknown as Patient).id}`) }}
          className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
        >
          View
        </button>
      ),
    },
  ]

  const tableData = filtered.map((p) => ({ ...p } as unknown as Record<string, unknown>))

  return (
    <div>
      <PageHeader
        title="Patient Registry"
        description={`${allPatients.length} patients enrolled`}
        actions={
          <button
            onClick={() => navigate('/patients/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Register New Patient
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-gray-200">
        {tabs.map((tab) => {
          const count = allPatients.filter(tab.filter).length
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setRiskFilter(''); setPayerFilter(''); setConsentFilter('') }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                isActive
                  ? tabActiveStyles[tab.color]
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? tabBadgeStyles[tab.color] : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        searchable
        searchPlaceholder="Search by name, MRN, email..."
        onRowClick={(row) => navigate(`/patients/${(row as unknown as Patient).id}`)}
        extraFilters={
          <div className="flex flex-wrap gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payers</option>
              {payers.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Consent Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        }
      />
    </div>
  )
}
