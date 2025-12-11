import { ResponsivePie } from '@nivo/pie';

type ProposalStatusPieChartProps = {
  completed: number;
  inProgress: number;
  unfunded: number;
};

export const ProposalStatusPieChart: React.FC<ProposalStatusPieChartProps> = ({
  completed,
  inProgress,
  unfunded,
}) => {
  const total = completed + inProgress + unfunded;
  
  const data = [
    { 
      id: 'Completed', 
      label: 'Completed', 
      value: completed, 
      color: '#22c55e' 
    },
    { 
      id: 'In Progress', 
      label: 'In Progress', 
      value: inProgress, 
      color: 'var(--cx-primary)'
    },
    { 
      id: 'Unfunded', 
      label: 'Unfunded', 
      value: unfunded, 
      color: 'var(--cx-dark)'
    },
  ];

  return (
    <div className="relative h-48 w-full">
      <ResponsivePie
        data={data}
        innerRadius={0.55}
        padAngle={0}
        cornerRadius={0}
        activeOuterRadiusOffset={0}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        colors={{ datum: 'data.color' }}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        borderWidth={0}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-content-light text-2xl font-bold leading-tight">
          {total.toLocaleString()}
        </span>
        <span className="text-content-light/70 text-sm leading-4">
          Total
        </span>
      </div>
    </div>
  );
};