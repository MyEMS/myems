import React from 'react';
import loadable from '@loadable/component';

import { Redirect, Route, Switch } from 'react-router-dom';

const loadingFallback = <div className="loading">Loading...</div>;

const SpaceEnergyCategory = loadable(() => import('../components/MyEMS/Space/SpaceEnergyCategory'), { fallback: loadingFallback });
const SpaceEnergyItem = loadable(() => import('../components/MyEMS/Space/SpaceEnergyItem'), { fallback: loadingFallback });
const SpaceCarbon = loadable(() => import('../components/MyEMS/Space/SpaceCarbon'), { fallback: loadingFallback });
const SpaceCost = loadable(() => import('../components/MyEMS/Space/SpaceCost'), { fallback: loadingFallback });
const SpaceOutput = loadable(() => import('../components/MyEMS/Space/SpaceOutput'), { fallback: loadingFallback });
const SpaceIncome = loadable(() => import('../components/MyEMS/Space/SpaceIncome'), { fallback: loadingFallback });
const SpaceEfficiency = loadable(() => import('../components/MyEMS/Space/SpaceEfficiency'), { fallback: loadingFallback });
const SpaceLoad = loadable(() => import('../components/MyEMS/Space/SpaceLoad'), { fallback: loadingFallback });
const SpaceStatistics = loadable(() => import('../components/MyEMS/Space/SpaceStatistics'), { fallback: loadingFallback });
const SpaceSaving = loadable(() => import('../components/MyEMS/Space/SpaceSaving'), { fallback: loadingFallback });
const SpacePlan = loadable(() => import('../components/MyEMS/Space/SpacePlan'), { fallback: loadingFallback });
const SpacePrediction = loadable(() => import('../components/MyEMS/Space/SpacePrediction'), { fallback: loadingFallback });
const SpaceEnvironmentMonitor = loadable(() => import('../components/MyEMS/Space/SpaceEnvironmentMonitor'), { fallback: loadingFallback });
const EnterProduction = loadable(() => import('../components/MyEMS/Space/EnterProduction'), { fallback: loadingFallback });
const SpaceProduction = loadable(() => import('../components/MyEMS/Space/SpaceProduction'), { fallback: loadingFallback });
const SpaceComparison = loadable(() => import('../components/MyEMS/Space/SpaceComparison'), { fallback: loadingFallback });

const EquipmentDashboard = loadable(() => import('../components/MyEMS/Equipment/Dashboard'), { fallback: loadingFallback });
const EquipmentBatch = loadable(() => import('../components/MyEMS/Equipment/EquipmentBatch'), { fallback: loadingFallback });
const EquipmentCarbon = loadable(() => import('../components/MyEMS/Equipment/EquipmentCarbon'), { fallback: loadingFallback });
const EquipmentCost = loadable(() => import('../components/MyEMS/Equipment/EquipmentCost'), { fallback: loadingFallback });
const EquipmentEfficiency = loadable(() => import('../components/MyEMS/Equipment/EquipmentEfficiency'), { fallback: loadingFallback });
const EquipmentEnergyCategory = loadable(() => import('../components/MyEMS/Equipment/EquipmentEnergyCategory'), { fallback: loadingFallback });
const EquipmentEnergyItem = loadable(() => import('../components/MyEMS/Equipment/EquipmentEnergyItem'), { fallback: loadingFallback });
const EquipmentIncome = loadable(() => import('../components/MyEMS/Equipment/EquipmentIncome'), { fallback: loadingFallback });
const EquipmentLoad = loadable(() => import('../components/MyEMS/Equipment/EquipmentLoad'), { fallback: loadingFallback });
const EquipmentOutput = loadable(() => import('../components/MyEMS/Equipment/EquipmentOutput'), { fallback: loadingFallback });
const EquipmentSaving = loadable(() => import('../components/MyEMS/Equipment/EquipmentSaving'), { fallback: loadingFallback });
const EquipmentPlan = loadable(() => import('../components/MyEMS/Equipment/EquipmentPlan'), { fallback: loadingFallback });
const EquipmentPrediction = loadable(() => import('../components/MyEMS/Equipment/EquipmentPrediction'), { fallback: loadingFallback });
const EquipmentStatistics = loadable(() => import('../components/MyEMS/Equipment/EquipmentStatistics'), { fallback: loadingFallback });
const EquipmentTracking = loadable(() => import('../components/MyEMS/Equipment/EquipmentTracking'), { fallback: loadingFallback });
const EquipmentComparison = loadable(() => import('../components/MyEMS/Equipment/EquipmentComparison'), { fallback: loadingFallback });

