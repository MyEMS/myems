import falcon
from falcon_cors import CORS
from falcon_multipart.middleware import MultipartMiddleware
# for debugging this api on Linux or macOS
from wsgiref import simple_server

from core import advancedreport, apikey, command, controlmode, energyflowdiagram, \
    privilege, textmessage, distributioncircuit, virtualmeter, \
    costcenter, point, knowledgefile, meter, tariff, user, storetype, timezone, \
    costfile, offlinemeterfile, version, contact, emailserver, combinedequipment, datasource, equipment, tenant, \
    shopfloor, webmessage, distributionsystem, store, emailmessage, tenanttype, wechatmessage, space, gateway, \
    offlinemeter, rule, energycategory, sensor, energyitem, notification, menu, datarepairfile, workingcalendar, \
    microgrid,  virtualpowerplant, energystoragecontainer, energystoragepowerstation, photovoltaicpowerstation, \
    windfarm, energyplanfile, svg, protocol, ticket

from reports import advancedreportfile
from reports import combinedequipmentbatch
from reports import combinedequipmentcarbon
from reports import combinedequipmentcost
from reports import combinedequipmentefficiency
from reports import combinedequipmentenergycategory
from reports import combinedequipmentenergyitem
from reports import combinedequipmentincome
from reports import combinedequipmentload
from reports import combinedequipmentoutput
from reports import combinedequipmentplan
from reports import combinedequipmentsaving
from reports import combinedequipmentstatistics
from reports import dashboard
from reports import distributionsystem as distributionsystemreport
from reports import energyflowdiagram as energyflowdiagramreport
from reports import equipmentbatch
from reports import equipmentcarbon
from reports import equipmentcost
from reports import equipmentefficiency
from reports import equipmentenergycategory
from reports import equipmentenergyitem
from reports import equipmentincome
from reports import equipmentload
from reports import equipmentoutput
from reports import equipmentplan
from reports import equipmentsaving
from reports import equipmentstatistics
from reports import equipmenttracking
from reports import energystoragepowerstationdashboard
from reports import energystoragepowerstationitemdashboard
from reports import energystoragepowerstationdetails
from reports import energystoragepowerstationdetailsbms
from reports import energystoragepowerstationdetailscommand
from reports import energystoragepowerstationdetailsfirecontrol
from reports import energystoragepowerstationdetailshvac
from reports import energystoragepowerstationdetailsgrid
from reports import energystoragepowerstationdetailsload
from reports import energystoragepowerstationdetailsmeter
from reports import energystoragepowerstationdetailsdcdc
from reports import energystoragepowerstationdetailspcs
from reports import energystoragepowerstationdetailssts
from reports import energystoragepowerstationdetailsschedule
from reports import energystoragepowerstationlist
from reports import energystoragepowerstationreportingrevenue
from reports import energystoragepowerstationreportingenergy
from reports import energystoragepowerstationreportingparameters
from reports import energystoragepowerstationcollectionenergy
from reports import energystoragepowerstationitemenergy
from reports import energystoragepowerstationcollectionbilling
from reports import energystoragepowerstationitembilling
from reports import energystoragepowerstationcollectioncarbon
from reports import energystoragepowerstationitemcarbon
from reports import enterproduction
from reports import spaceproduction
from reports import fddfault
from reports import meterbatch
from reports import metercarbon
from reports import metercomparison
from reports import equipmentcomparison
from reports import metercost
from reports import meterenergy
from reports import meterrealtime
from reports import meterplan
from reports import metersaving
from reports import metersubmetersbalance
from reports import metertracking
from reports import metertrend
from reports import microgriddashboard
from reports import microgriddetails
from reports import microgriddetailsbms
from reports import microgriddetailsevcharger
from reports import microgriddetailsgenerator
from reports import microgriddetailsgrid
from reports import microgriddetailsheatpump
from reports import microgriddetailsload
from reports import microgriddetailspcs
from reports import microgriddetailspv
from reports import microgridlist
from reports import microgridreportingenergy
from reports import microgridsenergy
from reports import microgridsbilling
from reports import microgridscarbon
from reports import offlinemeterbatch
from reports import offlinemetercarbon
from reports import offlinemetercost
from reports import offlinemeterenergy
from reports import offlinemeterplan
from reports import offlinemetersaving
from reports import offlinemeterdaily
from reports import offlinemeterinput
from reports import photovoltaicpowerstationdashboard
from reports import photovoltaicpowerstationitemdashboard
from reports import photovoltaicpowerstationdetails
from reports import photovoltaicpowerstationdetailsmeter
from reports import photovoltaicpowerstationdetailsinvertor
from reports import photovoltaicpowerstationlist
from reports import photovoltaicpowerstationreportingrevenue
from reports import photovoltaicpowerstationreportingenergy
from reports import photovoltaicpowerstationreportingparameters
from reports import photovoltaicpowerstationcollectionenergy
from reports import photovoltaicpowerstationitemenergy
from reports import photovoltaicpowerstationcollectionbilling
from reports import photovoltaicpowerstationitembilling
from reports import photovoltaicpowerstationcollectioncarbon
from reports import photovoltaicpowerstationitemcarbon
from reports import shopfloorbatch
from reports import shopfloorcarbon
from reports import shopfloorcost
from reports import shopfloordashboard
from reports import shopfloorenergycategory
from reports import shopfloorenergyitem
from reports import shopfloorload
from reports import shopfloorplan
from reports import shopfloorsaving
from reports import shopfloorstatistics
from reports import spacecarbon
from reports import spacecost
from reports import spaceefficiency
from reports import spaceenergycategory
from reports import spaceenergyitem
from reports import spaceenvironmentmonitor
from reports import spaceincome
from reports import spaceload
from reports import spaceoutput
from reports import spacesaving
from reports import spaceplan
from reports import spaceprediction
from reports import spacestatistics
from reports import storebatch
from reports import storecarbon
from reports import storecost
from reports import storedashboard
from reports import storeenergycategory
from reports import storeenergyitem
from reports import storeload
from reports import storesaving
from reports import storeplan
from reports import storestatistics
from reports import pointrealtime
from reports import tenantbatch
from reports import tenantbill
from reports import tenantcarbon
from reports import tenantcost
from reports import tenantdashboard
from reports import tenantenergycategory
from reports import tenantenergyitem
from reports import tenantload
from reports import tenantsaving
from reports import tenantplan
from reports import tenantstatistics
from reports import virtualmeterbatch
from reports import virtualmetercarbon
from reports import virtualmetercost
from reports import virtualmeterenergy
from reports import virtualmetersaving
from reports import virtualmeterplan

########################################################################################################################
# BEGIN imports for Enterprise Version
########################################################################################################################

########################################################################################################################
# END imports for Enterprise Version
########################################################################################################################


# https://github.com/lwcolton/falcon-cors
# https://github.com/yohanboniface/falcon-multipart
cors = CORS(allow_all_origins=True,
            allow_credentials_all_origins=True,
            allow_all_headers=True,
            allow_all_methods=True)
api = falcon.App(middleware=[cors.middleware, MultipartMiddleware()])

########################################################################################################################
# Routes for System Core
########################################################################################################################
api.add_route('/advancedreports',
              advancedreport.AdvancedReportCollection())
api.add_route('/advancedreports/{id_}',
              advancedreport.AdvancedReportItem())
api.add_route('/advancedreports/{id_}/run',
              advancedreport.AdvancedReportRun())
api.add_route('/advancedreports/{id_}/export',
              advancedreport.AdvancedReportExport())
api.add_route('/advancedreports/import',
              advancedreport.AdvancedReportImport())
api.add_route('/advancedreports/{id_}/clone',
              advancedreport.AdvancedReportClone())

api.add_route('/combinedequipments',
              combinedequipment.CombinedEquipmentCollection())
api.add_route('/combinedequipments/{id_}',
              combinedequipment.CombinedEquipmentItem())
api.add_route('/combinedequipments/{id_}/equipments',
              combinedequipment.CombinedEquipmentEquipmentCollection())
api.add_route('/combinedequipments/{id_}/equipments/{eid}',
              combinedequipment.CombinedEquipmentEquipmentItem())
api.add_route('/combinedequipments/{id_}/meters',
              combinedequipment.CombinedEquipmentMeterCollection())
api.add_route('/combinedequipments/{id_}/meters/{mid}',
              combinedequipment.CombinedEquipmentMeterItem())
api.add_route('/combinedequipments/{id_}/offlinemeters',
              combinedequipment.CombinedEquipmentOfflineMeterCollection())
