import Link from 'next/link';

const SuccessPage = () => {
  return (
    <div>
      <h1>Ticket(s) purchased successfully</h1>
      <Link style={{ color: 'var(--good-green)' }} href="/orderhistory">
        view ticket details in your order history page
      </Link>
    </div>
  );
};
export default SuccessPage;