const MeterBatch = loadable(() => import('../components/MyEMS/Meter/MeterBatch'), { fallback: loadingFallback });
const MeterCarbon = loadable(() => import('../components/MyEMS/Meter/MeterCarbon'), { fallback: loadingFallback });
const MeterComparison = loadable(() => import('../components/MyEMS/Meter/MeterComparison'), { fallback: loadingFallback });
const MeterCost = loadable(() => import('../components/MyEMS/Meter/MeterCost'), { fallback: loadingFallback });
const MeterEnergy = loadable(() => import('../components/MyEMS/Meter/MeterEnergy'), { fallback: loadingFallback });
const MeterPrediction = loadable(() => import('../components/MyEMS/Meter/MeterPrediction'), { fallback: loadingFallback });
const MeterRealtime = loadable(() => import('../components/MyEMS/Meter/MeterRealtime'), { fallback: loadingFallback });
const MeterSaving = loadable(() => import('../components/MyEMS/Meter/MeterSaving'), { fallback: loadingFallback });
const MeterPlan = loadable(() => import('../components/MyEMS/Meter/MeterPlan'), { fallback: loadingFallback });
const MeterSubmetersBalance = loadable(() => import('../components/MyEMS/Meter/MeterSubmetersBalance'), { fallback: loadingFallback });
const MeterTracking = loadable(() => import('../components/MyEMS/Meter/MeterTracking'), { fallback: loadingFallback });
const MeterTrend = loadable(() => import('../components/MyEMS/Meter/MeterTrend'), { fallback: loadingFallback });
const PowerQuality = loadable(() => import('../components/MyEMS/Meter/PowerQuality'), { fallback: loadingFallback });
const OfflineMeterBatch = loadable(() => import('../components/MyEMS/Meter/OfflineMeterBatch'), { fallback: loadingFallback });
const OfflineMeterCarbon = loadable(() => import('../components/MyEMS/Meter/OfflineMeterCarbon'), { fallback: loadingFallback });
const OfflineMeterCost = loadable(() => import('../components/MyEMS/Meter/OfflineMeterCost'), { fallback: loadingFallback });
const OfflineMeterEnergy = loadable(() => import('../components/MyEMS/Meter/OfflineMeterEnergy'), { fallback: loadingFallback });
const OfflineMeterPrediction = loadable(() => import('../components/MyEMS/Meter/OfflineMeterPrediction'), { fallback: loadingFallback });
const OfflineMeterSaving = loadable(() => import('../components/MyEMS/Meter/OfflineMeterSaving'), { fallback: loadingFallback });
const OfflineMeterPlan = loadable(() => import('../components/MyEMS/Meter/OfflineMeterPlan'), { fallback: loadingFallback });
const OfflineMeterInput = loadable(() => import('../components/MyEMS/Meter/OfflineMeterInput'), { fallback: loadingFallback });
const VirtualMeterBatch = loadable(() => import('../components/MyEMS/Meter/VirtualMeterBatch'), { fallback: loadingFallback });
const VirtualMeterCarbon = loadable(() => import('../components/MyEMS/Meter/VirtualMeterCarbon'), { fallback: loadingFallback });
const VirtualMeterCost = loadable(() => import('../components/MyEMS/Meter/VirtualMeterCost'), { fallback: loadingFallback });
const VirtualMeterEnergy = loadable(() => import('../components/MyEMS/Meter/VirtualMeterEnergy'), { fallback: loadingFallback });
const VirtualMeterPrediction = loadable(() => import('../components/MyEMS/Meter/VirtualMeterPrediction'), { fallback: loadingFallback });
const VirtualMeterSaving = loadable(() => import('../components/MyEMS/Meter/VirtualMeterSaving'), { fallback: loadingFallback });
const VirtualMeterPlan = loadable(() => import('../components/MyEMS/Meter/VirtualMeterPlan'), { fallback: loadingFallback });
const VirtualMeterComparison = loadable(() => import('../components/MyEMS/Meter/VirtualMeterComparison'), { fallback: loadingFallback });

