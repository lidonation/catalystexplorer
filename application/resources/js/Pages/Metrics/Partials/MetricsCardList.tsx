import MetricCard from "./MetricCard";
import { MetricEnum } from "@/enums/metrics-enums";
import MetricData = App.DataTransferObjects.MetricData;

interface MetricProps {
    metrics: MetricData[];
    sortBy: MetricEnum.ORDER | MetricEnum.CREATED_AT
    sortOrder: MetricEnum.ASCENDING | MetricEnum.DESCENDING
    columns : MetricEnum.TWO_COLUMNS | MetricEnum.THREE_COLUMNS
}

const MetricCardList: React.FC<MetricProps> = ({metrics, sortBy, sortOrder, columns}) =>{
   const sortedMetrics = [...metrics].sort((a, b) => {
       const isAsc = sortOrder === MetricEnum.ASCENDING;
       const orderA = a?.order ?? 0;
       const orderB = b?.order ?? 0;
       const dateA = a?.created_at ? new Date(a.created_at) : new Date(0);
       const dateB = b?.created_at ? new Date(b.created_at) : new Date(0);

       if(sortBy === MetricEnum.ORDER){
         return isAsc ? orderA - orderB : orderB - orderA
       }else{
         return isAsc ? dateA.getDate() - dateB.getDate() : dateB.getDate() - dateA.getDate()
       }
   })


   const columnClass = columns === MetricEnum.TWO_COLUMNS ? 'grid-cols-2' : 'grid-cols-3';

   return(
      <ul className={`grid grid-cols-1 md:grid-cols-2 lg:${columnClass} gap-6 mt-8`}>
         {
            sortedMetrics.map((metric)=>(
                <li key={metric.user_id}>
                    <MetricCard metric={metric}/>
                </li>
            ))
         }
      </ul>
   )
}

export default MetricCardList;