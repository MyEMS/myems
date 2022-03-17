import React from 'react';
import NumberStatsAndCharts from './NumberStatsAndCharts';
import TablesFilesAndLists from './TablesFilesAndLists';
import EcommerceWidgets from './EcommerceWidgets';
import UsersAndFeed from './UsersAndFeed';
import Errors from './Errors';
import Forms from './Forms';
import Others from './Others';

const Widgets = () => (
  <>
    <NumberStatsAndCharts />
    <TablesFilesAndLists />
    <EcommerceWidgets />
    <UsersAndFeed />
    <Errors />
    <Forms />
    <Others />
  </>
);

export default Widgets;