const TenantDashboard = loadable(() => import('../components/MyEMS/Tenant/Dashboard'), { fallback: loadingFallback });
const TenantEnergyCategory = loadable(() => import('../components/MyEMS/Tenant/TenantEnergyCategory'), { fallback: loadingFallback });
const TenantPrediction = loadable(() => import('../components/MyEMS/Tenant/TenantPrediction'), { fallback: loadingFallback });
const TenantEnergyItem = loadable(() => import('../components/MyEMS/Tenant/TenantEnergyItem'), { fallback: loadingFallback });
const TenantCarbon = loadable(() => import('../components/MyEMS/Tenant/TenantCarbon'), { fallback: loadingFallback });
const TenantCost = loadable(() => import('../components/MyEMS/Tenant/TenantCost'), { fallback: loadingFallback });
const TenantLoad = loadable(() => import('../components/MyEMS/Tenant/TenantLoad'), { fallback: loadingFallback });
const TenantStatistics = loadable(() => import('../components/MyEMS/Tenant/TenantStatistics'), { fallback: loadingFallback });
const TenantSaving = loadable(() => import('../components/MyEMS/Tenant/TenantSaving'), { fallback: loadingFallback });
const TenantPlan = loadable(() => import('../components/MyEMS/Tenant/TenantPlan'), { fallback: loadingFallback });
const TenantBill = loadable(() => import('../components/MyEMS/Tenant/TenantBill'), { fallback: loadingFallback });
const TenantBatch = loadable(() => import('../components/MyEMS/Tenant/TenantBatch'), { fallback: loadingFallback });
const TenantComparison = loadable(() => import('../components/MyEMS/Tenant/TenantComparison'), { fallback: loadingFallback });

const StoreEnergyCategory = loadable(() => import('../components/MyEMS/Store/StoreEnergyCategory'), { fallback: loadingFallback });
const StorePrediction = loadable(() => import('../components/MyEMS/Store/StorePrediction'), { fallback: loadingFallback });
const StoreEnergyItem = loadable(() => import('../components/MyEMS/Store/StoreEnergyItem'), { fallback: loadingFallback });
const StoreCarbon = loadable(() => import('../components/MyEMS/Store/StoreCarbon'), { fallback: loadingFallback });
const StoreCost = loadable(() => import('../components/MyEMS/Store/StoreCost'), { fallback: loadingFallback });
const StoreLoad = loadable(() => import('../components/MyEMS/Store/StoreLoad'), { fallback: loadingFallback });
const StoreStatistics = loadable(() => import('../components/MyEMS/Store/StoreStatistics'), { fallback: loadingFallback });
const StoreSaving = loadable(() => import('../components/MyEMS/Store/StoreSaving'), { fallback: loadingFallback });
const StorePlan = loadable(() => import('../components/MyEMS/Store/StorePlan'), { fallback: loadingFallback });
const StoreBatch = loadable(() => import('../components/MyEMS/Store/StoreBatch'), { fallback: loadingFallback });
const StoreComparison = loadable(() => import('../components/MyEMS/Store/StoreComparison'), { fallback: loadingFallback });
const StoreDashboard = loadable(() => import('../components/MyEMS/Store/Dashboard'), { fallback: loadingFallback });

const ShopfloorDashboard = loadable(() => import('../components/MyEMS/Shopfloor/Dashboard'), { fallback: loadingFallback });
const ShopfloorEnergyCategory = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorEnergyCategory'), { fallback: loadingFallback });
const ShopfloorPrediction = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorPrediction'), { fallback: loadingFallback });
const ShopfloorEnergyItem = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorEnergyItem'), { fallback: loadingFallback });
const ShopfloorCarbon = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorCarbon'), { fallback: loadingFallback });
const ShopfloorCost = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorCost'), { fallback: loadingFallback });
const ShopfloorLoad = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorLoad'), { fallback: loadingFallback });
const ShopfloorStatistics = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorStatistics'), { fallback: loadingFallback });
const ShopfloorSaving = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorSaving'), { fallback: loadingFallback });
const ShopfloorPlan = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorPlan'), { fallback: loadingFallback });
const ShopfloorBatch = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorBatch'), { fallback: loadingFallback });
const ShopfloorComparison = loadable(() => import('../components/MyEMS/Shopfloor/ShopfloorComparison'), { fallback: loadingFallback });

const CombinedEquipmentDashboard = loadable(() => import('../components/MyEMS/CombinedEquipment/Dashboard'), { fallback: loadingFallback });
const CombinedEquipmentBatch = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentBatch'), { fallback: loadingFallback });
const CombinedEquipmentCarbon = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentCarbon'), { fallback: loadingFallback });
const CombinedEquipmentCost = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentCost'), { fallback: loadingFallback });
const CombinedEquipmentEfficiency = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentEfficiency'), { fallback: loadingFallback });
const CombinedEquipmentEnergyCategory = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentEnergyCategory'), { fallback: loadingFallback });
const CombinedEquipmentPrediction = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentPrediction'), { fallback: loadingFallback });
const CombinedEquipmentEnergyItem = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentEnergyItem'), { fallback: loadingFallback });
const CombinedEquipmentLoad = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentLoad'), { fallback: loadingFallback });
const CombinedEquipmentIncome = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentIncome'), { fallback: loadingFallback });
const CombinedEquipmentOutput = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentOutput'), { fallback: loadingFallback });
const CombinedEquipmentSaving = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentSaving'), { fallback: loadingFallback });
const CombinedEquipmentPlan = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentPlan'), { fallback: loadingFallback });
const CombinedEquipmentStatistics = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentStatistics'), { fallback: loadingFallback });
const CombinedEquipmentComparison = loadable(() => import('../components/MyEMS/CombinedEquipment/CombinedEquipmentComparison'), { fallback: loadingFallback });

