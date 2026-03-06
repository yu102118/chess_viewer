import { SearchableSelect } from '@/components/ui';
import { PIECE_SETS } from '@/constants';

/**
 * Searchable dropdown for selecting the active chess piece style.
 * @param {Object} props
 * @param {string} props.pieceStyle - Currently selected piece style identifier
 * @param {Function} props.setPieceStyle - Updates the active piece style
 * @returns {JSX.Element}
 */
const PieceSelector = ({ pieceStyle, setPieceStyle }) => {
  return (
    <SearchableSelect
      options={PIECE_SETS}
      value={pieceStyle}
      onChange={setPieceStyle}
      label="Piece Style"
      placeholder="Search piece style..."
      emptyMessage="No matching piece styles"
    />
  );
};

export default PieceSelector;
