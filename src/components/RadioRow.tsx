import Link from 'next/link';
import styles from './RadioRow.module.css';
import RadioRowView from './Radio/RadioRowView';

const RadioRow: React.FC<{
  radioId: string;
  id: number;

  label: string;
  isChecked: boolean;
  handleChecked: (_: number) => void;
  price: string;
  listedBy: string;
  key: number;
}> = ({
  id,
  label,
  isChecked,
  handleChecked,
  listedBy,
  price,
  key,
  radioId,
}) => {
  return (
    <RadioRowView
      label={label}
      isChecked={isChecked}
      radioId={radioId}
      onClick={() => handleChecked(id)}
    >
      <label className={styles.label}>
        <h2>{price}</h2>
        <div>
          <h3 className={styles.titleHighlight}>best for artist</h3>
          <h2>general admission</h2>
          <p>100% of profit goes to the artist</p>
        </div>
        <div>
          <h2>listed by:</h2>
          <Link target="_blank" href={`/listings/${listedBy}`}>
            <p>{listedBy.slice(0, 10)}</p>
          </Link>
        </div>
      </label>
    </RadioRowView>
  );
};
export default RadioRow;