const EnergyFlowDiagram = loadable(() => import('../components/MyEMS/AuxiliarySystem/EnergyFlowDiagram'), { fallback: loadingFallback });
const DistributionSystem = loadable(() => import('../components/MyEMS/AuxiliarySystem/DistributionSystem'), { fallback: loadingFallback });

const KnowledgeBase = loadable(() => import('../components/MyEMS/KnowledgeBase/KnowledgeBase'), { fallback: loadingFallback });

const Notification = loadable(() => import('../components/MyEMS/Notification/Notification'), { fallback: loadingFallback });

const FDDFault = loadable(() => import('../components/MyEMS/FDD/Fault'), { fallback: loadingFallback });

const SpaceEquipments = loadable(() => import('../components/MyEMS/Monitoring/SpaceEquipments'), { fallback: loadingFallback });
const CombinedEquipments = loadable(() => import('../components/MyEMS/Monitoring/CombinedEquipments'), { fallback: loadingFallback });

const AdvancedReporting = loadable(() => import('../components/MyEMS/AdvancedReporting/AdvancedReporting'), { fallback: loadingFallback });

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
        <Route path="/space/comparison" exact component={SpaceComparison} />

        {/*Equipment*/}
        <Route path="/equipment" exact component={EquipmentDashboard} />
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
        <Route path="/equipment/prediction" exact component={EquipmentPrediction} />
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
        <Route path="/meter/meterprediction" exact component={MeterPrediction} />
        <Route path="/meter/metersubmetersbalance" exact component={MeterSubmetersBalance} />
        <Route path="/meter/meterbatch" exact component={MeterBatch} />
        <Route path="/meter/metertracking" exact component={MeterTracking} />
        <Route path="/meter/powerquality" exact component={PowerQuality} />
        <Route path="/meter/virtualmetersaving" exact component={VirtualMeterSaving} />
        <Route path="/meter/virtualmeterplan" exact component={VirtualMeterPlan} />
        <Route path="/meter/virtualmeterprediction" exact component={VirtualMeterPrediction} />
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
        <Route path="/meter/offlinemeterprediction" exact component={OfflineMeterPrediction} />
        <Route path="/meter/offlinemeterinput" exact component={OfflineMeterInput} />

        {/*Tenant*/}
        <Route path="/tenant" exact component={TenantDashboard} />
        <Route path="/tenant/energycategory" exact component={TenantEnergyCategory} />
        <Route path="/tenant/prediction" exact component={TenantPrediction} />
        <Route path="/tenant/energyitem" exact component={TenantEnergyItem} />
        <Route path="/tenant/carbon" exact component={TenantCarbon} />
        <Route path="/tenant/cost" exact component={TenantCost} />
        <Route path="/tenant/load" exact component={TenantLoad} />
        <Route path="/tenant/statistics" exact component={TenantStatistics} />
        <Route path="/tenant/saving" exact component={TenantSaving} />
        <Route path="/tenant/plan" exact component={TenantPlan} />
        <Route path="/tenant/bill" exact component={TenantBill} />
        <Route path="/tenant/batch" exact component={TenantBatch} />
        <Route path="/tenant/comparison" exact component={TenantComparison} />

        {/*Store*/}
        <Route path="/store" exact component={StoreDashboard} />
        <Route path="/store/energycategory" exact component={StoreEnergyCategory} />
        <Route path="/store/prediction" exact component={StorePrediction} />
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
        <Route path="/shopfloor" exact component={ShopfloorDashboard} />
        <Route path="/shopfloor/energycategory" exact component={ShopfloorEnergyCategory} />
        <Route path="/shopfloor/prediction" exact component={ShopfloorPrediction} />
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
        <Route path="/combinedequipment" exact component={CombinedEquipmentDashboard} />
        <Route path="/combinedequipment/batch" exact component={CombinedEquipmentBatch} />
        <Route path="/combinedequipment/carbon" exact component={CombinedEquipmentCarbon} />
        <Route path="/combinedequipment/cost" exact component={CombinedEquipmentCost} />
        <Route path="/combinedequipment/efficiency" exact component={CombinedEquipmentEfficiency} />
        <Route path="/combinedequipment/energycategory" exact component={CombinedEquipmentEnergyCategory} />
        <Route path="/combinedequipment/prediction" exact component={CombinedEquipmentPrediction} />
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