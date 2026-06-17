type Props = {
  title: string;
  subtitle: string;
};

const ChartHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-4">
      <h2 className="text-white text-xl font-semibold pl-4 lg:pl-0">{title}</h2>

      <p className="text-gray-400 text-sm pl-4 lg:pl-0 mt-1">{subtitle}</p>
    </div>
  );
};

export default ChartHeader;