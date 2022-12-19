import falcon
from falcon_cors import CORS
from falcon_multipart.middleware import MultipartMiddleware

from core import energyflowdiagram, privilege, textmessage, distributioncircuit, virtualmeter, \
    costcenter, point, knowledgefile, meter, tariff, user, storetype, timezone, \
    costfile, offlinemeterfile, version, contact, emailserver, combinedequipment, datasource, equipment, tenant, \
    shopfloor, webmessage, distributionsystem, store, emailmessage, tenanttype, wechatmessage, space, gateway, \
    offlinemeter, rule, energycategory, sensor, energyitem, notification, menu, datarepairfile
from reports import advancedreport
from reports import combinedequipmentbatch
from reports import combinedequipmentcarbon
from reports import combinedequipmentcost
from reports import combinedequipmentefficiency
from reports import combinedequipmentenergycategory
from reports import combinedequipmentenergyitem
from reports import combinedequipmentincome
from reports import combinedequipmentload
from reports import combinedequipmentoutput
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
from reports import equipmentsaving
from reports import equipmentstatistics
from reports import equipmenttracking
from reports import fddfault
from reports import meterbatch
from reports import metercarbon
from reports import metercomparison
from reports import metercost
from reports import meterenergy
from reports import meterrealtime
from reports import metersaving
from reports import metersubmetersbalance
from reports import metertracking
from reports import metertrend
from reports import offlinemeterbatch
from reports import offlinemetercarbon
from reports import offlinemetercost
from reports import offlinemeterenergy
from reports import offlinemetersaving
from reports import shopfloorbatch
from reports import shopfloorcarbon
from reports import shopfloorcost
from reports import shopfloorenergycategory
from reports import shopfloorenergyitem
from reports import shopfloorload
from reports import shopfloorsaving
from reports import shopfloorstatistics
from reports import spacecarbon
from reports import spacecost
from reports import spaceefficiency
from reports import spaceenergycategory
from reports import spaceenergyitem
from reports import spaceincome
from reports import spaceload
from reports import spaceoutput
from reports import spacesaving
from reports import spacestatistics
from reports import storebatch
from reports import storecarbon
from reports import storecost
from reports import storeenergycategory
from reports import storeenergyitem
from reports import storeload
from reports import storesaving
from reports import storestatistics
from reports import tenantbatch
from reports import tenantbill
from reports import tenantcarbon
from reports import tenantcost
from reports import tenantenergycategory
from reports import tenantenergyitem
from reports import tenantload
from reports import tenantsaving
from reports import tenantstatistics
from reports import virtualmeterbatch
from reports import virtualmetercarbon
from reports import virtualmetercost
from reports import virtualmeterenergy
from reports import virtualmetersaving

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

api.add_route('/contacts',
              contact.ContactCollection())
api.add_route('/contacts/{id_}',
              contact.ContactItem())

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

api.add_route('/energyitems',
              energyitem.EnergyItemCollection())
api.add_route('/energyitems/{id_}',
              energyitem.EnergyItemItem())

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

api.add_route('/gateways',
              gateway.GatewayCollection())
api.add_route('/gateways/{id_}',
              gateway.GatewayItem())
api.add_route('/gateways/{id_}/datasources',
              gateway.GatewayDataSourceCollection())

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

api.add_route('/notifications',
              notification.NotificationCollection())
api.add_route('/notifications/{id_}',
              notification.NotificationItem())

api.add_route('/offlinemeters',
              offlinemeter.OfflineMeterCollection())
api.add_route('/offlinemeters/{id_}',
              offlinemeter.OfflineMeterItem())

api.add_route('/offlinemeterfiles',
              offlinemeterfile.OfflineMeterFileCollection())
api.add_route('/offlinemeterfiles/{id_}',
              offlinemeterfile.OfflineMeterFileItem())
api.add_route('/offlinemeterfiles/{id_}/restore',
              offlinemeterfile.OfflineMeterFileRestore())

api.add_route('/points',
              point.PointCollection())
api.add_route('/points/{id_}',
              point.PointItem())

api.add_route('/privileges',
              privilege.PrivilegeCollection())
api.add_route('/privileges/{id_}',
              privilege.PrivilegeItem())

api.add_route('/rules',
              rule.RuleCollection())
api.add_route('/rules/{id_}',
              rule.RuleItem())

api.add_route('/sensors',
              sensor.SensorCollection())
api.add_route('/sensors/{id_}',
              sensor.SensorItem())
api.add_route('/sensors/{id_}/points',
              sensor.SensorPointCollection())
api.add_route('/sensors/{id_}/points/{pid}',
              sensor.SensorPointItem())

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
api.add_route('/spaces/{id_}/equipments',
              space.SpaceEquipmentCollection())
api.add_route('/spaces/{id_}/equipments/{eid}',
              space.SpaceEquipmentItem())
api.add_route('/spaces/{id_}/meters',
              space.SpaceMeterCollection())
api.add_route('/spaces/{id_}/meters/{mid}',
              space.SpaceMeterItem())

# Get energy categories of all meters in the space tree
api.add_route('/spaces/{id_}/treemetersenergycategories',
              space.SpaceTreeMetersEnergyCategoryCollection())

