import { Button } from '@/components/ui';
import { Palette } from 'lucide-react';
/**
 * @param {Object} props
 * @returns {JSX.Element}
 */
function ThemeSelector({
  onOpenModal
}) {
  return <div className="space-y-3">
      <label className="block text-sm font-semibold text-text-secondary">
        Board Theme
      </label>
      <Button onClick={onOpenModal} variant="gradient" icon={Palette} fullWidth>
        Customize Theme
      </Button>
    </div>;
}
export default ThemeSelector;
