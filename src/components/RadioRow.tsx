import Link from 'next/link';
import styles from './RadioRow.module.css';

const RadioRow: React.FC<{
  radioId: string;
  id: number;
  listingId: string;
  label: string;
  isChecked: boolean;
  handleChecked: (_: number, listingId: string) => void;
  price: string;
  listedBy: string;
  key: number;
}> = ({
  listingId,
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
    <div
      onClick={() => handleChecked(id, listingId)}
      className={`${styles.radio} ${isChecked ? styles.radioactive : ''}`}
    >
      <input
        className={styles.radiobutton}
        type="radio"
        name={radioId}
        id={label}
        checked={isChecked}
      />
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
    </div>
  );
};
export default RadioRow;
