import { memo } from 'react';

const FamousPositionButton = memo(
  ({ position, onClick }) => {
    return (
      <button
        onClick={() => onClick(position.fen)}
        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-left text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border hover:border-accent/50"
        title={position.description}
        aria-label={`Load ${position.name} position`}
      >
        <span className="font-semibold">{position.name}</span>
      </button>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.position.fen === nextProps.position.fen;
  }
);

FamousPositionButton.displayName = 'FamousPositionButton';

export default FamousPositionButton;
