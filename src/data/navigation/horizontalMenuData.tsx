// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Act Master',
    href: '/act-master',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Compliance Master',
    href: '/compliance-master',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Event Generate',
    href: '/event-generate',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Add Act Type',
    href: '/add-act-type',
    icon: 'tabler-info-circle'
  },
  {
    label: 'No Mail',
    href: '/no-mail',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Due Date Pattern',
    href: '/due-date-pattern',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Due Date Change',
    href: '/due-date-change',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Act Wise Email',
    href: '/act-wise-email',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Update Compliance',
    href: '/update-compliance',
    icon: 'tabler-info-circle'
  }
]

export default horizontalMenuData
