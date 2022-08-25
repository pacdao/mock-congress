import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
} from "chart.js";
import { Chart, getElementsAtEvent } from "react-chartjs-2";
import { DEFAULT_SCORE_SUPPORTERS, ScoreSupporters, VoteHistoryData } from "pages/CongressPage/CongressPage";
import { useEffect, useRef, useState } from "react";
import { color } from "styles/globalStyles";
import styled from "styled-components";

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, PointElement, LineElement);

type Props = {
  data: VoteHistoryData | null;
  setScoreSupporters: React.Dispatch<React.SetStateAction<ScoreSupporters>>;
};

const labels = ["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"];
const DEFAULT_DATASETS = labels.map((_) => 0);

const VoteHistoryChart = ({ data, setScoreSupporters }: Props) => {
  const chartRef = useRef<ChartJS>(null);
  const [datasets, setDatasets] = useState(DEFAULT_DATASETS);

  useEffect(() => {
    if (!data) return;

    const updatedDatasets = labels.map((k) => (data[k] ? data[k].length : 0));
    setDatasets(updatedDatasets);
  }, [data]);

  const handleClick = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const elements = getElementsAtEvent(chartRef.current, evt);
    if (Array.isArray(elements) && elements.length > 0) {
      const [{ index }] = elements;
      const score = labels[index];
      data && setScoreSupporters({ score, addresses: data[score].map((d) => d.address) });
    } else {
      setScoreSupporters(DEFAULT_SCORE_SUPPORTERS);
    }
  };

  return (
    <ChartWrapper>
      <Chart
        ref={chartRef}
        type="bar"
        datasetIdKey="id"
        options={{
          responsive: true,
          color: color.yellow,
          scales: {
            y: {
              ticks: {
                stepSize: 1,
              },
              grid: {
                display: true,
                color: color.yellow10,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        }}
        data={{
          labels: ["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"],
          datasets: [
            {
              label: "",
              data: datasets,
              backgroundColor: color.yellow80,
              borderColor: color.yellow,
              borderWidth: 2,
              hoverBorderColor: color.yellow,
            },
          ],
        }}
        onClick={handleClick}
      />
    </ChartWrapper>
  );
};

const ChartWrapper = styled.div`
  width: 99%;
`;

export default VoteHistoryChart;
