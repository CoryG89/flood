import React from 'react';

import ClientStats from '../sidebar/TransferData';
import CustomScrollbars from '../ui/CustomScrollbars';
import SearchBox from '../forms/SearchBox';
import SpeedLimitDropdown from '../sidebar/SpeedLimitDropdown';
import StatusFilters from '../sidebar/StatusFilters';
import TrackerFilters from '../sidebar/TrackerFilters';

class Sidebar extends React.Component {
  render() {
    return (
      <CustomScrollbars className="application__sidebar" inverted={true}>
        <SpeedLimitDropdown />
        <ClientStats />
        <SearchBox />
        <StatusFilters />
        <TrackerFilters />
      </CustomScrollbars>
    );
  }
}

export default Sidebar;