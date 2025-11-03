import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

// Space
import SpaceEnergyCategory from '../components/MyEMS/Space/SpaceEnergyCategory';
import SpaceEnergyItem from '../components/MyEMS/Space/SpaceEnergyItem';
import SpaceCarbon from '../components/MyEMS/Space/SpaceCarbon';
import SpaceCost from '../components/MyEMS/Space/SpaceCost';
import SpaceOutput from '../components/MyEMS/Space/SpaceOutput';
import SpaceIncome from '../components/MyEMS/Space/SpaceIncome';
import SpaceEfficiency from '../components/MyEMS/Space/SpaceEfficiency';
import SpaceLoad from '../components/MyEMS/Space/SpaceLoad';
import SpaceStatistics from '../components/MyEMS/Space/SpaceStatistics';
import SpaceSaving from '../components/MyEMS/Space/SpaceSaving';
import SpacePlan from '../components/MyEMS/Space/SpacePlan';
import SpacePrediction from '../components/MyEMS/Space/SpacePrediction';
import SpaceEnvironmentMonitor from '../components/MyEMS/Space/SpaceEnvironmentMonitor';
import EnterProduction from '../components/MyEMS/Space/EnterProduction';
import SpaceProduction from '../components/MyEMS/Space/SpaceProduction';

