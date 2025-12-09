import './FilterChips.css';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedChipId: string;
  onChipSelect: (chipId: string) => void;
}

export default function FilterChips({ chips, selectedChipId, onChipSelect }: FilterChipsProps) {
  return (
    <div className="filter-chips">
      <div className="filter-chips__container">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`filter-chips__chip ${selectedChipId === chip.id ? 'filter-chips__chip--selected' : ''}`}
            onClick={() => onChipSelect(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