api.add_route('/combinedequipments/{id_}/offlinemeters/{mid}',
              combinedequipment.CombinedEquipmentOfflineMeterItem())
api.add_route('/combinedequipments/{id_}/parameters',
              combinedequipment.CombinedEquipmentParameterCollection())
api.add_route('/combinedequipments/{id_}/parameters/{pid}',
              combinedequipment.CombinedEquipmentParameterItem())
api.add_route('/combinedequipments/{id_}/virtualmeters',
              combinedequipment.CombinedEquipmentVirtualMeterCollection())
api.add_route('/combinedequipments/{id_}/virtualmeters/{mid}',
              combinedequipment.CombinedEquipmentVirtualMeterItem())
api.add_route('/combinedequipments/{id_}/commands',
              combinedequipment.CombinedEquipmentCommandCollection())
api.add_route('/combinedequipments/{id_}/commands/{cid}',
              combinedequipment.CombinedEquipmentCommandItem())
api.add_route('/combinedequipments/{id_}/export',
              combinedequipment.CombinedEquipmentExport())
api.add_route('/combinedequipments/import',
              combinedequipment.CombinedEquipmentImport())
api.add_route('/combinedequipments/{id_}/clone',
              combinedequipment.CombinedEquipmentClone())

api.add_route('/commands',
              command.CommandCollection())
api.add_route('/commands/{id_}',
              command.CommandItem())
api.add_route('/commands/{id_}/send',
              command.CommandSend())
api.add_route('/commands/{id_}/export',
              command.CommandExport())
api.add_route('/commands/import',
              command.CommandImport())
api.add_route('/commands/{id_}/clone',
              command.CommandClone())

api.add_route('/contacts',
              contact.ContactCollection())
api.add_route('/contacts/{id_}',
              contact.ContactItem())

api.add_route('/controlmodes',
              controlmode.ControlModeCollection())
api.add_route('/controlmodes/{id_}',
              controlmode.ControlModeItem())
api.add_route('/controlmodes/{id_}/export',
              controlmode.ControlModeExport())
api.add_route('/controlmodes/import',
              controlmode.ControlModeImport())
api.add_route('/controlmodes/{id_}/clone',
              controlmode.ControlModeClone())

api.add_route('/costcenters',
              costcenter.CostCenterCollection())
api.add_route('/costcenters/{id_}',
              costcenter.CostCenterItem())
api.add_route('/costcenters/{id_}/tariffs',
              costcenter.CostCenterTariffCollection())
api.add_route('/costcenters/{id_}/tariffs/{tid}',
              costcenter.CostCenterTariffItem())

api.add_route('/costfiles',
              costfile.CostFileCollection())
api.add_route('/costfiles/{id_}',
              costfile.CostFileItem())
api.add_route('/costfiles/{id_}/restore',
              costfile.CostFileRestore())

api.add_route('/datarepairfiles',
              datarepairfile.DataRepairFileCollection())
api.add_route('/datarepairfiles/{id_}',
              datarepairfile.DataRepairFileItem())
api.add_route('/datarepairfiles/{id_}/restore',
              datarepairfile.DataRepairFileRestore())

api.add_route('/datasources',
              datasource.DataSourceCollection())
api.add_route('/datasources/{id_}',
              datasource.DataSourceItem())
api.add_route('/datasources/{id_}/points',
              datasource.DataSourcePointCollection())
api.add_route('/datasources/{id_}/export',
              datasource.DataSourceExport())
api.add_route('/datasources/import',
              datasource.DataSourceImport())
api.add_route('/datasources/{id_}/clone',
              datasource.DataSourceClone())


api.add_route('/distributioncircuits',
              distributioncircuit.DistributionCircuitCollection())
api.add_route('/distributioncircuits/{id_}',
              distributioncircuit.DistributionCircuitItem())
api.add_route('/distributioncircuits/{id_}/points',
              distributioncircuit.DistributionCircuitPointCollection())
api.add_route('/distributioncircuits/{id_}/points/{pid}',
              distributioncircuit.DistributionCircuitPointItem())

api.add_route('/distributionsystems',
              distributionsystem.DistributionSystemCollection())
api.add_route('/distributionsystems/{id_}',
              distributionsystem.DistributionSystemItem())
api.add_route('/distributionsystems/{id_}/distributioncircuits',
              distributionsystem.DistributionSystemDistributionCircuitCollection())
api.add_route('/distributionsystems/{id_}/export',
              distributionsystem.DistributionSystemExport())
api.add_route('/distributionsystems/import',
              distributionsystem.DistributionSystemImport())
api.add_route('/distributionsystems/{id_}/clone',
              distributionsystem.DistributionSystemClone())

api.add_route('/emailmessages',
              emailmessage.EmailMessageCollection())
api.add_route('/emailmessages/{id_}',
              emailmessage.EmailMessageItem())

api.add_route('/emailservers',
              emailserver.EmailServerCollection())
api.add_route('/emailservers/{id_}',
              emailserver.EmailServerItem())

api.add_route('/energycategories',
              energycategory.EnergyCategoryCollection())
api.add_route('/energycategories/{id_}',
              energycategory.EnergyCategoryItem())

api.add_route('/energyflowdiagrams',
              energyflowdiagram.EnergyFlowDiagramCollection())
api.add_route('/energyflowdiagrams/{id_}',
              energyflowdiagram.EnergyFlowDiagramItem())
api.add_route('/energyflowdiagrams/{id_}/links',
              energyflowdiagram.EnergyFlowDiagramLinkCollection())
api.add_route('/energyflowdiagrams/{id_}/links/{lid}',
              energyflowdiagram.EnergyFlowDiagramLinkItem())
api.add_route('/energyflowdiagrams/{id_}/nodes',
              energyflowdiagram.EnergyFlowDiagramNodeCollection())
api.add_route('/energyflowdiagrams/{id_}/nodes/{nid}',
              energyflowdiagram.EnergyFlowDiagramNodeItem())
api.add_route('/energyflowdiagrams/{id_}/export',
              energyflowdiagram.EnergyFlowDiagramExport())
api.add_route('/energyflowdiagrams/import',
              energyflowdiagram.EnergyFlowDiagramImport())
api.add_route('/energyflowdiagrams/{id_}/clone',
              energyflowdiagram.EnergyFlowDiagramClone())

api.add_route('/energyitems',
              energyitem.EnergyItemCollection())
api.add_route('/energyitems/{id_}',
              energyitem.EnergyItemItem())

api.add_route('/energyplanfiles',
              energyplanfile.EnergyPlanFileCollection())
api.add_route('/energyplanfiles/{id_}',
              energyplanfile.EnergyPlanFileItem())
api.add_route('/energyplanfiles/{id_}/restore',
              energyplanfile.EnergyPlanFileRestore())

api.add_route('/energystoragecontainers',
              energystoragecontainer.EnergyStorageContainerCollection())
api.add_route('/energystoragecontainers/{id_}',
              energystoragecontainer.EnergyStorageContainerItem())
api.add_route('/energystoragecontainers/{id_}/batteries',
              energystoragecontainer.EnergyStorageContainerBatteryCollection())
api.add_route('/energystoragecontainers/{id_}/batteries/{bid}',
              energystoragecontainer.EnergyStorageContainerBatteryItem())
api.add_route('/energystoragecontainers/{id_}/batteries/{bid}/points',
              energystoragecontainer.EnergyStorageContainerBatteryPointCollection())
