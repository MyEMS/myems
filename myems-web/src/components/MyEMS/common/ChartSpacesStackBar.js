import React, { useState, useContext, useEffect, useRef, Fragment } from 'react';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import FalconCardHeader from '../../common/FalconCardHeader';
import { Row, Col, Card, CardBody, CustomInput } from 'reactstrap';
import {withTranslation} from "react-i18next";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
} from 'chart.js';
import AppContext from '../../../context/Context';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LogarithmicScale
  );

const ChartSpacesStackBar = ({ labels, inputData, costData, title, childSpaces, t}) => {
    const colors = ['#2c7be5', '#00d27a', '#27bcfd', '#f5803e', '#e63757'];
    const [selectedLabel, setSelectedLabel] = useState('a0');
    const [option, setOption] = useState('a0');
    const { isDark } = useContext(AppContext);
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
      datasets: []
    });
  
    useEffect(() => {
        const chart = chartRef.current;
        let dataArray = [];
        let index = option.substring(1);
        if (chart) {
            const ctx = chart.ctx;
            const gradientFill = isDark
              ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
              : ctx.createLinearGradient(0, 0, 0, 250);
            gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
            gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');
            if (inputData['subtotals_array'] != undefined && inputData['subtotals_array'].length > 0) {
                let category = t('CATEGORY Consumption UNIT', {'CATEGORY': inputData['energy_category_names'][index], 'UNIT': inputData['units'][index]});
                let childSpaceArray = inputData['child_space_names_array'][index];
                inputData['subtotals_array'][index].forEach((item, itemIndex) => {
                    dataArray.push({
                        label:  childSpaceArray[itemIndex] + " " + category,
                        stack: category,
                        data: item,
                        backgroundColor: colors[itemIndex % 5],
                    })
                })
            }
            if (costData['subtotals_array'] != undefined && costData['subtotals_array'].length > 0) {
                let category = t('CATEGORY Costs UNIT', {'CATEGORY': costData['energy_category_names'][index], 'UNIT': costData['units'][index]});
                let childSpaceArray = costData['child_space_names_array'][index];
                costData['subtotals_array'][index].forEach((item, itemIndex) => {
                    dataArray.push({
                        label:  childSpaceArray[itemIndex] + " " + category,
                        stack: category,
                        data: item,
                        backgroundColor: colors[itemIndex % 5],
                    })
                })
            }
            setChartData({ 
                labels: labels,
                datasets: dataArray
            })
        }
    }, [labels, inputData, costData, option])
    const options = {
        scales: {
            x: {
                display: true,
                ticks: {
                    fontColor: rgbaColor('#fff', 0.8),
                    fontStyle: 600,
                    color: isDark ? themeColors.light : themeColors.dark
                },
                stacked: true,
            },
            y: {
                display: true,
                gridLines: {
                    color: rgbaColor('#000', 0.1)
                },
                ticks: {
                    color: isDark ? themeColors.light : themeColors.dark
                },
                stacked: true,
            },
        },
        plugins:{
            legend: {
                display: false,
            },
        },
        interaction: {
            intersect: false,
            mode: 'x',
        },
    };
    return (
        <Fragment>
            <Card className="mb-3">
            <FalconCardHeader title={title} className="bg-light">
            </FalconCardHeader>
            <CardBody className="rounded-soft">
                <Row className="text-white align-items-center no-gutters">
                <Col>
                    <h4 className="text-lightSlateGray mb-0"></h4>
                </Col>
                {isIterableArray(childSpaces) &&
                    <Col xs="auto" className="d-none d-sm-block">
                    <CustomInput
                        id="ddd"
                        type="select"
                        bsSize="sm"
                        className="mb-3 shadow"
                        value={option}
                        onChange={({ target }) => {setOption(target.value); setSelectedLabel(target.value);}}
                    >
                        {childSpaces.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </CustomInput>
                    </Col>
                }
                </Row>
                <Bar ref={chartRef} data={chartData} width={160} height={40}  options={options} />
            </CardBody>
            </Card>
        </Fragment>
    )
}

export default withTranslation()(ChartSpacesStackBar);