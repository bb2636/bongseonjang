import './Spacer.css';

interface SpacerProps {
  height?: number;
  backgroundColor?: string;
}

const DEFAULT_HEIGHT = 8;

export default function Spacer({
  height = DEFAULT_HEIGHT,
  backgroundColor = '#F5F5F5',
}: SpacerProps) {
  return (
    <div
      className="spacer"
      style={{
        height: `${height}px`,
        backgroundColor,
      }}
    />
  );
}