api.add_route('/energystoragecontainers/{id_}/batteries/{bid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerBatteryPointItem())
api.add_route('/energystoragecontainers/{id_}/commands',
              energystoragecontainer.EnergyStorageContainerCommandCollection())
api.add_route('/energystoragecontainers/{id_}/commands/{cid}',
              energystoragecontainer.EnergyStorageContainerCommandItem())
api.add_route('/energystoragecontainers/{id_}/datasources',
              energystoragecontainer.EnergyStorageContainerDataSourceCollection())
api.add_route('/energystoragecontainers/{id_}/datasources/{dsid}',
              energystoragecontainer.EnergyStorageContainerDataSourceItem())
api.add_route('/energystoragecontainers/{id_}/datasourcepoints',
              energystoragecontainer.EnergyStorageContainerDataSourcePointCollection())
api.add_route('/energystoragecontainers/{id_}/dcdcs',
              energystoragecontainer.EnergyStorageContainerDCDCCollection())
api.add_route('/energystoragecontainers/{id_}/dcdcs/{did}',
              energystoragecontainer.EnergyStorageContainerDCDCItem())
api.add_route('/energystoragecontainers/{id_}/dcdcs/{did}/points',
              energystoragecontainer.EnergyStorageContainerDCDCPointCollection())
api.add_route('/energystoragecontainers/{id_}/dcdcs/{did}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerDCDCPointItem())
api.add_route('/energystoragecontainers/{id_}/firecontrols',
              energystoragecontainer.EnergyStorageContainerFirecontrolCollection())
api.add_route('/energystoragecontainers/{id_}/firecontrols/{fid}',
              energystoragecontainer.EnergyStorageContainerFirecontrolItem())
api.add_route('/energystoragecontainers/{id_}/firecontrols/{fid}/points',
              energystoragecontainer.EnergyStorageContainerFirecontrolPointCollection())
api.add_route('/energystoragecontainers/{id_}/firecontrols/{fid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerFirecontrolPointItem())
api.add_route('/energystoragecontainers/{id_}/grids',
              energystoragecontainer.EnergyStorageContainerGridCollection())
api.add_route('/energystoragecontainers/{id_}/grids/{gid}',
              energystoragecontainer.EnergyStorageContainerGridItem())
api.add_route('/energystoragecontainers/{id_}/grids/{gid}/points',
              energystoragecontainer.EnergyStorageContainerGridPointCollection())
api.add_route('/energystoragecontainers/{id_}/grids/{gid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerGridPointItem())
api.add_route('/energystoragecontainers/{id_}/hvacs',
              energystoragecontainer.EnergyStorageContainerHVACCollection())
api.add_route('/energystoragecontainers/{id_}/hvacs/{hid}',
              energystoragecontainer.EnergyStorageContainerHVACItem())
api.add_route('/energystoragecontainers/{id_}/hvacs/{hid}/points',
              energystoragecontainer.EnergyStorageContainerHVACPointCollection())
api.add_route('/energystoragecontainers/{id_}/hvacs/{hid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerHVACPointItem())
api.add_route('/energystoragecontainers/{id_}/loads',
              energystoragecontainer.EnergyStorageContainerLoadCollection())
api.add_route('/energystoragecontainers/{id_}/loads/{lid}',
              energystoragecontainer.EnergyStorageContainerLoadItem())
api.add_route('/energystoragecontainers/{id_}/loads/{lid}/points',
              energystoragecontainer.EnergyStorageContainerLoadPointCollection())
api.add_route('/energystoragecontainers/{id_}/loads/{lid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerLoadPointItem())
api.add_route('/energystoragecontainers/{id_}/powerconversionsystems',
              energystoragecontainer.EnergyStorageContainerPCSCollection())
api.add_route('/energystoragecontainers/{id_}/powerconversionsystems/{pcsid}',
              energystoragecontainer.EnergyStorageContainerPCSItem())
api.add_route('/energystoragecontainers/{id_}/powerconversionsystems/{pcsid}/points',
              energystoragecontainer.EnergyStorageContainerPCSPointCollection())
api.add_route('/energystoragecontainers/{id_}/powerconversionsystems/{pcsid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerPCSPointItem())
api.add_route('/energystoragecontainers/{id_}/schedules',
              energystoragecontainer.EnergyStorageContainerScheduleCollection())
api.add_route('/energystoragecontainers/{id_}/schedules/{sid}',
              energystoragecontainer.EnergyStorageContainerScheduleItem())
api.add_route('/energystoragecontainers/{id_}/stses',
              energystoragecontainer.EnergyStorageContainerSTSCollection())
api.add_route('/energystoragecontainers/{id_}/stses/{fid}',
              energystoragecontainer.EnergyStorageContainerSTSItem())
api.add_route('/energystoragecontainers/{id_}/stses/{fid}/points',
              energystoragecontainer.EnergyStorageContainerSTSPointCollection())
api.add_route('/energystoragecontainers/{id_}/stses/{fid}/points/{pid}',
              energystoragecontainer.EnergyStorageContainerSTSPointItem())
api.add_route('/energystoragecontainers/{id_}/clone',
              energystoragecontainer.EnergyStorageContainerClone())
api.add_route('/energystoragecontainers/{id_}/export',
              energystoragecontainer.EnergyStorageContainerExport())
api.add_route('/energystoragecontainers/import',
              energystoragecontainer.EnergyStorageContainerImport())

api.add_route('/energystoragepowerstations',
              energystoragepowerstation.EnergyStoragePowerStationCollection())
api.add_route('/energystoragepowerstations/{id_}',
              energystoragepowerstation.EnergyStoragePowerStationItem())
api.add_route('/energystoragepowerstations/{id_}/containers',
              energystoragepowerstation.EnergyStoragePowerStationContainerCollection())
api.add_route('/energystoragepowerstations/{id_}/containers/{sid}',
              energystoragepowerstation.EnergyStoragePowerStationContainerItem())
api.add_route('/energystoragepowerstations/{id_}/datasourcepoints',
              energystoragepowerstation.EnergyStoragePowerStationDataSourcePointCollection())
api.add_route('/energystoragepowerstations/{id_}/users',
              energystoragepowerstation.EnergyStoragePowerStationUserCollection())
api.add_route('/energystoragepowerstations/{id_}/users/{uid}',
              energystoragepowerstation.EnergyStoragePowerStationUserItem())
api.add_route('/energystoragepowerstations/{id_}/export',
              energystoragepowerstation.EnergyStoragePowerStationExport())
api.add_route('/energystoragepowerstations/import',
              energystoragepowerstation.EnergyStoragePowerStationImport())
api.add_route('/energystoragepowerstations/{id_}/clone',
              energystoragepowerstation.EnergyStoragePowerStationClone())


api.add_route('/equipments',
              equipment.EquipmentCollection())
api.add_route('/equipments/{id_}',
              equipment.EquipmentItem())
api.add_route('/equipments/{id_}/meters',
              equipment.EquipmentMeterCollection())
api.add_route('/equipments/{id_}/meters/{mid}',
              equipment.EquipmentMeterItem())
api.add_route('/equipments/{id_}/offlinemeters',
              equipment.EquipmentOfflineMeterCollection())
api.add_route('/equipments/{id_}/offlinemeters/{mid}',
              equipment.EquipmentOfflineMeterItem())
api.add_route('/equipments/{id_}/parameters',
              equipment.EquipmentParameterCollection())
api.add_route('/equipments/{id_}/parameters/{pid}',
              equipment.EquipmentParameterItem())
api.add_route('/equipments/{id_}/virtualmeters',
              equipment.EquipmentVirtualMeterCollection())
api.add_route('/equipments/{id_}/virtualmeters/{mid}',
              equipment.EquipmentVirtualMeterItem())
api.add_route('/equipments/{id_}/commands',
              equipment.EquipmentCommandCollection())
api.add_route('/equipments/{id_}/commands/{cid}',
              equipment.EquipmentCommandItem())
api.add_route('/equipments/{id_}/export',
              equipment.EquipmentExport())
api.add_route('/equipments/import',
              equipment.EquipmentImport())
api.add_route('/equipments/{id_}/clone',
              equipment.EquipmentClone())

api.add_route('/gateways',
              gateway.GatewayCollection())
api.add_route('/gateways/{id_}',
              gateway.GatewayItem())
api.add_route('/gateways/{id_}/datasources',
              gateway.GatewayDataSourceCollection())
api.add_route('/gateways/{id_}/export',
              gateway.GatewayExport())
api.add_route('/gateways/import',
              gateway.GatewayImport())
api.add_route('/gateways/{id_}/clone',
              gateway.GatewayClone())

api.add_route('/knowledgefiles',
              knowledgefile.KnowledgeFileCollection())
api.add_route('/knowledgefiles/{id_}',
              knowledgefile.KnowledgeFileItem())
api.add_route('/knowledgefiles/{id_}/restore',
              knowledgefile.KnowledgeFileRestore())

api.add_route('/menus',
              menu.MenuCollection())
api.add_route('/menus/{id_}',
              menu.MenuItem())
api.add_route('/menus/{id_}/children',
              menu.MenuChildrenCollection())
api.add_route('/menus/web',
              menu.MenuWebCollection())

api.add_route('/meters',
              meter.MeterCollection())
api.add_route('/meters/{id_}',
              meter.MeterItem())
api.add_route('/meters/{id_}/submeters',
              meter.MeterSubmeterCollection())
api.add_route('/meters/{id_}/points',
              meter.MeterPointCollection())
api.add_route('/meters/{id_}/points/{pid}',
              meter.MeterPointItem())
api.add_route('/meters/{id_}/commands',
              meter.MeterCommandCollection())
api.add_route('/meters/{id_}/commands/{cid}',
              meter.MeterCommandItem())
api.add_route('/meters/{id_}/export',
              meter.MeterExport())
api.add_route('/meters/import',
              meter.MeterImport())
api.add_route('/meters/{id_}/clone',
              meter.MeterClone())


api.add_route('/microgrids',
              microgrid.MicrogridCollection())
api.add_route('/microgrids/{id_}',
              microgrid.MicrogridItem())
api.add_route('/microgrids/{id_}/sensors',
              microgrid.MicrogridSensorCollection())
api.add_route('/microgrids/{id_}/sensors/{sid}',
              microgrid.MicrogridSensorItem())
api.add_route('/microgrids/{id_}/batteries',
              microgrid.MicrogridBatteryCollection())
api.add_route('/microgrids/{id_}/batteries/{bid}',
              microgrid.MicrogridBatteryItem())
api.add_route('/microgrids/{id_}/evchargers',
              microgrid.MicrogridEVChargerCollection())
api.add_route('/microgrids/{id_}/evchargers/{eid}',
              microgrid.MicrogridEVChargerItem())
api.add_route('/microgrids/{id_}/generators',
              microgrid.MicrogridGeneratorCollection())
api.add_route('/microgrids/{id_}/generators/{gid}',
              microgrid.MicrogridGeneratorItem())
api.add_route('/microgrids/{id_}/grids',
              microgrid.MicrogridGridCollection())
api.add_route('/microgrids/{id_}/grids/{gid}',
              microgrid.MicrogridGridItem())
api.add_route('/microgrids/{id_}/heatpumps',
              microgrid.MicrogridHeatpumpCollection())
api.add_route('/microgrids/{id_}/heatpumps/{hid}',
              microgrid.MicrogridHeatpumpItem())
api.add_route('/microgrids/{id_}/loads',
              microgrid.MicrogridLoadCollection())
api.add_route('/microgrids/{id_}/loads/{lid}',
              microgrid.MicrogridLoadItem())
api.add_route('/microgrids/{id_}/photovoltaics',
              microgrid.MicrogridPhotovoltaicCollection())
api.add_route('/microgrids/{id_}/photovoltaics/{pvid}',
              microgrid.MicrogridPhotovoltaicItem())
api.add_route('/microgrids/{id_}/powerconversionsystems',
              microgrid.MicrogridPowerconversionsystemCollection())
api.add_route('/microgrids/{id_}/powerconversionsystems/{pcsid}',
              microgrid.MicrogridPowerconversionsystemItem())
api.add_route('/microgrids/{id_}/schedules',
              microgrid.MicrogridScheduleCollection())
api.add_route('/microgrids/{id_}/schedules/{sid}',
              microgrid.MicrogridScheduleItem())
api.add_route('/microgrids/{id_}/users',
              microgrid.MicrogridUserCollection())
api.add_route('/microgrids/{id_}/users/{uid}',
              microgrid.MicrogridUserItem())
api.add_route('/microgrids/{id_}/export',
              microgrid.MicrogridExport())
api.add_route('/microgrids/import',
              microgrid.MicrogridImport())
api.add_route('/microgrids/{id_}/clone',
              microgrid.MicrogridClone())
api.add_route('/microgrids/{id_}/datasources',
              microgrid.MicrogridDataSourceCollection())
api.add_route('/microgrids/{id_}/datasources/{dsid}', 
              microgrid.MicrogridDataSourceItem())
api.add_route('/microgrids/{id_}/datasourcepoints',
              microgrid.MicrogridDataSourcePointCollection())
api.add_route('/microgrids/{id_}/batteries/{bid}/points',
              microgrid.MicrogridBatteryPointCollection())
api.add_route('/microgrids/{id_}/batteries/{bid}/points/{pid}',
              microgrid.MicrogridBatteryPointItem())
api.add_route('/microgrids/{id_}/evchargers/{eid}/points',
              microgrid.MicrogridEVChargerPointCollection())
api.add_route('/microgrids/{id_}/evchargers/{eid}/points/{pid}',
              microgrid.MicrogridEVChargerPointItem())
api.add_route('/microgrids/{id_}/generators/{gid}/points',
              microgrid.MicrogridGeneratorPointCollection())
api.add_route('/microgrids/{id_}/generators/{gid}/points/{pid}',
              microgrid.MicrogridGeneratorPointItem())
api.add_route('/microgrids/{id_}/grids/{gid}/points',
              microgrid.MicrogridGridPointCollection())
api.add_route('/microgrids/{id_}/grids/{gid}/points/{pid}',
              microgrid.MicrogridGridPointItem())
api.add_route('/microgrids/{id_}/heatpumps/{hid}/points',
              microgrid.MicrogridHeatPumpPointCollection())
api.add_route('/microgrids/{id_}/heatpumps/{hid}/points/{pid}',
              microgrid.MicrogridHeatPumpPointItem())
api.add_route('/microgrids/{id_}/loads/{lid}/points',
              microgrid.MicrogridLoadPointCollection())
api.add_route('/microgrids/{id_}/loads/{lid}/points/{pid}',
              microgrid.MicrogridLoadPointItem())
api.add_route('/microgrids/{id_}/photovoltaics/{pvid}/points',
              microgrid.MicrogridPhotovoltaicPointCollection())
api.add_route('/microgrids/{id_}/photovoltaics/{pvid}/points/{pid}',
              microgrid.MicrogridPhotovoltaicPointItem())
api.add_route('/microgrids/{id_}/powerconversionsystems/{pcsid}/points',
              microgrid.MicrogridPowerConversionSystemPointCollection())
api.add_route('/microgrids/{id_}/powerconversionsystems/{pcsid}/points/{pid}',
              microgrid.MicrogridPowerConversionSystemPointItem())

api.add_route('/notifications',
              notification.NotificationCollection())
api.add_route('/notifications/{id_}',
              notification.NotificationItem())

api.add_route('/offlinemeters',
              offlinemeter.OfflineMeterCollection())
api.add_route('/offlinemeters/{id_}',
              offlinemeter.OfflineMeterItem())
api.add_route('/offlinemeters/{id_}/export',
              offlinemeter.OfflineMeterExport())
api.add_route('/offlinemeters/import',
              offlinemeter.OfflineMeterImport())
api.add_route('/offlinemeters/{id_}/clone',
              offlinemeter.OfflineMeterClone())

api.add_route('/offlinemeterfiles',
              offlinemeterfile.OfflineMeterFileCollection())
api.add_route('/offlinemeterfiles/{id_}',
              offlinemeterfile.OfflineMeterFileItem())
api.add_route('/offlinemeterfiles/{id_}/restore',
              offlinemeterfile.OfflineMeterFileRestore())

api.add_route('/photovoltaicpowerstations',
              photovoltaicpowerstation.PhotovoltaicPowerStationCollection())
api.add_route('/photovoltaicpowerstations/{id_}',
              photovoltaicpowerstation.PhotovoltaicPowerStationItem())
api.add_route('/photovoltaicpowerstations/{id_}/export',
              photovoltaicpowerstation.PhotovoltaicPowerStationExport())
api.add_route('/photovoltaicpowerstations/import',
              photovoltaicpowerstation.PhotovoltaicPowerStationImport())
api.add_route('/photovoltaicpowerstations/{id_}/clone',
              photovoltaicpowerstation.PhotovoltaicPowerStationClone())
api.add_route('/photovoltaicpowerstations/{id_}/grids',
              photovoltaicpowerstation.PhotovoltaicPowerStationGridCollection())
api.add_route('/photovoltaicpowerstations/{id_}/grids/{gid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationGridItem())
api.add_route('/photovoltaicpowerstations/{id_}/invertors',
              photovoltaicpowerstation.PhotovoltaicPowerStationInvertorCollection())
api.add_route('/photovoltaicpowerstations/{id_}/invertors/{iid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationInvertorItem())
api.add_route('/photovoltaicpowerstations/{id_}/invertors/{iid}/points',
              photovoltaicpowerstation.PhotovoltaicPowerStationInvertorPointCollection())
api.add_route('/photovoltaicpowerstations/{id_}/grids/{gid}/points',
              photovoltaicpowerstation.PhotovoltaicPowerStationGridPointCollection())
api.add_route('/photovoltaicpowerstations/{id_}/grids/{gid}/points/{pid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationGridPointItem())
api.add_route('/photovoltaicpowerstations/{id_}/loads/{lid}/points',
              photovoltaicpowerstation.PhotovoltaicPowerStationLoadPointCollection())
api.add_route('/photovoltaicpowerstations/{id_}/loads/{lid}/points/{pid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationLoadPointItem())
api.add_route('/photovoltaicpowerstations/{id_}/invertors/{iid}/points/{pid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationInvertorPointItem())
api.add_route('/photovoltaicpowerstations/{id_}/loads',
              photovoltaicpowerstation.PhotovoltaicPowerStationLoadCollection())
api.add_route('/photovoltaicpowerstations/{id_}/loads/{lid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationLoadItem())
api.add_route('/photovoltaicpowerstations/{id_}/users',
              photovoltaicpowerstation.PhotovoltaicPowerStationUserCollection())
api.add_route('/photovoltaicpowerstations/{id_}/users/{uid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationUserItem())
api.add_route('/photovoltaicpowerstations/{id_}/datasources',
              photovoltaicpowerstation.PhotovoltaicPowerStationDataSourceCollection())
api.add_route('/photovoltaicpowerstations/{id_}/datasources/{dsid}',
              photovoltaicpowerstation.PhotovoltaicPowerStationDataSourceItem())
api.add_route('/photovoltaicpowerstations/{id_}/datasourcepoints',
              photovoltaicpowerstation.PhotovoltaicPowerStationDataSourcePointCollection())

api.add_route('/points',
              point.PointCollection())
api.add_route('/points/{id_}',
              point.PointItem())
api.add_route('/pointlimits/{id_}',
              point.PointLimit())
api.add_route('/pointsetvalues/{id_}',
              point.PointSetValue())
api.add_route('/points/{id_}/export',
              point.PointExport())
api.add_route('/points/import',
              point.PointImport())
api.add_route('/points/{id_}/clone',
              point.PointClone())

api.add_route('/apikeys',
              apikey.ApiKeyCollection())
api.add_route('/apikeys/{id_}',
              apikey.ApiKeyItem())

api.add_route('/privileges',
              privilege.PrivilegeCollection())
api.add_route('/privileges/{id_}',
              privilege.PrivilegeItem())

api.add_route('/protocols',
              protocol.ProtocolCollection())
api.add_route('/protocols/{id_}',
              protocol.ProtocolItem())
api.add_route('/rules',
              rule.RuleCollection())
api.add_route('/rules/{id_}',
              rule.RuleItem())
api.add_route('/rules/{id_}/run',
              rule.RuleRun())
api.add_route('/rules/{id_}/export',
              rule.RuleExport())
api.add_route('/rules/import',
              rule.RuleImport())
api.add_route('/rules/{id_}/clone',
              rule.RuleClone())

api.add_route('/sensors',
              sensor.SensorCollection())
api.add_route('/sensors/{id_}',
              sensor.SensorItem())
api.add_route('/sensors/{id_}/points',
              sensor.SensorPointCollection())
api.add_route('/sensors/{id_}/points/{pid}',
              sensor.SensorPointItem())
api.add_route('/sensors/{id_}/export',
              sensor.SensorExport())
api.add_route('/sensors/import',
              sensor.SensorImport())
api.add_route('/sensors/{id_}/clone',
              sensor.SensorClone())

api.add_route('/shopfloors',
              shopfloor.ShopfloorCollection())
api.add_route('/shopfloors/{id_}',
              shopfloor.ShopfloorItem())
api.add_route('/shopfloors/{id_}/equipments',
              shopfloor.ShopfloorEquipmentCollection())
api.add_route('/shopfloors/{id_}/equipments/{eid}',
              shopfloor.ShopfloorEquipmentItem())
api.add_route('/shopfloors/{id_}/meters',
              shopfloor.ShopfloorMeterCollection())
api.add_route('/shopfloors/{id_}/meters/{mid}',
              shopfloor.ShopfloorMeterItem())
api.add_route('/shopfloors/{id_}/offlinemeters',
              shopfloor.ShopfloorOfflineMeterCollection())
api.add_route('/shopfloors/{id_}/offlinemeters/{mid}',
              shopfloor.ShopfloorOfflineMeterItem())
api.add_route('/shopfloors/{id_}/points',
              shopfloor.ShopfloorPointCollection())
api.add_route('/shopfloors/{id_}/points/{pid}',
              shopfloor.ShopfloorPointItem())
api.add_route('/shopfloors/{id_}/sensors',
              shopfloor.ShopfloorSensorCollection())
api.add_route('/shopfloors/{id_}/sensors/{sid}',
              shopfloor.ShopfloorSensorItem())
api.add_route('/shopfloors/{id_}/virtualmeters',
              shopfloor.ShopfloorVirtualMeterCollection())
api.add_route('/shopfloors/{id_}/virtualmeters/{mid}',
              shopfloor.ShopfloorVirtualMeterItem())
api.add_route('/shopfloors/{id_}/workingcalendars',
              shopfloor.ShopfloorWorkingCalendarCollection())
api.add_route('/shopfloors/{id_}/workingcalendars/{wcid}',
              shopfloor.ShopfloorWorkingCalendarItem())
api.add_route('/shopfloors/{id_}/commands',
              shopfloor.ShopfloorCommandCollection())
api.add_route('/shopfloors/{id_}/commands/{cid}',
              shopfloor.ShopfloorCommandItem())
api.add_route('/shopfloors/{id_}/export',
              shopfloor.ShopfloorExport())
api.add_route('/shopfloors/import',
              shopfloor.ShopfloorImport())
api.add_route('/shopfloors/{id_}/clone',
              shopfloor.ShopfloorClone())

api.add_route('/spaces',
              space.SpaceCollection())
api.add_route('/spaces/{id_}',
              space.SpaceItem())
api.add_route('/spaces/{id_}/children',
              space.SpaceChildrenCollection())
api.add_route('/spaces/{id_}/combinedequipments',
              space.SpaceCombinedEquipmentCollection())
api.add_route('/spaces/{id_}/combinedequipments/{eid}',
              space.SpaceCombinedEquipmentItem())
api.add_route('/spaces/{id_}/energystoragepowerstations',
              space.SpaceEnergyStoragePowerStationCollection())
api.add_route('/spaces/{id_}/energystoragepowerstations/{eid}',
              space.SpaceEnergyStoragePowerStationItem())
api.add_route('/spaces/{id_}/equipments',
              space.SpaceEquipmentCollection())
api.add_route('/spaces/{id_}/equipments/{eid}',
              space.SpaceEquipmentItem())
api.add_route('/spaces/{id_}/meters',
              space.SpaceMeterCollection())
api.add_route('/spaces/{id_}/meters/{mid}',
              space.SpaceMeterItem())
api.add_route('/spaces/{id_}/microgrids',
              space.SpaceMicrogridCollection())
api.add_route('/spaces/{id_}/microgrids/{mid}',
              space.SpaceMicrogridItem())
api.add_route('/spaces/{id_}/export',
              space.SpaceExport())
api.add_route('/spaces/import',
              space.SpaceImport())
api.add_route('/spaces/{id_}/clone',
              space.SpaceClone())
api.add_route('/spaces/{id_}/energyflowdiagrams',
              space.SpaceEnergyFlowDiagramCollection())
api.add_route('/spaces/{id_}/energyflowdiagrams/{eid}',
              space.SpaceEnergyFlowDiagramItem())
api.add_route('/spaces/{id_}/distributionsystems',
              space.DistributionSystemCollection())
api.add_route('/spaces/{id_}/distributionsystems/{did}',
              space.DistributionSystemItem())
# Get energy categories of all meters in the space tree
api.add_route('/spaces/{id_}/treemetersenergycategories',
              space.SpaceTreeMetersEnergyCategoryCollection())
api.add_route('/spaces/{id_}/offlinemeters',
              space.SpaceOfflineMeterCollection())
api.add_route('/spaces/{id_}/offlinemeters/{mid}',
              space.SpaceOfflineMeterItem())
api.add_route('/spaces/{id_}/photovoltaicpowerstations',
              space.SpacePhotovoltaicPowerStationCollection())
api.add_route('/spaces/{id_}/photovoltaicpowerstations/{eid}',
              space.SpacePhotovoltaicPowerStationItem())
api.add_route('/spaces/{id_}/points',
              space.SpacePointCollection())
api.add_route('/spaces/{id_}/points/{pid}',
              space.SpacePointItem())
api.add_route('/spaces/{id_}/sensors',
              space.SpaceSensorCollection())
api.add_route('/spaces/{id_}/sensors/{sid}',
              space.SpaceSensorItem())
api.add_route('/spaces/{id_}/shopfloors',
              space.SpaceShopfloorCollection())
api.add_route('/spaces/{id_}/shopfloors/{sid}',
              space.SpaceShopfloorItem())
api.add_route('/spaces/{id_}/stores',
              space.SpaceStoreCollection())
api.add_route('/spaces/{id_}/stores/{tid}',
              space.SpaceStoreItem())
api.add_route('/spaces/{id_}/tenants',
              space.SpaceTenantCollection())
api.add_route('/spaces/{id_}/tenants/{tid}',
              space.SpaceTenantItem())
api.add_route('/spaces/{id_}/virtualmeters',
              space.SpaceVirtualMeterCollection())
api.add_route('/spaces/{id_}/virtualmeters/{mid}',
              space.SpaceVirtualMeterItem())
api.add_route('/spaces/{id_}/workingcalendars',
              space.SpaceWorkingCalendarCollection())
api.add_route('/spaces/{id_}/workingcalendars/{wcid}',
              space.SpaceWorkingCalendarItem())
api.add_route('/spaces/{id_}/commands',
              space.SpaceCommandCollection())
api.add_route('/spaces/{id_}/commands/{cid}',
              space.SpaceCommandItem())
api.add_route('/spaces/tree',
              space.SpaceTreeCollection())

api.add_route('/stores',
              store.StoreCollection())
api.add_route('/stores/{id_}',
              store.StoreItem())
api.add_route('/stores/{id_}/meters',
              store.StoreMeterCollection())
api.add_route('/stores/{id_}/meters/{mid}',
              store.StoreMeterItem())
api.add_route('/stores/{id_}/offlinemeters',
              store.StoreOfflineMeterCollection())
api.add_route('/stores/{id_}/offlinemeters/{mid}',
              store.StoreOfflineMeterItem())
api.add_route('/stores/{id_}/points',
              store.StorePointCollection())
api.add_route('/stores/{id_}/points/{pid}',
              store.StorePointItem())
api.add_route('/stores/{id_}/sensors',
              store.StoreSensorCollection())
api.add_route('/stores/{id_}/sensors/{sid}',
              store.StoreSensorItem())
api.add_route('/stores/{id_}/virtualmeters',
              store.StoreVirtualMeterCollection())
api.add_route('/stores/{id_}/virtualmeters/{mid}',
              store.StoreVirtualMeterItem())
api.add_route('/stores/{id_}/workingcalendars',
              store.StoreWorkingCalendarCollection())
api.add_route('/stores/{id_}/workingcalendars/{wcid}',
              store.StoreWorkingCalendarItem())
api.add_route('/stores/{id_}/commands',
              store.StoreCommandCollection())
api.add_route('/stores/{id_}/commands/{cid}',
              store.StoreCommandItem())
api.add_route('/stores/{id_}/export',
              store.StoreExport())
api.add_route('/stores/import',
              store.StoreImport())
api.add_route('/stores/{id_}/clone',
              store.StoreClone())

api.add_route('/storetypes',
              storetype.StoreTypeCollection())
api.add_route('/storetypes/{id_}',
              storetype.StoreTypeItem())

api.add_route('/svgs',
              svg.SVGCollection())
api.add_route('/svgs/{id_}',
              svg.SVGItem())
api.add_route('/svgs/{id_}/export',
              svg.SVGExport())
api.add_route('/svgs/import',
              svg.SVGImport())
api.add_route('/svgs/{id_}/clone',
              svg.SVGClone())

api.add_route('/tariffs',
              tariff.TariffCollection())
api.add_route('/tariffs/{id_}',
              tariff.TariffItem())
api.add_route('/tariffs/{id_}/export',
              tariff.TariffExport())
api.add_route('/tariffs/import',
              tariff.TariffImport())
api.add_route('/tariffs/{id_}/clone',
              tariff.TariffClone())

api.add_route('/tenants',
              tenant.TenantCollection())
api.add_route('/tenants/{id_}',
              tenant.TenantItem())
api.add_route('/tenants/{id_}/meters',
              tenant.TenantMeterCollection())
api.add_route('/tenants/{id_}/meters/{mid}',
              tenant.TenantMeterItem())
api.add_route('/tenants/{id_}/offlinemeters',
              tenant.TenantOfflineMeterCollection())
api.add_route('/tenants/{id_}/offlinemeters/{mid}',
              tenant.TenantOfflineMeterItem())
api.add_route('/tenants/{id_}/points',
              tenant.TenantPointCollection())
api.add_route('/tenants/{id_}/points/{pid}',
              tenant.TenantPointItem())
api.add_route('/tenants/{id_}/sensors',
              tenant.TenantSensorCollection())
api.add_route('/tenants/{id_}/sensors/{sid}',
              tenant.TenantSensorItem())
api.add_route('/tenants/{id_}/virtualmeters',
              tenant.TenantVirtualMeterCollection())
api.add_route('/tenants/{id_}/virtualmeters/{mid}',
              tenant.TenantVirtualMeterItem())
api.add_route('/tenants/{id_}/workingcalendars',
              tenant.TenantWorkingCalendarCollection())
api.add_route('/tenants/{id_}/workingcalendars/{wcid}',
              tenant.TenantWorkingCalendarItem())
api.add_route('/tenants/{id_}/commands',
              tenant.TenantCommandCollection())
api.add_route('/tenants/{id_}/commands/{cid}',
              tenant.TenantCommandItem())
api.add_route('/tenants/{id_}/export',
              tenant.TenantExport())
api.add_route('/tenants/import',
              tenant.TenantImport())
api.add_route('/tenants/{id_}/clone',
              tenant.TenantClone())

api.add_route('/tenanttypes',
              tenanttype.TenantTypeCollection())
api.add_route('/tenanttypes/{id_}',
              tenanttype.TenantTypeItem())

api.add_route('/textmessages',
              textmessage.TextMessageCollection())
api.add_route('/textmessages/{id_}',
              textmessage.TextMessageItem())

api.add_route('/tickets',
              ticket.TicketCollection())
api.add_route('/tickets/{id_}',
              ticket.TicketItem())

api.add_route('/timezones',
              timezone.TimezoneCollection())
api.add_route('/timezones/{id_}',
              timezone.TimezoneItem())

api.add_route('/users',
              user.UserCollection())
api.add_route('/users/{id_}',
              user.UserItem())
api.add_route('/users/login',
              user.UserLogin())
api.add_route('/users/logout',
              user.UserLogout())
api.add_route('/users/resetpassword',
              user.ResetPassword())
api.add_route('/users/changepassword',
              user.ChangePassword())
api.add_route('/users/unlock/{id_}',
              user.Unlock())
api.add_route('/users/forgotpassword',
              user.ForgotPassword())
api.add_route('/users/emailmessages',
              user.EmailMessageCollection())
api.add_route('/users/emailmessages/{id_}',
              user.EmailMessageItem())
api.add_route('/users/newusers',
              user.NewUserCollection())
api.add_route('/users/newusers/{id_}',
              user.NewUserItem())
api.add_route('/users/newusers/{id_}/approve',
              user.NewUserApprove())

api.add_route('/virtualmeters',
              virtualmeter.VirtualMeterCollection())
api.add_route('/virtualmeters/{id_}',
              virtualmeter.VirtualMeterItem())
api.add_route('/virtualmeters/{id_}/export',
              virtualmeter.VirtualMeterExport())
api.add_route('/virtualmeters/import',
              virtualmeter.VirtualMeterImport())
api.add_route('/virtualmeters/{id_}/clone',
              virtualmeter.VirtualMeterClone())

api.add_route('/virtualpowerplants',
              virtualpowerplant.VirtualPowerPlantCollection())
api.add_route('/virtualpowerplants/{id_}',
              virtualpowerplant.VirtualPowerPlantItem())
api.add_route('/virtualpowerplants/{id_}/microgrids',
              virtualpowerplant.VirtualPowerPlantMicrogridCollection())
api.add_route('/virtualpowerplants/{id_}/microgrids/{mid}',
              virtualpowerplant.VirtualPowerPlantMicrogridItem())
api.add_route('/virtualpowerplants/{id_}/export',
              virtualpowerplant.VirtualPowerPlantExport())
api.add_route('/virtualpowerplants/import',
              virtualpowerplant.VirtualPowerPlantImport())
api.add_route('/virtualpowerplants/{id_}/clone',
              virtualpowerplant.VirtualPowerPlantClone())

api.add_route('/webmessages',
              webmessage.WebMessageCollection())
api.add_route('/webmessagesnew',
              webmessage.WebMessageStatusNewCollection())
api.add_route('/webmessages/{id_}',
              webmessage.WebMessageItem())
api.add_route('/webmessagesbatch',
              webmessage.WebMessageBatch())

api.add_route('/wechatmessages',
              wechatmessage.WechatMessageCollection())
api.add_route('/wechatmessages/{id_}',
              wechatmessage.WechatMessageItem())

api.add_route('/windfarms',
              windfarm.WindFarmCollection())
api.add_route('/windfarms/{id_}',
              windfarm.WindFarmItem())
api.add_route('/windfarms/{id_}/export',
              windfarm.WindFarmExport())
api.add_route('/windfarms/import',
              windfarm.WindFarmImport())
api.add_route('/windfarms/{id_}/clone',
              windfarm.WindFarmClone())

api.add_route('/workingcalendars',
              workingcalendar.WorkingCalendarCollection())
api.add_route('/workingcalendars/{id_}',
              workingcalendar.WorkingCalendarItem())
api.add_route('/workingcalendars/{id_}/nonworkingdays',
              workingcalendar.NonWorkingDayCollection())
api.add_route('/nonworkingdays/{id_}',
              workingcalendar.NonWorkingDayItem())
api.add_route('/workingcalendars/{id_}/export',
              workingcalendar.WorkingCalendarExport())
api.add_route('/workingcalendars/import',
              workingcalendar.WorkingCalendarImport())
api.add_route('/workingcalendars/{id_}/clone',
              workingcalendar.WorkingCalendarClone())

api.add_route('/version',
              version.VersionItem())


########################################################################################################################
# Routes for Reports
########################################################################################################################
api.add_route('/reports/advancedreports',
              advancedreportfile.AdvancedReportFileCollection())
api.add_route('/reports/advancedreports/{id_}',
              advancedreportfile.AdvancedReportFileItem())
api.add_route('/reports/distributionsystem',
              distributionsystemreport.Reporting())
api.add_route('/reports/energyflowdiagram',
              energyflowdiagramreport.Reporting())
api.add_route('/reports/combinedequipmentbatch',
              combinedequipmentbatch.Reporting())
api.add_route('/reports/combinedequipmentcarbon',
              combinedequipmentcarbon.Reporting())
api.add_route('/reports/combinedequipmentcost',
              combinedequipmentcost.Reporting())
api.add_route('/reports/combinedequipmentefficiency',
              combinedequipmentefficiency.Reporting())
api.add_route('/reports/combinedequipmentenergycategory',
              combinedequipmentenergycategory.Reporting())
api.add_route('/reports/combinedequipmentenergyitem',
              combinedequipmentenergyitem.Reporting())
api.add_route('/reports/combinedequipmentincome',
              combinedequipmentincome.Reporting())
api.add_route('/reports/combinedequipmentload',
              combinedequipmentload.Reporting())
api.add_route('/reports/combinedequipmentoutput',
              combinedequipmentoutput.Reporting())
api.add_route('/reports/combinedequipmentsaving',
              combinedequipmentsaving.Reporting())
api.add_route('/reports/combinedequipmentplan',
              combinedequipmentplan.Reporting())
api.add_route('/reports/combinedequipmentstatistics',
              combinedequipmentstatistics.Reporting())
api.add_route('/reports/dashboard',
              dashboard.Reporting())
api.add_route('/reports/energystoragepowerstationdashboard',
              energystoragepowerstationdashboard.Reporting())
api.add_route('/reports/energystoragepowerstationitemdashboard',
              energystoragepowerstationitemdashboard.Reporting())
api.add_route('/reports/energystoragepowerstationdetails',
              energystoragepowerstationdetails.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/bms',
              energystoragepowerstationdetailsbms.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/command',
              energystoragepowerstationdetailscommand.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/firecontrol',
              energystoragepowerstationdetailsfirecontrol.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/hvac',
              energystoragepowerstationdetailshvac.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/grid',
              energystoragepowerstationdetailsgrid.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/load',
              energystoragepowerstationdetailsload.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/meter',
              energystoragepowerstationdetailsmeter.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/dcdc',
              energystoragepowerstationdetailsdcdc.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/pcs',
              energystoragepowerstationdetailspcs.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/sts',
              energystoragepowerstationdetailssts.Reporting())
api.add_route('/reports/energystoragepowerstationdetails/{id_}/schedule',
              energystoragepowerstationdetailsschedule.Reporting())
api.add_route('/reports/energystoragepowerstationlist',
              energystoragepowerstationlist.Reporting())
api.add_route('/reports/energystoragepowerstationreportingrevenue',
              energystoragepowerstationreportingrevenue.Reporting())
api.add_route('/reports/energystoragepowerstationreportingenergy',
              energystoragepowerstationreportingenergy.Reporting())
api.add_route('/reports/energystoragepowerstationreportingparameters',
              energystoragepowerstationreportingparameters.Reporting())
api.add_route('/reports/energystoragepowerstationcollectionenergy',
              energystoragepowerstationcollectionenergy.Reporting())
api.add_route('/reports/energystoragepowerstationitemenergy',
              energystoragepowerstationitemenergy.Reporting())
api.add_route('/reports/energystoragepowerstationcollectionbilling',
              energystoragepowerstationcollectionbilling.Reporting())
api.add_route('/reports/energystoragepowerstationitembilling',
              energystoragepowerstationitembilling.Reporting())
api.add_route('/reports/energystoragepowerstationcollectioncarbon',
              energystoragepowerstationcollectioncarbon.Reporting())
api.add_route('/reports/energystoragepowerstationitemcarbon',
              energystoragepowerstationitemcarbon.Reporting())
api.add_route('/reports/equipmentbatch',
              equipmentbatch.Reporting())
api.add_route('/reports/equipmentcarbon',
              equipmentcarbon.Reporting())
api.add_route('/reports/equipmentcost',
              equipmentcost.Reporting())
api.add_route('/reports/equipmentefficiency',
              equipmentefficiency.Reporting())
api.add_route('/reports/equipmentenergycategory',
              equipmentenergycategory.Reporting())
api.add_route('/reports/equipmentenergyitem',
              equipmentenergyitem.Reporting())
api.add_route('/reports/equipmentincome',
              equipmentincome.Reporting())
api.add_route('/reports/equipmentload',
              equipmentload.Reporting())
api.add_route('/reports/equipmentoutput',
              equipmentoutput.Reporting())
api.add_route('/reports/equipmentsaving',
              equipmentsaving.Reporting())
api.add_route('/reports/equipmentplan',
              equipmentplan.Reporting())
api.add_route('/reports/equipmentstatistics',
              equipmentstatistics.Reporting())
api.add_route('/reports/equipmenttracking',
              equipmenttracking.Reporting())
api.add_route('/reports/enterproduction',
              enterproduction.Reporting())
api.add_route('/reports/spaceproduction',
              spaceproduction.Reporting())
api.add_route('/reports/fddfault',
              fddfault.Reporting())
api.add_route('/reports/meterbatch',
              meterbatch.Reporting())
api.add_route('/reports/metercarbon',
              metercarbon.Reporting())
api.add_route('/reports/metercomparison',
              metercomparison.Reporting())
api.add_route('/reports/equipmentcomparison',
              equipmentcomparison.Reporting())
api.add_route('/reports/metercost',
              metercost.Reporting())
api.add_route('/reports/meterenergy',
              meterenergy.Reporting())
api.add_route('/reports/meterrealtime',
              meterrealtime.Reporting())
api.add_route('/reports/metersaving',
              metersaving.Reporting())
api.add_route('/reports/meterplan',
              meterplan.Reporting())
api.add_route('/reports/metersubmetersbalance',
              metersubmetersbalance.Reporting())
api.add_route('/reports/metertrend',
              metertrend.Reporting())
api.add_route('/reports/metertracking',
              metertracking.Reporting())
api.add_route('/reports/microgriddashboard',
              microgriddashboard.Reporting())
api.add_route('/reports/microgriddetails',
              microgriddetails.Reporting())
api.add_route('/reports/microgriddetails/{id_}/bms',
              microgriddetailsbms.Reporting())
api.add_route('/reports/microgriddetails/{id_}/evcharger',
              microgriddetailsevcharger.Reporting())
api.add_route('/reports/microgriddetails/{id_}/generator',
              microgriddetailsgenerator.Reporting())
api.add_route('/reports/microgriddetails/{id_}/grid',
              microgriddetailsgrid.Reporting())
api.add_route('/reports/microgriddetails/{id_}/heatpump',
              microgriddetailsheatpump.Reporting())
api.add_route('/reports/microgriddetails/{id_}/load',
              microgriddetailsload.Reporting())
api.add_route('/reports/microgriddetails/{id_}/pcs',
              microgriddetailspcs.Reporting())
api.add_route('/reports/microgriddetails/{id_}/pv',
              microgriddetailspv.Reporting())
api.add_route('/reports/microgridlist',
              microgridlist.Reporting())
api.add_route('/reports/microgridreportingenergy',
              microgridreportingenergy.Reporting())
api.add_route('/reports/microgridsenergy',
              microgridsenergy.Reporting())
api.add_route('/reports/microgridsbilling',
              microgridsbilling.Reporting())
api.add_route('/reports/microgridscarbon',
              microgridscarbon.Reporting())
api.add_route('/reports/offlinemeterbatch',
              offlinemeterbatch.Reporting())
api.add_route('/reports/offlinemetercarbon',
              offlinemetercarbon.Reporting())
api.add_route('/reports/offlinemetercost',
              offlinemetercost.Reporting())
api.add_route('/reports/offlinemeterenergy',
              offlinemeterenergy.Reporting())
api.add_route('/reports/offlinemeterdaily',
              offlinemeterdaily.Reporting())
api.add_route('/reports/offlinemeterinput',
              offlinemeterinput.Reporting())
api.add_route('/reports/offlinemetersaving',
              offlinemetersaving.Reporting())
api.add_route('/reports/offlinemeterplan',
              offlinemeterplan.Reporting())

api.add_route('/reports/photovoltaicpowerstationdashboard',
              photovoltaicpowerstationdashboard.Reporting())
api.add_route('/reports/photovoltaicpowerstationitemdashboard',
              photovoltaicpowerstationitemdashboard.Reporting())
api.add_route('/reports/photovoltaicpowerstationdetails',
              photovoltaicpowerstationdetails.Reporting())
api.add_route('/reports/photovoltaicpowerstationdetails/{id_}/meter',
              photovoltaicpowerstationdetailsmeter.Reporting())
api.add_route('/reports/photovoltaicpowerstationdetails/{id_}/invertor',
              photovoltaicpowerstationdetailsinvertor.Reporting())
api.add_route('/reports/photovoltaicpowerstationlist',
              photovoltaicpowerstationlist.Reporting())
api.add_route('/reports/photovoltaicpowerstationreportingrevenue',
              photovoltaicpowerstationreportingrevenue.Reporting())
api.add_route('/reports/photovoltaicpowerstationreportingenergy',
              photovoltaicpowerstationreportingenergy.Reporting())
api.add_route('/reports/photovoltaicpowerstationreportingparameters',
              photovoltaicpowerstationreportingparameters.Reporting())
api.add_route('/reports/photovoltaicpowerstationcollectionenergy',
              photovoltaicpowerstationcollectionenergy.Reporting())
api.add_route('/reports/photovoltaicpowerstationitemenergy',
              photovoltaicpowerstationitemenergy.Reporting())
api.add_route('/reports/photovoltaicpowerstationcollectionbilling',
              photovoltaicpowerstationcollectionbilling.Reporting())
api.add_route('/reports/photovoltaicpowerstationitembilling',
              photovoltaicpowerstationitembilling.Reporting())
api.add_route('/reports/photovoltaicpowerstationcollectioncarbon',
              photovoltaicpowerstationcollectioncarbon.Reporting())
api.add_route('/reports/photovoltaicpowerstationitemcarbon',
              photovoltaicpowerstationitemcarbon.Reporting())
api.add_route('/reports/pointrealtime',
              pointrealtime.Reporting())
api.add_route('/reports/shopfloorcarbon',
              shopfloorcarbon.Reporting())
api.add_route('/reports/shopfloorcost',
              shopfloorcost.Reporting())
api.add_route('/reports/shopfloordashboard',
              shopfloordashboard.Reporting())
api.add_route('/reports/shopfloorenergycategory',
              shopfloorenergycategory.Reporting())
api.add_route('/reports/shopfloorenergyitem',
              shopfloorenergyitem.Reporting())
api.add_route('/reports/shopfloorload',
              shopfloorload.Reporting())
api.add_route('/reports/shopfloorsaving',
              shopfloorsaving.Reporting())
api.add_route('/reports/shopfloorplan',
              shopfloorplan.Reporting())
api.add_route('/reports/shopfloorstatistics',
              shopfloorstatistics.Reporting())
api.add_route('/reports/shopfloorbatch',
              shopfloorbatch.Reporting())
api.add_route('/reports/spacecarbon',
              spacecarbon.Reporting())
api.add_route('/reports/spacecost',
              spacecost.Reporting())
api.add_route('/reports/spaceefficiency',
              spaceefficiency.Reporting())
api.add_route('/reports/spaceenergycategory',
              spaceenergycategory.Reporting())
api.add_route('/reports/spaceenergyitem',
              spaceenergyitem.Reporting())
api.add_route('/reports/spaceincome',
              spaceincome.Reporting())
api.add_route('/reports/spaceload',
              spaceload.Reporting())
api.add_route('/reports/spaceoutput',
              spaceoutput.Reporting())
api.add_route('/reports/spacesaving',
              spacesaving.Reporting())
api.add_route('/reports/spaceplan',
              spaceplan.Reporting())
api.add_route('/reports/spaceprediction',
              spaceprediction.Reporting())
api.add_route('/reports/spacestatistics',
              spacestatistics.Reporting())
api.add_route('/reports/storebatch',
              storebatch.Reporting())
api.add_route('/reports/storecarbon',
              storecarbon.Reporting())
api.add_route('/reports/storecost',
              storecost.Reporting())
api.add_route('/reports/storeendashboard',
              storedashboard.Reporting())
api.add_route('/reports/storeenergycategory',
              storeenergycategory.Reporting())
api.add_route('/reports/storeenergyitem',
              storeenergyitem.Reporting())
api.add_route('/reports/spaceenvironmentmonitor',
              spaceenvironmentmonitor.Reporting())
api.add_route('/reports/storeload',
              storeload.Reporting())
api.add_route('/reports/storesaving',
              storesaving.Reporting())
api.add_route('/reports/storeplan',
              storeplan.Reporting())
api.add_route('/reports/storestatistics',
              storestatistics.Reporting())
api.add_route('/reports/tenantbatch',
              tenantbatch.Reporting())
api.add_route('/reports/tenantbill',
              tenantbill.Reporting())
api.add_route('/reports/tenantcarbon',
              tenantcarbon.Reporting())
api.add_route('/reports/tenantcost',
              tenantcost.Reporting())
api.add_route('/reports/tenantdashboard',
              tenantdashboard.Reporting())
api.add_route('/reports/tenantenergycategory',
              tenantenergycategory.Reporting())
api.add_route('/reports/tenantenergyitem',
              tenantenergyitem.Reporting())
api.add_route('/reports/tenantload',
              tenantload.Reporting())
api.add_route('/reports/tenantsaving',
              tenantsaving.Reporting())
api.add_route('/reports/tenantplan',
              tenantplan.Reporting())
api.add_route('/reports/tenantstatistics',
              tenantstatistics.Reporting())
api.add_route('/reports/virtualmeterbatch',
              virtualmeterbatch.Reporting())
api.add_route('/reports/virtualmetersaving',
              virtualmetersaving.Reporting())
api.add_route('/reports/virtualmeterplan',
              virtualmeterplan.Reporting())
api.add_route('/reports/virtualmeterenergy',
              virtualmeterenergy.Reporting())
api.add_route('/reports/virtualmetercarbon',
              virtualmetercarbon.Reporting())
api.add_route('/reports/virtualmetercost',
              virtualmetercost.Reporting())

########################################################################################################################
# BEGIN Routes for Enterprise Edition
########################################################################################################################


########################################################################################################################
# END Routes for Enterprise Edition
########################################################################################################################

# # for debugging on Windows
# from waitress import serve
# serve(api, host='0.0.0.0', port=8000)


# for debugging on Linux or macOS
if __name__ == '__main__':
    httpd = simple_server.make_server('0.0.0.0', 8000, api)
    httpd.serve_forever()
