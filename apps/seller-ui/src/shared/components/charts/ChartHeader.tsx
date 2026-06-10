type Props = {
  title: string;
  subtitle: string;
};

const ChartHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-4">
      <h2 className="text-white text-xl font-semibold">{title}</h2>

      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
};

export default ChartHeader;