// Equipment
import EquipmentBatch from '../components/MyEMS/Equipment/EquipmentBatch';
import EquipmentCarbon from '../components/MyEMS/Equipment/EquipmentCarbon';
import EquipmentCost from '../components/MyEMS/Equipment/EquipmentCost';
import EquipmentEfficiency from '../components/MyEMS/Equipment/EquipmentEfficiency';
import EquipmentEnergyCategory from '../components/MyEMS/Equipment/EquipmentEnergyCategory';
import EquipmentEnergyItem from '../components/MyEMS/Equipment/EquipmentEnergyItem';
import EquipmentIncome from '../components/MyEMS/Equipment/EquipmentIncome';
import EquipmentLoad from '../components/MyEMS/Equipment/EquipmentLoad';
import EquipmentOutput from '../components/MyEMS/Equipment/EquipmentOutput';
import EquipmentSaving from '../components/MyEMS/Equipment/EquipmentSaving';
import EquipmentPlan from '../components/MyEMS/Equipment/EquipmentPlan';
import EquipmentStatistics from '../components/MyEMS/Equipment/EquipmentStatistics';
import EquipmentTracking from '../components/MyEMS/Equipment/EquipmentTracking';
import EquipmentComparison from '../components/MyEMS/Equipment/EquipmentComparison';
// Meter
import MeterBatch from '../components/MyEMS/Meter/MeterBatch';
import MeterCarbon from '../components/MyEMS/Meter/MeterCarbon';
import MeterComparison from '../components/MyEMS/Meter/MeterComparison';
import MeterCost from '../components/MyEMS/Meter/MeterCost';
import MeterEnergy from '../components/MyEMS/Meter/MeterEnergy';
import MeterRealtime from '../components/MyEMS/Meter/MeterRealtime';
import MeterSaving from '../components/MyEMS/Meter/MeterSaving';
import MeterPlan from '../components/MyEMS/Meter/MeterPlan';
import MeterSubmetersBalance from '../components/MyEMS/Meter/MeterSubmetersBalance';
import MeterTracking from '../components/MyEMS/Meter/MeterTracking';
import MeterTrend from '../components/MyEMS/Meter/MeterTrend';
import PowerQuality from '../components/MyEMS/Meter/PowerQuality';
import OfflineMeterBatch from '../components/MyEMS/Meter/OfflineMeterBatch';
import OfflineMeterCarbon from '../components/MyEMS/Meter/OfflineMeterCarbon';
import OfflineMeterCost from '../components/MyEMS/Meter/OfflineMeterCost';
import OfflineMeterEnergy from '../components/MyEMS/Meter/OfflineMeterEnergy';
import OfflineMeterSaving from '../components/MyEMS/Meter/OfflineMeterSaving';
import OfflineMeterPlan from '../components/MyEMS/Meter/OfflineMeterPlan';
import OfflineMeterInput from '../components/MyEMS/Meter/OfflineMeterInput';
import VirtualMeterBatch from '../components/MyEMS/Meter/VirtualMeterBatch';
import VirtualMeterCarbon from '../components/MyEMS/Meter/VirtualMeterCarbon';
import VirtualMeterCost from '../components/MyEMS/Meter/VirtualMeterCost';
import VirtualMeterEnergy from '../components/MyEMS/Meter/VirtualMeterEnergy';
import VirtualMeterSaving from '../components/MyEMS/Meter/VirtualMeterSaving';
import VirtualMeterPlan from '../components/MyEMS/Meter/VirtualMeterPlan';
import VirtualMeterComparison from '../components/MyEMS/Meter/VirtualMeterComparison';
// Tenant
import TenantEnergyCategory from '../components/MyEMS/Tenant/TenantEnergyCategory';
import TenantEnergyItem from '../components/MyEMS/Tenant/TenantEnergyItem';
import TenantCarbon from '../components/MyEMS/Tenant/TenantCarbon';
import TenantCost from '../components/MyEMS/Tenant/TenantCost';
import TenantLoad from '../components/MyEMS/Tenant/TenantLoad';
import TenantStatistics from '../components/MyEMS/Tenant/TenantStatistics';
import TenantSaving from '../components/MyEMS/Tenant/TenantSaving';
import TenantPlan from '../components/MyEMS/Tenant/TenantPlan';
import TenantBill from '../components/MyEMS/Tenant/TenantBill';
import TenantBatch from '../components/MyEMS/Tenant/TenantBatch';
// Store
import StoreEnergyCategory from '../components/MyEMS/Store/StoreEnergyCategory';
import StoreEnergyItem from '../components/MyEMS/Store/StoreEnergyItem';
import StoreCarbon from '../components/MyEMS/Store/StoreCarbon';
import StoreCost from '../components/MyEMS/Store/StoreCost';
import StoreLoad from '../components/MyEMS/Store/StoreLoad';
import StoreStatistics from '../components/MyEMS/Store/StoreStatistics';
import StoreSaving from '../components/MyEMS/Store/StoreSaving';
import StorePlan from '../components/MyEMS/Store/StorePlan';
import StoreBatch from '../components/MyEMS/Store/StoreBatch';
import StoreComparison from '../components/MyEMS/Store/StoreComparison';
// Shopfloor
import ShopfloorEnergyCategory from '../components/MyEMS/Shopfloor/ShopfloorEnergyCategory';
import ShopfloorEnergyItem from '../components/MyEMS/Shopfloor/ShopfloorEnergyItem';
import ShopfloorCarbon from '../components/MyEMS/Shopfloor/ShopfloorCarbon';
import ShopfloorCost from '../components/MyEMS/Shopfloor/ShopfloorCost';
import ShopfloorLoad from '../components/MyEMS/Shopfloor/ShopfloorLoad';
import ShopfloorStatistics from '../components/MyEMS/Shopfloor/ShopfloorStatistics';
import ShopfloorSaving from '../components/MyEMS/Shopfloor/ShopfloorSaving';
import ShopfloorPlan from '../components/MyEMS/Shopfloor/ShopfloorPlan';
import ShopfloorBatch from '../components/MyEMS/Shopfloor/ShopfloorBatch';
import ShopfloorComparison from '../components/MyEMS/Shopfloor/ShopfloorComparison';
// CombinedEquipment
import CombinedEquipmentBatch from '../components/MyEMS/CombinedEquipment/CombinedEquipmentBatch';
import CombinedEquipmentCarbon from '../components/MyEMS/CombinedEquipment/CombinedEquipmentCarbon';
import CombinedEquipmentCost from '../components/MyEMS/CombinedEquipment/CombinedEquipmentCost';
import CombinedEquipmentEfficiency from '../components/MyEMS/CombinedEquipment/CombinedEquipmentEfficiency';
import CombinedEquipmentEnergyCategory from '../components/MyEMS/CombinedEquipment/CombinedEquipmentEnergyCategory';
import CombinedEquipmentEnergyItem from '../components/MyEMS/CombinedEquipment/CombinedEquipmentEnergyItem';
import CombinedEquipmentLoad from '../components/MyEMS/CombinedEquipment/CombinedEquipmentLoad';
import CombinedEquipmentIncome from '../components/MyEMS/CombinedEquipment/CombinedEquipmentIncome';
import CombinedEquipmentOutput from '../components/MyEMS/CombinedEquipment/CombinedEquipmentOutput';
import CombinedEquipmentSaving from '../components/MyEMS/CombinedEquipment/CombinedEquipmentSaving';
import CombinedEquipmentPlan from '../components/MyEMS/CombinedEquipment/CombinedEquipmentPlan';
import CombinedEquipmentStatistics from '../components/MyEMS/CombinedEquipment/CombinedEquipmentStatistics';
import CombinedEquipmentComparison from '../components/MyEMS/CombinedEquipment/CombinedEquipmentComparison';
// Auxiliary System
import EnergyFlowDiagram from '../components/MyEMS/AuxiliarySystem/EnergyFlowDiagram';
import DistributionSystem from '../components/MyEMS/AuxiliarySystem/DistributionSystem';
// Knowledge Base
import KnowledgeBase from '../components/MyEMS/KnowledgeBase/KnowledgeBase';
// Notification
import Notification from '../components/MyEMS/Notification/Notification';
// FDD
import FDDFault from '../components/MyEMS/FDD/Fault';
// Monitoring
import SpaceEquipments from '../components/MyEMS/Monitoring/SpaceEquipments';
import CombinedEquipments from '../components/MyEMS/Monitoring/CombinedEquipments';
// Advanced Reporting
import AdvancedReporting from '../components/MyEMS/AdvancedReporting/AdvancedReporting';


