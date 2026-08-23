import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'

const CONFIG = {
  up: { Icon: ArrowUp, color: 'text-red-500' },
  down: { Icon: ArrowDown, color: 'text-emerald-500' },
  flat: { Icon: ArrowRight, color: 'text-gray-400' },
}

export function TrendArrow({ direction }) {
  const { Icon, color } = CONFIG[direction] || CONFIG.flat
  return <Icon size={16} className={color} />
}
