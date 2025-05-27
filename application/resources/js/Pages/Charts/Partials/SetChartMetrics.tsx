import Title from "@/Components/atoms/Title";
import { useTranslation } from "react-i18next";
import Step1 from "./Step1";
import Card from "@/Components/Card";

export default function SetChartMetrics(){
    const {t} = useTranslation();
    return(
        <div>
            <Title level='2'>{t('charts.setMetrics')}</Title>
            <Card>
                <Step1/>
            </Card>
        </div>
    )
}