api.add_route('/spaces/{id_}/offlinemeters',
              space.SpaceOfflineMeterCollection())
api.add_route('/spaces/{id_}/offlinemeters/{mid}',
              space.SpaceOfflineMeterItem())
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

api.add_route('/storetypes',
              storetype.StoreTypeCollection())
api.add_route('/storetypes/{id_}',
              storetype.StoreTypeItem())

api.add_route('/tariffs',
              tariff.TariffCollection())
api.add_route('/tariffs/{id_}',
              tariff.TariffItem())

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

api.add_route('/tenanttypes',
              tenanttype.TenantTypeCollection())
api.add_route('/tenanttypes/{id_}',
              tenanttype.TenantTypeItem())

api.add_route('/textmessages',
              textmessage.TextMessageCollection())
api.add_route('/textmessages/{id_}',
              textmessage.TextMessageItem())

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

api.add_route('/virtualmeters',
              virtualmeter.VirtualMeterCollection())
api.add_route('/virtualmeters/{id_}',
              virtualmeter.VirtualMeterItem())

api.add_route('/webmessages',
              webmessage.WebMessageCollection())
api.add_route('/webmessagesnew',
              webmessage.WebMessageStatusNewCollection())
api.add_route('/webmessages/{id_}',
              webmessage.WebMessageItem())

api.add_route('/wechatmessages',
              wechatmessage.WechatMessageCollection())
api.add_route('/wechatmessages/{id_}',
              wechatmessage.WechatMessageItem())

api.add_route('/version',
              version.VersionItem())


########################################################################################################################
# Routes for Reports
########################################################################################################################
api.add_route('/reports/advancedreports',
              advancedreport.AdvancedReportCollection())
api.add_route('/reports/advancedreports/{id_}',
              advancedreport.AdvancedReportItem())
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
api.add_route('/reports/combinedequipmentstatistics',
              combinedequipmentstatistics.Reporting())
api.add_route('/reports/dashboard',
              dashboard.Reporting())
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
api.add_route('/reports/equipmentstatistics',
              equipmentstatistics.Reporting())
api.add_route('/reports/equipmenttracking',
              equipmenttracking.Reporting())
api.add_route('/reports/fddfault',
              fddfault.Reporting())
api.add_route('/reports/meterbatch',
              meterbatch.Reporting())
api.add_route('/reports/metercarbon',
              metercarbon.Reporting())
api.add_route('/reports/metercomparison',
              metercomparison.Reporting())
api.add_route('/reports/metercost',
              metercost.Reporting())
api.add_route('/reports/meterenergy',
              meterenergy.Reporting())
api.add_route('/reports/meterrealtime',
              meterrealtime.Reporting())
api.add_route('/reports/metersaving',
              metersaving.Reporting())
api.add_route('/reports/metersubmetersbalance',
              metersubmetersbalance.Reporting())
api.add_route('/reports/metertrend',
              metertrend.Reporting())
api.add_route('/reports/metertracking',
              metertracking.Reporting())
api.add_route('/reports/offlinemeterbatch',
              offlinemeterbatch.Reporting())
api.add_route('/reports/offlinemetercarbon',
              offlinemetercarbon.Reporting())
api.add_route('/reports/offlinemetercost',
              offlinemetercost.Reporting())
api.add_route('/reports/offlinemeterenergy',
              offlinemeterenergy.Reporting())
api.add_route('/reports/offlinemetersaving',
              offlinemetersaving.Reporting())
api.add_route('/reports/shopfloorcarbon',
              shopfloorcarbon.Reporting())
api.add_route('/reports/shopfloorcost',
              shopfloorcost.Reporting())
api.add_route('/reports/shopfloorenergycategory',
              shopfloorenergycategory.Reporting())
api.add_route('/reports/shopfloorenergyitem',
              shopfloorenergyitem.Reporting())
api.add_route('/reports/shopfloorload',
              shopfloorload.Reporting())
api.add_route('/reports/shopfloorsaving',
              shopfloorsaving.Reporting())
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
api.add_route('/reports/spacestatistics',
              spacestatistics.Reporting())
api.add_route('/reports/storebatch',
              storebatch.Reporting())
api.add_route('/reports/storecarbon',
              storecarbon.Reporting())
api.add_route('/reports/storecost',
              storecost.Reporting())
api.add_route('/reports/storeenergycategory',
              storeenergycategory.Reporting())
api.add_route('/reports/storeenergyitem',
              storeenergyitem.Reporting())
api.add_route('/reports/storeload',
              storeload.Reporting())
api.add_route('/reports/storesaving',
              storesaving.Reporting())
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
api.add_route('/reports/tenantenergycategory',
              tenantenergycategory.Reporting())
api.add_route('/reports/tenantenergyitem',
              tenantenergyitem.Reporting())
api.add_route('/reports/tenantload',
              tenantload.Reporting())
api.add_route('/reports/tenantsaving',
              tenantsaving.Reporting())
api.add_route('/reports/tenantstatistics',
              tenantstatistics.Reporting())
api.add_route('/reports/virtualmeterbatch',
              virtualmeterbatch.Reporting())
api.add_route('/reports/virtualmetersaving',
              virtualmetersaving.Reporting())
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


# from waitress import serve
# serve(api, host='0.0.0.0', port=8886)
