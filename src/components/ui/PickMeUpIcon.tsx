import Image from 'next/image';
import { getMockTriders } from '@/lib/mockTriders';

interface PickMeUpIconProps {
  onClick?: () => void;
}

const PickMeUpIcon: React.FC<PickMeUpIconProps> = ({ onClick }) => {
  const handleClick = () => {
    console.log('Pick Me Up button clicked!');
    // The logic for finding triders and sending requests will be handled by the parent component.
  };
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
      <Image
 src="/pickmeupnow.png"
 alt="Pick Me Up Now"
 width={200} // Adjust width as needed
 height={200} // Adjust height as needed
 style={{ opacity: 1 }}
      />
    </button>
  );
};

export default PickMeUpIcon;
