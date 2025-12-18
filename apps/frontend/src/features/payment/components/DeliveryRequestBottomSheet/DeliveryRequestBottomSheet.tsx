import './DeliveryRequestBottomSheet.css';

interface DeliveryRequestBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
}

export default function DeliveryRequestBottomSheet({
  isOpen,
  onClose,
  options,
  selectedOption,
  onSelect,
}: DeliveryRequestBottomSheetProps) {
  const handleOptionClick = (option: string) => {
    onSelect(option);
    onClose();
  };

  return (
    <>
      <div
        className={`delivery-request-sheet__overlay ${isOpen ? 'delivery-request-sheet__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`delivery-request-sheet ${isOpen ? 'delivery-request-sheet--visible' : ''}`}>
        <div className="delivery-request-sheet__handle">
          <div className="delivery-request-sheet__handle-bar" />
        </div>

        <div className="delivery-request-sheet__content">
          {options.map((option) => (
            <button
              key={option}
              className={`delivery-request-sheet__option ${
                selectedOption === option ? 'delivery-request-sheet__option--selected' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