const MyEMSRoutes = () => (
  <Switch>
    {/*Space*/}
    <Route path="/space/energycategory" exact component={SpaceEnergyCategory} />
    <Route path="/space/energyitem" exact component={SpaceEnergyItem} />
    <Route path="/space/carbon" exact component={SpaceCarbon} />
    <Route path="/space/cost" exact component={SpaceCost} />
    <Route path="/space/output" exact component={SpaceOutput} />
    <Route path="/space/income" exact component={SpaceIncome} />
    <Route path="/space/efficiency" exact component={SpaceEfficiency} />
    <Route path="/space/load" exact component={SpaceLoad} />
    <Route path="/space/statistics" exact component={SpaceStatistics} />
    <Route path="/space/saving" exact component={SpaceSaving} />
    <Route path="/space/plan" exact component={SpacePlan} />
    <Route path="/space/prediction" exact component={SpacePrediction} />
    <Route path="/space/environmentmonitor" exact component={SpaceEnvironmentMonitor} />
    <Route path="/space/enterproduction" exact component={EnterProduction} />
    <Route path="/space/production" exact component={SpaceProduction} />

    {/*Equipment*/}
    <Route path="/equipment/batch" exact component={EquipmentBatch} />
    <Route path="/equipment/carbon" exact component={EquipmentCarbon} />
    <Route path="/equipment/cost" exact component={EquipmentCost} />
    <Route path="/equipment/efficiency" exact component={EquipmentEfficiency} />
    <Route path="/equipment/energycategory" exact component={EquipmentEnergyCategory} />
    <Route path="/equipment/energyitem" exact component={EquipmentEnergyItem} />
    <Route path="/equipment/income" exact component={EquipmentIncome} />
    <Route path="/equipment/load" exact component={EquipmentLoad} />
    <Route path="/equipment/output" exact component={EquipmentOutput} />
    <Route path="/equipment/saving" exact component={EquipmentSaving} />
    <Route path="/equipment/plan" exact component={EquipmentPlan} />
    <Route path="/equipment/statistics" exact component={EquipmentStatistics} />
    <Route path="/equipment/tracking" exact component={EquipmentTracking} />
    <Route path="/equipment/comparison" exact component={EquipmentComparison} />

    {/*Meter*/}
    <Route path="/meter/meterenergy" exact component={MeterEnergy} />
    <Route path="/meter/metercarbon" exact component={MeterCarbon} />
    <Route path="/meter/metercomparison" exact component={MeterComparison} />
    <Route path="/meter/metercost" exact component={MeterCost} />
    <Route path="/meter/metertrend" exact component={MeterTrend} />
    <Route path="/meter/meterrealtime" exact component={MeterRealtime} />
    <Route path="/meter/metersaving" exact component={MeterSaving} />
    <Route path="/meter/meterplan" exact component={MeterPlan} />
    <Route path="/meter/metersubmetersbalance" exact component={MeterSubmetersBalance} />
    <Route path="/meter/meterbatch" exact component={MeterBatch} />
    <Route path="/meter/metertracking" exact component={MeterTracking} />
    <Route path="/meter/powerquality" exact component={PowerQuality} />
    <Route path="/meter/virtualmetersaving" exact component={VirtualMeterSaving} />
    <Route path="/meter/virtualmeterplan" exact component={VirtualMeterPlan} />
    <Route path="/meter/virtualmeterenergy" exact component={VirtualMeterEnergy} />
    <Route path="/meter/virtualmetercarbon" exact component={VirtualMeterCarbon} />
    <Route path="/meter/virtualmetercost" exact component={VirtualMeterCost} />
    <Route path="/meter/virtualmeterbatch" exact component={VirtualMeterBatch} />
    <Route path="/meter/virtualmetercomparison" exact component={VirtualMeterComparison} />
    <Route path="/meter/offlinemeterenergy" exact component={OfflineMeterEnergy} />
    <Route path="/meter/offlinemetercarbon" exact component={OfflineMeterCarbon} />
    <Route path="/meter/offlinemetercost" exact component={OfflineMeterCost} />
    <Route path="/meter/offlinemeterbatch" exact component={OfflineMeterBatch} />
    <Route path="/meter/offlinemetersaving" exact component={OfflineMeterSaving} />
    <Route path="/meter/offlinemeterplan" exact component={OfflineMeterPlan} />
    <Route path="/meter/offlinemeterinput" exact component={OfflineMeterInput} />

    {/*Tenant*/}
    <Route path="/tenant/energycategory" exact component={TenantEnergyCategory} />
    <Route path="/tenant/energyitem" exact component={TenantEnergyItem} />
    <Route path="/tenant/carbon" exact component={TenantCarbon} />
    <Route path="/tenant/cost" exact component={TenantCost} />
    <Route path="/tenant/load" exact component={TenantLoad} />
    <Route path="/tenant/statistics" exact component={TenantStatistics} />
    <Route path="/tenant/saving" exact component={TenantSaving} />
    <Route path="/tenant/plan" exact component={TenantPlan} />
    <Route path="/tenant/bill" exact component={TenantBill} />
    <Route path="/tenant/batch" exact component={TenantBatch} />

    {/*Sotore*/}
    <Route path="/store/energycategory" exact component={StoreEnergyCategory} />
    <Route path="/store/energyitem" exact component={StoreEnergyItem} />
    <Route path="/store/carbon" exact component={StoreCarbon} />
    <Route path="/store/cost" exact component={StoreCost} />
    <Route path="/store/load" exact component={StoreLoad} />
    <Route path="/store/statistics" exact component={StoreStatistics} />
    <Route path="/store/saving" exact component={StoreSaving} />
    <Route path="/store/plan" exact component={StorePlan} />
    <Route path="/store/batch" exact component={StoreBatch} />
    <Route path="/store/comparison" exact component={StoreComparison} />


    {/*Shopfloor*/}
    <Route path="/shopfloor/energycategory" exact component={ShopfloorEnergyCategory} />
    <Route path="/shopfloor/energyitem" exact component={ShopfloorEnergyItem} />
    <Route path="/shopfloor/carbon" exact component={ShopfloorCarbon} />
    <Route path="/shopfloor/cost" exact component={ShopfloorCost} />
    <Route path="/shopfloor/load" exact component={ShopfloorLoad} />
    <Route path="/shopfloor/statistics" exact component={ShopfloorStatistics} />
    <Route path="/shopfloor/saving" exact component={ShopfloorSaving} />
    <Route path="/shopfloor/plan" exact component={ShopfloorPlan} />
    <Route path="/shopfloor/batch" exact component={ShopfloorBatch} />
    <Route path="/shopfloor/comparison" exact component={ShopfloorComparison} />

    {/*CombinedEquipment*/}
    <Route path="/combinedequipment/batch" exact component={CombinedEquipmentBatch} />
    <Route path="/combinedequipment/carbon" exact component={CombinedEquipmentCarbon} />
    <Route path="/combinedequipment/cost" exact component={CombinedEquipmentCost} />
    <Route path="/combinedequipment/efficiency" exact component={CombinedEquipmentEfficiency} />
    <Route path="/combinedequipment/energycategory" exact component={CombinedEquipmentEnergyCategory} />
    <Route path="/combinedequipment/energyitem" exact component={CombinedEquipmentEnergyItem} />
    <Route path="/combinedequipment/income" exact component={CombinedEquipmentIncome} />
    <Route path="/combinedequipment/load" exact component={CombinedEquipmentLoad} />
    <Route path="/combinedequipment/output" exact component={CombinedEquipmentOutput} />
    <Route path="/combinedequipment/saving" exact component={CombinedEquipmentSaving} />
    <Route path="/combinedequipment/plan" exact component={CombinedEquipmentPlan} />
    <Route path="/combinedequipment/statistics" exact component={CombinedEquipmentStatistics} />
    <Route path="/combinedequipment/comparison" exact component={CombinedEquipmentComparison} />

    {/*Auxiliary System*/}
    <Route path="/auxiliarysystem/energyflowdiagram" exact component={EnergyFlowDiagram} />
    <Route path="/auxiliarysystem/distributionsystem" exact component={DistributionSystem} />

    {/*Knowledge Base*/}
    <Route path="/knowledgebase" exact component={KnowledgeBase} />

    {/* Notification */}
    <Route path="/notification" exact component={Notification} />

    {/*FDD*/}
    <Route path="/fdd" exact component={FDDFault} />

    {/*Equipment Monitoring*/}
    <Route path="/monitoring/spaceequipments" exact component={SpaceEquipments} />
    <Route path="/monitoring/combinedequipments" exact component={CombinedEquipments} />

    {/*Advanced Reporting*/}
    <Route path="/advancedreporting" exact component={AdvancedReporting} />

    {/*Redirect*/}
    {/* MAKE SURE THIS IS THE LATEST ROUTE */}
    <Redirect to="/errors/404" />
  </Switch>
);

export default MyEMSRoutes;
